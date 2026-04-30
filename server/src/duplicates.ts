import type { PrismaClient } from "@prisma/client";
import { normalizeMovieDuplicateKey } from "./parseFilename.js";

export type DuplicateGroupKind = "title_year" | "tmdb_id" | "episode_slot";

export type DuplicateLibraryItem = {
  id: string;
  name: string;
  year: string | null;
  filePath: string;
  folderPath: string;
  mediaKind: string;
  tmdbId: number | null;
  seasonNumber: number | null;
  episodeNumber: number | null;
  seriesId: string | null;
  seriesTitle: string | null;
};

export type DuplicateLibraryGroup = {
  kind: DuplicateGroupKind;
  label: string;
  items: DuplicateLibraryItem[];
};

function sortItems(a: DuplicateLibraryItem, b: DuplicateLibraryItem): number {
  return a.filePath.localeCompare(b.filePath, undefined, { sensitivity: "base" });
}

function mapMovieRow(m: {
  id: string;
  name: string;
  year: string | null;
  filePath: string;
  folderPath: string;
  mediaKind: string;
  tmdbId: number | null;
  seasonNumber: number | null;
  episodeNumber: number | null;
  seriesId: string | null;
  series: { title: string } | null;
}): DuplicateLibraryItem {
  return {
    id: m.id,
    name: m.name,
    year: m.year,
    filePath: m.filePath,
    folderPath: m.folderPath,
    mediaKind: m.mediaKind,
    tmdbId: m.tmdbId,
    seasonNumber: m.seasonNumber,
    episodeNumber: m.episodeNumber,
    seriesId: m.seriesId,
    seriesTitle: m.series?.title ?? null,
  };
}

export async function findLibraryDuplicates(prisma: PrismaClient): Promise<{
  groups: DuplicateLibraryGroup[];
  duplicateRowCount: number;
}> {
  const movies = await prisma.movie.findMany({
    where: { mediaKind: "movie", needsRename: false },
    select: {
      id: true,
      name: true,
      year: true,
      filePath: true,
      folderPath: true,
      mediaKind: true,
      tmdbId: true,
      seasonNumber: true,
      episodeNumber: true,
      seriesId: true,
      series: { select: { title: true } },
    },
  });

  const episodes = await prisma.movie.findMany({
    where: {
      mediaKind: "episode",
      seriesId: { not: null },
      seasonNumber: { not: null },
      episodeNumber: { not: null },
      needsRename: false,
      series: { needsRename: false },
    },
    select: {
      id: true,
      name: true,
      year: true,
      filePath: true,
      folderPath: true,
      mediaKind: true,
      tmdbId: true,
      seasonNumber: true,
      episodeNumber: true,
      seriesId: true,
      series: { select: { title: true } },
    },
  });

  const groups: DuplicateLibraryGroup[] = [];

  const byTitleYear = new Map<string, typeof movies>();
  for (const m of movies) {
    const key = normalizeMovieDuplicateKey(m.name, m.year);
    const bucket = byTitleYear.get(key);
    if (bucket) bucket.push(m);
    else byTitleYear.set(key, [m]);
  }
  for (const [, rows] of byTitleYear) {
    if (rows.length < 2) continue;
    rows.sort((a, b) => a.filePath.localeCompare(b.filePath));
    const sample = rows[0];
    const yr = sample.year?.trim() ? ` (${sample.year})` : "";
    groups.push({
      kind: "title_year",
      label: `${sample.name}${yr}`,
      items: rows.map(mapMovieRow),
    });
  }

  const byTmdb = new Map<number, typeof movies>();
  for (const m of movies) {
    if (m.tmdbId == null) continue;
    const bucket = byTmdb.get(m.tmdbId);
    if (bucket) bucket.push(m);
    else byTmdb.set(m.tmdbId, [m]);
  }
  for (const [tid, rows] of byTmdb) {
    if (rows.length < 2) continue;
    rows.sort((a, b) => a.filePath.localeCompare(b.filePath));
    groups.push({
      kind: "tmdb_id",
      label: `TMDb movie #${tid}`,
      items: rows.map(mapMovieRow),
    });
  }

  const byEpisodeSlot = new Map<string, typeof episodes>();
  for (const ep of episodes) {
    const sid = ep.seriesId!;
    const slot = `${sid}:${ep.seasonNumber}:${ep.episodeNumber}`;
    const bucket = byEpisodeSlot.get(slot);
    if (bucket) bucket.push(ep);
    else byEpisodeSlot.set(slot, [ep]);
  }
  for (const [, rows] of byEpisodeSlot) {
    if (rows.length < 2) continue;
    rows.sort((a, b) => a.filePath.localeCompare(b.filePath));
    const sample = rows[0];
    const st = sample.series?.title ?? "Series";
    const sn = sample.seasonNumber!;
    const en = sample.episodeNumber!;
    groups.push({
      kind: "episode_slot",
      label: `${st} · S${String(sn).padStart(2, "0")}E${String(en).padStart(2, "0")}`,
      items: rows.map(mapMovieRow),
    });
  }

  groups.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
  for (const g of groups) {
    g.items.sort(sortItems);
  }

  const ids = new Set<string>();
  for (const g of groups) {
    for (const it of g.items) ids.add(it.id);
  }

  return { groups, duplicateRowCount: ids.size };
}
