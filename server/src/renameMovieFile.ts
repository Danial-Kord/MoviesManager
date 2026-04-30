import { rename, stat } from "fs/promises";
import { dirname, join, relative, resolve, sep } from "path";
import type { PrismaClient } from "@prisma/client";
import {
  isVideoFile,
  normalizeSeriesKey,
  parseVideoFile,
  type ParsedVideoFile,
} from "./parseFilename.js";

function isPathInsideLibraryRoot(childAbs: string, rootAbs: string): boolean {
  const root = resolve(rootAbs);
  const child = resolve(childAbs);
  if (child === root) return true;
  const rel = relative(root, child);
  return rel !== "" && !rel.startsWith("..") && !rel.includes(`${sep}..`);
}

async function assertUnderConfiguredLibrary(prisma: PrismaClient, absPath: string): Promise<void> {
  const resolved = resolve(absPath);
  const roots = await prisma.libraryPath.findMany();
  if (roots.length === 0) {
    throw new Error("Add at least one library folder in Settings before renaming.");
  }
  for (const r of roots) {
    if (isPathInsideLibraryRoot(resolved, r.path)) return;
  }
  throw new Error("File path is outside configured library folders.");
}

/** User-supplied new filename only (no folders). */
export function sanitizeVideoBasename(raw: string): string | null {
  let s = raw.trim();
  s = s.replace(/[/\\]/g, "").replace(/^:+/, "");
  if (!s || s === "." || s === "..") return null;
  if (!isVideoFile(s)) return null;
  return s;
}

const clearedMovieMeta = {
  enrichmentState: "none" as const,
  needsRename: false,
  tmdbId: null,
  tmdbSearchJson: null,
  tmdbDetailsJson: null,
  tmdbCreditsJson: null,
  summary: null,
  fullSummary: null,
  actors: null,
  directors: null,
  genre: null,
  imdbRating: null,
  imdbScore: null,
  numberOfVotes: null,
  duration: null,
  imagePath: null,
  posterBytes: null,
};

function applyParsedToMovieUpdate(parsed: ParsedVideoFile, newPath: string): Record<string, unknown> {
  const folderPath = dirname(newPath);
  if (parsed.kind === "movie") {
    return {
      filePath: newPath,
      folderPath,
      name: parsed.displayName,
      year: parsed.year || null,
      mediaKind: "movie",
      seriesId: null,
      seasonNumber: null,
      episodeNumber: null,
      episodeTitle: null,
      dubbed: parsed.dubbed,
      ...clearedMovieMeta,
    };
  }
  return {
    filePath: newPath,
    folderPath,
    name: parsed.displayNameForRow,
    year: parsed.year || null,
    mediaKind: "episode",
    seasonNumber: parsed.season,
    episodeNumber: parsed.episode,
    episodeTitle: parsed.episodeTitle,
    dubbed: parsed.dubbed,
    ...clearedMovieMeta,
  };
}

/**
 * Renames the video file on disk (same folder) and updates the Movie row + episode series linkage like scan.
 */
export async function renameMovieVideoOnDisk(
  prisma: PrismaClient,
  movieId: string,
  newFileName: string
): Promise<{ id: string }> {
  const basename = sanitizeVideoBasename(newFileName);
  if (!basename) {
    throw new Error("Enter a valid video filename with an allowed extension (e.g. .mkv, .mp4).");
  }

  const m = await prisma.movie.findUnique({ where: { id: movieId } });
  if (!m) {
    throw new Error("Movie not found.");
  }

  const oldPath = resolve(m.filePath);
  await assertUnderConfiguredLibrary(prisma, oldPath);

  const dir = dirname(oldPath);
  const newPath = resolve(join(dir, basename));

  if (relative(dir, newPath).startsWith("..")) {
    throw new Error("Invalid destination path.");
  }

  if (resolve(dirname(newPath)) !== resolve(dir)) {
    throw new Error("Renaming must keep the file in the same folder.");
  }

  await assertUnderConfiguredLibrary(prisma, newPath);

  const parsed = parseVideoFile(newPath);
  if (!parsed) {
    throw new Error("Could not parse renamed path — check the filename.");
  }

  try {
    await stat(oldPath);
  } catch {
    throw new Error("Original file is missing on disk.");
  }

  let destExists = false;
  try {
    await stat(newPath);
    destExists = true;
  } catch (e: unknown) {
    const err = e as NodeJS.ErrnoException;
    if (err?.code !== "ENOENT") throw e;
  }
  if (destExists) {
    throw new Error("A file with that name already exists in this folder.");
  }

  await rename(oldPath, newPath);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.titleCredit.deleteMany({ where: { movieId: m.id } });
      if (parsed.kind === "episode") {
        const key = normalizeSeriesKey(parsed.seriesTitle, parsed.year);
        const series = await tx.tvSeries.upsert({
          where: { normalizedKey: key },
          create: {
            normalizedKey: key,
            title: parsed.seriesTitle,
            year: parsed.year || null,
          },
          update: {
            title: parsed.seriesTitle,
            ...(parsed.year ? { year: parsed.year } : {}),
          },
        });
        await tx.movie.update({
          where: { id: m.id },
          data: {
            ...applyParsedToMovieUpdate(parsed, newPath),
            seriesId: series.id,
          } as import("@prisma/client").Prisma.MovieUpdateInput,
        });
      } else {
        await tx.movie.update({
          where: { id: m.id },
          data: applyParsedToMovieUpdate(parsed, newPath) as import("@prisma/client").Prisma.MovieUpdateInput,
        });
      }

      await tx.tvSeries.deleteMany({
        where: { episodes: { none: {} } },
      });
    });
  } catch (e) {
    try {
      await rename(newPath, oldPath);
    } catch {
      /* best-effort rollback */
    }
    throw e;
  }

  return { id: m.id };
}
