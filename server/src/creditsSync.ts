import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import type { Prisma, PrismaClient } from "@prisma/client";
import { IMAGES_DIR } from "./config.js";

const PROFILE_TMDB_SIZE = "w185";
const TMDB_PROFILE_BASE = `https://image.tmdb.org/t/p/${PROFILE_TMDB_SIZE}`;

export const MAX_CAST_CREDITS = 18;

export type ExtractedCreditPerson = {
  tmdbPersonId: number;
  name: string;
  profilePath: string | null;
  character: string | null;
};

async function fetchProfileBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("profile fetch failed");
  return Buffer.from(await res.arrayBuffer());
}

async function tryWriteProfileToDisk(tmdbPersonId: number, buf: Buffer): Promise<string | null> {
  try {
    await mkdir(join(IMAGES_DIR, "profiles"), { recursive: true });
    const dest = join(IMAGES_DIR, "profiles", `person-${tmdbPersonId}.jpg`);
    await writeFile(dest, buf);
    return dest;
  } catch {
    return null;
  }
}

export function extractCastAndDirectors(
  credits: Record<string, unknown>,
  tvDetails?: Record<string, unknown> | null
): { cast: ExtractedCreditPerson[]; directors: ExtractedCreditPerson[] } {
  const cast: ExtractedCreditPerson[] = [];
  const rawCast = credits.cast;
  if (Array.isArray(rawCast)) {
    let order = 0;
    for (const item of rawCast) {
      if (order >= MAX_CAST_CREDITS) break;
      const row = item as {
        id?: number;
        name?: string;
        profile_path?: string | null;
        character?: string | null;
      };
      if (typeof row.id !== "number" || !row.name) continue;
      cast.push({
        tmdbPersonId: row.id,
        name: row.name,
        profilePath: typeof row.profile_path === "string" ? row.profile_path : null,
        character: typeof row.character === "string" ? row.character : null,
      });
      order++;
    }
  }

  const directors: ExtractedCreditPerson[] = [];
  const seenDir = new Set<number>();

  const crew = credits.crew;
  if (Array.isArray(crew)) {
    for (const item of crew) {
      const row = item as {
        id?: number;
        job?: string;
        name?: string;
        profile_path?: string | null;
      };
      if (row.job !== "Director" || typeof row.id !== "number" || !row.name) continue;
      if (seenDir.has(row.id)) continue;
      seenDir.add(row.id);
      directors.push({
        tmdbPersonId: row.id,
        name: row.name,
        profilePath: typeof row.profile_path === "string" ? row.profile_path : null,
        character: null,
      });
    }
  }

  if (tvDetails) {
    const cb = tvDetails.created_by;
    if (Array.isArray(cb)) {
      for (const item of cb) {
        const row = item as { id?: number; name?: string; profile_path?: string | null };
        if (typeof row.id !== "number" || !row.name) continue;
        if (seenDir.has(row.id)) continue;
        seenDir.add(row.id);
        directors.push({
          tmdbPersonId: row.id,
          name: row.name,
          profilePath: typeof row.profile_path === "string" ? row.profile_path : null,
          character: null,
        });
      }
    }
  }

  return { cast, directors };
}

async function upsertPersonWithProfile(
  tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">,
  p: ExtractedCreditPerson
): Promise<{ id: string }> {
  let profileBytes: Uint8Array | null = null;
  let profileImagePath: string | null = null;
  if (p.profilePath) {
    try {
      const buf = await fetchProfileBuffer(`${TMDB_PROFILE_BASE}${p.profilePath}`);
      profileBytes = new Uint8Array(Buffer.from(buf));
      profileImagePath = await tryWriteProfileToDisk(p.tmdbPersonId, buf);
    } catch {
      /* keep existing image on update when refetch fails */
    }
  }

  const existing = await tx.person.findUnique({ where: { tmdbPersonId: p.tmdbPersonId } });

  const updateData: Prisma.PersonUpdateInput = { name: p.name };
  if (profileBytes && profileBytes.byteLength > 0) {
    updateData.profileBytes = profileBytes as unknown as Uint8Array<ArrayBuffer>;
    updateData.profileImagePath = profileImagePath ?? existing?.profileImagePath ?? null;
  }

  const row = await tx.person.upsert({
    where: { tmdbPersonId: p.tmdbPersonId },
    create: {
      tmdbPersonId: p.tmdbPersonId,
      name: p.name,
      profileBytes: (profileBytes ?? null) as Uint8Array<ArrayBuffer> | null,
      profileImagePath,
    },
    update: updateData,
  });
  return { id: row.id };
}

export async function syncTitleCreditsFromTmdb(
  prisma: PrismaClient,
  opts: {
    movieId?: string;
    tvSeriesId?: string;
    credits: Record<string, unknown>;
    tvDetails?: Record<string, unknown> | null;
  }
): Promise<void> {
  const { movieId, tvSeriesId, credits, tvDetails } = opts;
  if ((!movieId && !tvSeriesId) || (movieId && tvSeriesId)) {
    throw new Error("syncTitleCreditsFromTmdb: pass exactly one of movieId or tvSeriesId");
  }

  const { cast, directors } = extractCastAndDirectors(credits, tvDetails ?? undefined);

  await prisma.$transaction(async (tx) => {
    if (movieId) {
      await tx.titleCredit.deleteMany({ where: { movieId } });
    } else {
      await tx.titleCredit.deleteMany({ where: { tvSeriesId } });
    }

    let sortOrder = 0;
    for (const c of cast) {
      const person = await upsertPersonWithProfile(tx, c);
      await tx.titleCredit.create({
        data: {
          movieId: movieId ?? null,
          tvSeriesId: tvSeriesId ?? null,
          personId: person.id,
          creditKind: "cast",
          sortOrder,
          character: c.character,
        },
      });
      sortOrder++;
    }

    sortOrder = 0;
    for (const d of directors) {
      const person = await upsertPersonWithProfile(tx, d);
      await tx.titleCredit.create({
        data: {
          movieId: movieId ?? null,
          tvSeriesId: tvSeriesId ?? null,
          personId: person.id,
          creditKind: "director",
          sortOrder,
          character: null,
        },
      });
      sortOrder++;
    }
  });
}

export function toCreditPersonDto(
  person: {
    tmdbPersonId: number;
    name: string;
    profileImagePath: string | null;
    profileBytes: Uint8Array | null;
  },
  character: string | null
): {
  tmdbPersonId: number;
  name: string;
  character: string | null;
  photoAvailable: boolean;
} {
  const bytesLen = person.profileBytes != null ? person.profileBytes.byteLength : 0;
  return {
    tmdbPersonId: person.tmdbPersonId,
    name: person.name,
    character,
    photoAvailable: Boolean(person.profileImagePath) || bytesLen > 0,
  };
}
