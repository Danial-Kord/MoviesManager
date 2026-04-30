import cors from "cors";
import express from "express";
import { spawnSync } from "child_process";
import { createReadStream, stat as statCb } from "fs";
import { dirname, extname, join, resolve } from "path";
import { stat, unlink } from "fs/promises";
import { pipeline } from "stream/promises";
import { promisify } from "util";
import { lookup } from "mime-types";
import { fileURLToPath } from "url";
import { API_HOST, API_PORT, DATA_DIR, IMAGES_DIR, TMDB_API_KEY, TMDB_IMAGE_BASE, getSqliteDatabaseFilePath } from "./config.js";
import { prisma } from "./prisma.js";
import { collectVideoFiles, pathExists } from "./scan.js";
import {
  enrichTvSeriesWithTmdb,
  enrichWithTmdb,
  fetchPosterForStorage,
  resolvePosterForEnrichment,
  tryHydrateMovieEnrichmentFromRow,
  tryHydrateTvEnrichmentFromRow,
} from "./tmdb.js";
import { findLibraryDuplicates } from "./duplicates.js";
import { omitTmdbFetchSnapshots, stripMovieRowForApi } from "./omitTmdbPayload.js";
import { renameMovieVideoOnDisk } from "./renameMovieFile.js";
import { syncTitleCreditsFromTmdb, toCreditPersonDto } from "./creditsSync.js";
import { openFileWithDefaultApp } from "./openLocal.js";
import {
  compileDubbedRulesToCache,
  isDubbedFromPath,
  LIBRARY_SETTINGS_ROW_ID,
  refreshUserDubbedRules,
  validateAndNormalizeDubbedRules,
} from "./parseFilename.js";
import { parseLocaleFromRequest, resolveSummaryForLocale } from "./summaryLocale.js";

const statAsync = promisify(statCb);

function jsonRecord(v: unknown): Record<string, unknown> {
  return JSON.parse(JSON.stringify(v ?? {})) as Record<string, unknown>;
}

async function syncCreditsSafe(opts: {
  movieId?: string;
  tvSeriesId?: string;
  credits: Record<string, unknown>;
  tvDetails?: Record<string, unknown> | null;
}) {
  try {
    await syncTitleCreditsFromTmdb(prisma, opts);
  } catch (e) {
    console.warn("[credits sync]", (e as Error).message);
  }
}

async function creditsPayloadForMovie(movieId: string): Promise<{
  cast: ReturnType<typeof toCreditPersonDto>[];
  directors: ReturnType<typeof toCreditPersonDto>[];
}> {
  const [castRows, directorRows] = await Promise.all([
    prisma.titleCredit.findMany({
      where: { movieId, creditKind: "cast" },
      orderBy: { sortOrder: "asc" },
      include: {
        person: { select: { tmdbPersonId: true, name: true, profileImagePath: true, profileBytes: true } },
      },
    }),
    prisma.titleCredit.findMany({
      where: { movieId, creditKind: "director" },
      orderBy: { sortOrder: "asc" },
      include: {
        person: { select: { tmdbPersonId: true, name: true, profileImagePath: true, profileBytes: true } },
      },
    }),
  ]);
  return {
    cast: castRows.map((r) => toCreditPersonDto(r.person, r.character)),
    directors: directorRows.map((r) => toCreditPersonDto(r.person, null)),
  };
}

async function creditsPayloadForSeries(tvSeriesId: string): Promise<{
  cast: ReturnType<typeof toCreditPersonDto>[];
  directors: ReturnType<typeof toCreditPersonDto>[];
}> {
  const [castRows, directorRows] = await Promise.all([
    prisma.titleCredit.findMany({
      where: { tvSeriesId, creditKind: "cast" },
      orderBy: { sortOrder: "asc" },
      include: {
        person: { select: { tmdbPersonId: true, name: true, profileImagePath: true, profileBytes: true } },
      },
    }),
    prisma.titleCredit.findMany({
      where: { tvSeriesId, creditKind: "director" },
      orderBy: { sortOrder: "asc" },
      include: {
        person: { select: { tmdbPersonId: true, name: true, profileImagePath: true, profileBytes: true } },
      },
    }),
  ]);
  return {
    cast: castRows.map((r) => toCreditPersonDto(r.person, r.character)),
    directors: directorRows.map((r) => toCreditPersonDto(r.person, null)),
  };
}

const RESET_DATABASE_CONFIRM = "RESET_LIBRARY_DATABASE";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "50mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, tmdb: Boolean(TMDB_API_KEY) });
});

app.get("/api/database/info", (_req, res) => {
  try {
    const databaseFile = getSqliteDatabaseFilePath();
    res.json({ databaseFile, dataDir: DATA_DIR, imagesDir: IMAGES_DIR });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.post("/api/database/reset", async (req, res) => {
  const { confirm } = req.body as { confirm?: string };
  if (confirm !== RESET_DATABASE_CONFIRM) {
    res.status(400).json({
      error: `Send JSON body { "confirm": "${RESET_DATABASE_CONFIRM}" } to erase the library database.`,
    });
    return;
  }

  const dbPath = getSqliteDatabaseFilePath();
  const serverRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

  try {
    await prisma.$disconnect();
  } catch {
    /* ignore */
  }

  for (const suf of ["", "-wal", "-shm"] as const) {
    try {
      await unlink(dbPath + suf);
    } catch {
      /* missing */
    }
  }

  const push = spawnSync("npx", ["prisma", "db", "push"], {
    cwd: serverRoot,
    shell: true,
    encoding: "utf-8",
    env: { ...process.env },
  });

  if (push.status !== 0) {
    try {
      await prisma.$connect();
    } catch {
      /* ignore */
    }
    const msg = [push.stderr, push.stdout].filter(Boolean).join("\n").trim() || "prisma db push failed";
    res.status(500).json({ error: msg });
    return;
  }

  try {
    await prisma.$connect();
  } catch (e) {
    res.status(500).json({ error: `Database recreated but reconnect failed: ${(e as Error).message}` });
    return;
  }

  res.json({ ok: true, databaseFile: dbPath });
});

// --- library paths
app.get("/api/paths", async (_req, res) => {
  const rows = await prisma.libraryPath.findMany({ orderBy: { createdAt: "asc" } });
  res.json(rows);
});

app.post("/api/paths", async (req, res) => {
  const { path: p } = req.body as { path?: string };
  if (!p || typeof p !== "string") {
    res.status(400).json({ error: "path required" });
    return;
  }
  const normalized = resolve(p);
  if (!(await pathExists(normalized))) {
    res.status(400).json({ error: "path not found" });
    return;
  }
  try {
    const row = await prisma.libraryPath.create({ data: { path: normalized } });
    res.json(row);
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === "P2002") {
      res.status(409).json({ error: "path already added" });
      return;
    }
    throw e;
  }
});

app.delete("/api/paths/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.libraryPath.delete({ where: { id } });
  res.json({ ok: true });
});

// --- library settings (singleton SQLite row)
app.get("/api/settings/library", async (_req, res) => {
  try {
    const row = await prisma.librarySettings.upsert({
      where: { id: LIBRARY_SETTINGS_ROW_ID },
      create: { id: LIBRARY_SETTINGS_ROW_ID, dubbedRules: [] },
      update: {},
    });
    const parsed = validateAndNormalizeDubbedRules(row.dubbedRules);
    res.json({ dubbedRules: parsed.ok ? parsed.rules : [] });
  } catch (e: unknown) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.patch("/api/settings/library", async (req, res) => {
  try {
    const raw = (req.body as { dubbedRules?: unknown })?.dubbedRules;
    const parsed = validateAndNormalizeDubbedRules(raw ?? []);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const compiled = compileDubbedRulesToCache(parsed.rules);
    if (!compiled.ok) {
      res.status(400).json({ error: compiled.error });
      return;
    }
    await prisma.librarySettings.upsert({
      where: { id: LIBRARY_SETTINGS_ROW_ID },
      create: { id: LIBRARY_SETTINGS_ROW_ID, dubbedRules: parsed.rules },
      update: { dubbedRules: parsed.rules },
    });
    res.json({ dubbedRules: parsed.rules });
  } catch (e: unknown) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.post("/api/library/recompute-dubbed", async (_req, res) => {
  try {
    const BATCH = 250;
    let skip = 0;
    let rowsUpdated = 0;
    let rowsChecked = 0;
    for (;;) {
      const batch = await prisma.movie.findMany({
        skip,
        take: BATCH,
        orderBy: { id: "asc" },
        select: { id: true, filePath: true, dubbed: true },
      });
      if (batch.length === 0) break;
      rowsChecked += batch.length;
      skip += batch.length;
      for (const m of batch) {
        const next = isDubbedFromPath(m.filePath);
        if (next !== m.dubbed) {
          await prisma.movie.update({ where: { id: m.id }, data: { dubbed: next } });
          rowsUpdated++;
        }
      }
    }
    res.json({ ok: true, rowsChecked, rowsUpdated });
  } catch (e: unknown) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// --- scan (NDJSON stream: progress lines + final complete)
app.post("/api/scan", async (_req, res) => {
  res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("X-Accel-Buffering", "no");

  const send = (obj: unknown) => {
    res.write(JSON.stringify(obj) + "\n");
  };

  try {
    const paths = await prisma.libraryPath.findMany();
    const pathsTotal = paths.length;
    const discovered: import("./scan.js").ScannedFile[] = [];

    if (pathsTotal === 0) {
      send({
        type: "progress",
        job: "scan",
        scanPhase: "discover",
        pathsDone: 0,
        pathsTotal: 0,
        filesDiscovered: 0,
        percent: 35,
      });
    }

    for (let i = 0; i < paths.length; i++) {
      const row = paths[i];
      if (await pathExists(row.path)) {
        const batch = await collectVideoFiles(row.path);
        discovered.push(...batch);
      }
      send({
        type: "progress",
        job: "scan",
        scanPhase: "discover",
        pathsDone: i + 1,
        pathsTotal,
        filesDiscovered: discovered.length,
        percent: pathsTotal ? Math.round(((i + 1) / pathsTotal) * 35) : 100,
      });
    }

    let moviesUpserted = 0;
    let episodesUpserted = 0;
    const { normalizeSeriesKey } = await import("./parseFilename.js");
    const filesTotal = discovered.length;
    const emitEvery = Math.max(1, Math.ceil(filesTotal / 80));

    const emitImport = (filesDone: number) => {
      const pct = filesTotal === 0 ? 100 : 35 + Math.round((filesDone / filesTotal) * 65);
      send({
        type: "progress",
        job: "scan",
        scanPhase: "import",
        pathsDone: pathsTotal,
        pathsTotal,
        filesDiscovered: filesTotal,
        filesDone,
        filesTotal,
        percent: Math.min(100, pct),
      });
    };

    for (let fi = 0; fi < discovered.length; fi++) {
      const f = discovered[fi];
      if (f.parsed.kind === "movie") {
        await prisma.movie.upsert({
          where: { filePath: f.filePath },
          create: {
            name: f.parsed.displayName,
            year: f.parsed.year || null,
            filePath: f.filePath,
            folderPath: f.folderPath,
            mediaKind: "movie",
            enrichmentState: "none",
            dubbed: f.parsed.dubbed,
          },
          update: {
            name: f.parsed.displayName,
            year: f.parsed.year || null,
            folderPath: f.folderPath,
            mediaKind: "movie",
            seriesId: null,
            seasonNumber: null,
            episodeNumber: null,
            episodeTitle: null,
            dubbed: f.parsed.dubbed,
          },
        });
        moviesUpserted++;
      } else {
        const key = normalizeSeriesKey(f.parsed.seriesTitle, f.parsed.year);
        const series = await prisma.tvSeries.upsert({
          where: { normalizedKey: key },
          create: {
            normalizedKey: key,
            title: f.parsed.seriesTitle,
            year: f.parsed.year || null,
          },
          update: {
            title: f.parsed.seriesTitle,
            ...(f.parsed.year ? { year: f.parsed.year } : {}),
          },
        });
        await prisma.movie.upsert({
          where: { filePath: f.filePath },
          create: {
            name: f.parsed.displayNameForRow,
            year: f.parsed.year || null,
            filePath: f.filePath,
            folderPath: f.folderPath,
            mediaKind: "episode",
            seriesId: series.id,
            seasonNumber: f.parsed.season,
            episodeNumber: f.parsed.episode,
            episodeTitle: f.parsed.episodeTitle,
            enrichmentState: "none",
            dubbed: f.parsed.dubbed,
          },
          update: {
            name: f.parsed.displayNameForRow,
            year: f.parsed.year || null,
            folderPath: f.folderPath,
            mediaKind: "episode",
            seriesId: series.id,
            seasonNumber: f.parsed.season,
            episodeNumber: f.parsed.episode,
            episodeTitle: f.parsed.episodeTitle,
            dubbed: f.parsed.dubbed,
          },
        });
        episodesUpserted++;
      }
      const filesDone = fi + 1;
      if (filesDone === filesTotal || filesDone % emitEvery === 0) {
        emitImport(filesDone);
      }
    }
    if (filesTotal === 0) {
      emitImport(0);
    }

    const seriesOrphansRemoved = (
      await prisma.tvSeries.deleteMany({
        where: { episodes: { none: {} } },
      })
    ).count;

    send({
      type: "complete",
      scanned: discovered.length,
      moviesUpserted,
      episodesUpserted,
      seriesOrphansRemoved,
      seriesDistinct: await prisma.tvSeries.count(),
    });
    res.end();
  } catch (e) {
    send({ type: "error", message: (e as Error).message });
    res.end();
  }
});

// --- list movies
app.get("/api/movies", async (req, res) => {
  const q = (req.query as Record<string, string | undefined>) || {};
  const page = Math.max(1, parseInt(q.page ?? "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(q.pageSize ?? "24", 10) || 24));
  const where: import("@prisma/client").Prisma.MovieWhereInput = {};

  if (q.includeEpisodes !== "1") {
    where.mediaKind = "movie";
  }

  if (q.filter === "favorites") where.isFavorite = true;
  if (q.filter === "scored") {
    where.AND = [
      { imdbRating: { not: null } },
      { imdbRating: { not: "" } },
    ];
  }
  if (q.filter === "hidden") where.show = false;
  if (q.filter === "visible") where.show = true;
  if (q.q && q.q.trim()) {
    where.name = { contains: q.q.trim() };
  }
  if (q.genre && q.genre !== "all") {
    where.genre = { contains: q.genre };
  }
  if (q.folder && q.folder !== "all") {
    where.folderPath = { contains: q.folder };
  }
  if (q.yearFrom || q.yearTo) {
    where.year = {};
    if (q.yearFrom) (where.year as { gte?: string }).gte = q.yearFrom;
    if (q.yearTo) (where.year as { lte?: string }).lte = q.yearTo;
  }
  if (q.categoryId) {
    where.categories = { some: { categoryId: q.categoryId } };
  }
  if (q.show === "0") where.show = false;
  if (q.show === "1") where.show = true;

  const sort = q.sort ?? "none";
  const orderBy: import("@prisma/client").Prisma.MovieOrderByWithRelationInput[] = [];
  if (sort === "name") orderBy.push({ name: "asc" });
  else if (sort === "year") orderBy.push({ year: "desc" });
  else if (sort === "score")
    orderBy.push({ imdbRating: "desc" });
  else if (sort === "votes")
    orderBy.push({ numberOfVotes: "desc" });
  else orderBy.push({ updatedAt: "desc" });

  const [total, rows] = await Promise.all([
    prisma.movie.count({ where }),
    prisma.movie.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        categories: { include: { category: true } },
      },
    }),
  ]);
  res.json({
    total,
    page,
    pageSize,
    items: rows.map((row) => ({
      ...omitTmdbFetchSnapshots(row as unknown as Record<string, unknown>),
      posterAvailable: Boolean(row.imagePath || (row.posterBytes != null && row.posterBytes.byteLength > 0)),
    })),
  });
});

/** Distinct genre names from stored TMDb strings (comma-separated), for Home filter dropdown. */
app.get("/api/library/genres", async (_req, res) => {
  try {
    const [movieRows, seriesRows] = await Promise.all([
      prisma.movie.findMany({
        where: { genre: { not: null } },
        select: { genre: true },
      }),
      prisma.tvSeries.findMany({
        where: { genre: { not: null } },
        select: { genre: true },
      }),
    ]);
    const names = new Set<string>();
    const ingest = (g: string | null | undefined) => {
      if (!g) return;
      for (const part of g.split(",")) {
        const trimmed = part.trim();
        if (trimmed) names.add(trimmed);
      }
    };
    for (const r of movieRows) ingest(r.genre);
    for (const r of seriesRows) ingest(r.genre);
    const genres = [...names].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    res.json({ genres });
  } catch (e: unknown) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.get("/api/library/browse", async (req, res) => {
  const q = (req.query as Record<string, string | undefined>) || {};
  const page = Math.max(1, parseInt(q.page ?? "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(q.pageSize ?? "24", 10) || 24));
  const skip = (page - 1) * pageSize;
  const sort = q.sort ?? "none";

  const seriesWhere: import("@prisma/client").Prisma.TvSeriesWhereInput = {};
  const movieWhere: import("@prisma/client").Prisma.MovieWhereInput = { mediaKind: "movie" };

  if (q.filter === "favorites") {
    seriesWhere.isFavorite = true;
    movieWhere.isFavorite = true;
  }
  if (q.filter === "scored") {
    seriesWhere.AND = [
      { imdbRating: { not: null } },
      { imdbRating: { not: "" } },
    ];
    movieWhere.AND = [
      { imdbRating: { not: null } },
      { imdbRating: { not: "" } },
    ];
  }
  if (q.filter === "hidden") {
    seriesWhere.show = false;
    movieWhere.show = false;
  }
  if (q.filter === "visible") {
    seriesWhere.show = true;
    movieWhere.show = true;
  }
  if (q.show === "1") {
    seriesWhere.show = true;
    movieWhere.show = true;
  }
  if (q.show === "0") {
    seriesWhere.show = false;
    movieWhere.show = false;
  }

  if (q.q && q.q.trim()) {
    const qq = q.q.trim();
    seriesWhere.title = { contains: qq };
    movieWhere.name = { contains: qq };
  }
  if (q.genre && q.genre !== "all") {
    seriesWhere.genre = { contains: q.genre };
    movieWhere.genre = { contains: q.genre };
  }
  if (q.folder && q.folder !== "all") {
    movieWhere.folderPath = { contains: q.folder };
  }
  if (q.yearFrom || q.yearTo) {
    seriesWhere.year = {};
    movieWhere.year = {};
    if (q.yearFrom) {
      (seriesWhere.year as { gte?: string }).gte = q.yearFrom;
      (movieWhere.year as { gte?: string }).gte = q.yearFrom;
    }
    if (q.yearTo) {
      (seriesWhere.year as { lte?: string }).lte = q.yearTo;
      (movieWhere.year as { lte?: string }).lte = q.yearTo;
    }
  }
  if (q.categoryId) {
    movieWhere.categories = { some: { categoryId: q.categoryId } };
  }

  const browseKindRaw = (q.browseKind ?? "").toLowerCase();
  const browseKind = browseKindRaw === "movies" || browseKindRaw === "series" ? browseKindRaw : "all";

  type CardStub =
    | {
        cardKind: "series";
        id: string;
        updatedAt: Date;
        title: string;
        year: string | null;
        imdbRating: string | null;
        numberOfVotes: string | null;
      }
    | {
        cardKind: "movie";
        id: string;
        updatedAt: Date;
        name: string;
        year: string | null;
        imdbRating: string | null;
        numberOfVotes: string | null;
      };

  const [seriesList, movieList] = await Promise.all([
    browseKind === "movies"
      ? Promise.resolve(
          [] as Array<{
            id: string;
            updatedAt: Date;
            title: string;
            year: string | null;
            imdbRating: string | null;
            numberOfVotes: string | null;
          }>
        )
      : prisma.tvSeries.findMany({
          where: seriesWhere,
          select: {
            id: true,
            updatedAt: true,
            title: true,
            year: true,
            imdbRating: true,
            numberOfVotes: true,
          },
        }),
    browseKind === "series"
      ? Promise.resolve(
          [] as Array<{
            id: string;
            updatedAt: Date;
            name: string;
            year: string | null;
            imdbRating: string | null;
            numberOfVotes: string | null;
          }>
        )
      : prisma.movie.findMany({
          where: movieWhere,
          select: {
            id: true,
            updatedAt: true,
            name: true,
            year: true,
            imdbRating: true,
            numberOfVotes: true,
          },
        }),
  ]);

  const merged: CardStub[] = [
    ...seriesList.map((s) => ({ cardKind: "series" as const, ...s })),
    ...movieList.map((m) => ({ cardKind: "movie" as const, ...m })),
  ];

  merged.sort((a, b) => {
    if (sort === "name") {
      const an = a.cardKind === "series" ? a.title : a.name;
      const bn = b.cardKind === "series" ? b.title : b.name;
      return an.localeCompare(bn);
    }
    if (sort === "year") {
      const ay = (a.year || "").slice(0, 4);
      const by = (b.year || "").slice(0, 4);
      return by.localeCompare(ay);
    }
    if (sort === "score") {
      const as = parseFloat(a.imdbRating || "0");
      const bs = parseFloat(b.imdbRating || "0");
      return bs - as;
    }
    if (sort === "votes") {
      const av = parseInt(a.numberOfVotes || "0", 10);
      const bv = parseInt(b.numberOfVotes || "0", 10);
      return bv - av;
    }
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  const total = merged.length;
  const slice = merged.slice(skip, skip + pageSize);

  const hydrated = await Promise.all(
    slice.map(async (row) => {
      if (row.cardKind === "series") {
        const s = await prisma.tvSeries.findUnique({
          where: { id: row.id },
          include: { _count: { select: { episodes: true } } },
        });
        if (!s) return null;
        return {
          kind: "series" as const,
          id: s.id,
          title: s.title,
          year: s.year,
          imagePath: s.imagePath,
          posterAvailable: Boolean(s.imagePath || (s.posterBytes != null && s.posterBytes.byteLength > 0)),
          episodeCount: s._count.episodes,
          imdbRating: s.imdbRating,
          isFavorite: s.isFavorite,
          summary: s.summary,
          genre: s.genre,
          updatedAt: s.updatedAt.toISOString(),
          enrichmentState: s.enrichmentState,
          needsRename: s.needsRename,
          isEnriched: s.enrichmentState === "full" && !s.needsRename,
        };
      }
      const m = await prisma.movie.findUnique({
        where: { id: row.id },
        include: {
          categories: { include: { category: true } },
          series: { select: { enrichmentState: true, needsRename: true } },
        },
      });
      if (!m) return null;
      const lite = omitTmdbFetchSnapshots(m as unknown as Record<string, unknown>);
      const posterAvailable = Boolean(
        m.imagePath || (m.posterBytes != null && m.posterBytes.byteLength > 0)
      );
      const isEnriched =
        !m.needsRename &&
        (m.mediaKind === "episode" && m.series
          ? m.series.enrichmentState === "full" && !m.series.needsRename
          : m.enrichmentState === "full");
      return {
        kind: "movie" as const,
        ...lite,
        posterAvailable,
        updatedAt: m.updatedAt.toISOString(),
        isEnriched,
      };
    })
  );

  const items = hydrated.filter(Boolean);
  res.json({ total, page, pageSize, items });
});

app.get("/api/library/duplicates", async (_req, res) => {
  try {
    const data = await findLibraryDuplicates(prisma);
    res.json(data);
  } catch (e: unknown) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.get("/api/library/needs-rename", async (_req, res) => {
  try {
    const [seriesRows, movieRows] = await Promise.all([
      prisma.tvSeries.findMany({
        where: { needsRename: true },
        orderBy: { title: "asc" },
        include: {
          _count: { select: { episodes: true } },
          episodes: {
            take: 12,
            orderBy: [{ seasonNumber: "asc" }, { episodeNumber: "asc" }],
            select: {
              id: true,
              filePath: true,
              folderPath: true,
              seasonNumber: true,
              episodeNumber: true,
            },
          },
        },
      }),
      prisma.movie.findMany({
        where: { mediaKind: "movie", needsRename: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          year: true,
          filePath: true,
          folderPath: true,
        },
      }),
    ]);
    res.json({
      series: seriesRows.map((s) => ({
        id: s.id,
        title: s.title,
        year: s.year,
        episodeCount: s._count.episodes,
        sampleEpisodes: s.episodes,
      })),
      movies: movieRows,
    });
  } catch (e: unknown) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.get("/api/series/:id", async (req, res) => {
  const s = await prisma.tvSeries.findUnique({
    where: { id: req.params.id },
    include: {
      episodes: {
        orderBy: [{ seasonNumber: "asc" }, { episodeNumber: "asc" }],
      },
    },
  });
  if (!s) {
    res.status(404).json({ error: "not found" });
    return;
  }
  const slimEpisodes = s.episodes.map((ep) => omitTmdbFetchSnapshots(ep as unknown as Record<string, unknown>));
  const slimSeries = omitTmdbFetchSnapshots(s as unknown as Record<string, unknown>);
  const extras = await creditsPayloadForSeries(s.id);
  const creditBlocks =
    extras.cast.length > 0 || extras.directors.length > 0
      ? { creditsCast: extras.cast, creditsDirectors: extras.directors }
      : {};
  const locale = parseLocaleFromRequest(req);
  let summary = slimSeries.summary as string | null;
  if (locale === "fa") {
    summary = await resolveSummaryForLocale({
      locale,
      summary: s.summary,
      tmdbId: s.tmdbTvId,
      tmdbKind: "tv",
    });
  }
  res.json({ ...slimSeries, ...creditBlocks, summary, episodes: slimEpisodes });
});

app.patch("/api/series/:id", async (req, res) => {
  const { isFavorite, show, needsRename } = req.body as {
    isFavorite?: boolean;
    show?: boolean;
    needsRename?: boolean;
  };
  const data: import("@prisma/client").Prisma.TvSeriesUpdateInput = {};
  if (typeof isFavorite === "boolean") data.isFavorite = isFavorite;
  if (typeof show === "boolean") data.show = show;
  if (typeof needsRename === "boolean") data.needsRename = needsRename;
  try {
    const s = await prisma.tvSeries.update({
      where: { id: req.params.id },
      data,
    });
    res.json(omitTmdbFetchSnapshots(s as unknown as Record<string, unknown>));
  } catch {
    res.status(404).json({ error: "not found" });
  }
});

app.post("/api/series/:id/enrich", async (req, res) => {
  const s = await prisma.tvSeries.findUnique({ where: { id: req.params.id } });
  if (!s) {
    res.status(404).json({ error: "not found" });
    return;
  }
  try {
    let t = tryHydrateTvEnrichmentFromRow({
      tmdbTvId: s.tmdbTvId,
      tmdbSearchJson: s.tmdbSearchJson,
      tmdbDetailsJson: s.tmdbDetailsJson,
      tmdbCreditsJson: s.tmdbCreditsJson,
      title: s.title,
      year: s.year,
    });
    if (!t) {
      if (!TMDB_API_KEY) {
        res.status(400).json({ error: "TMDB_API_KEY not set" });
        return;
      }
      t = await enrichTvSeriesWithTmdb(s.title, s.year ?? "");
    }
    if (!t) {
      await prisma.tvSeries.update({
        where: { id: s.id },
        data: { needsRename: true },
      });
      res.status(400).json({ error: "no tmdb result" });
      return;
    }
    const poster = await resolvePosterForEnrichment(t.posterPath, s.title, s.posterBytes, s.imagePath);
    const posterBuf = poster.posterBytes;
    let imagePath: string | null = poster.diskPath ?? s.imagePath;
    const updated = await prisma.tvSeries.update({
      where: { id: s.id },
      data: {
        title: t.title,
        year: t.year,
        summary: t.summary,
        imdbRating: t.imdbRating,
        imdbScore: t.imdbScore,
        numberOfVotes: t.numberOfVotes,
        duration: t.duration,
        genre: t.genre,
        actors: t.actors,
        directors: t.directors,
        tmdbTvId: t.tmdbTvId,
        ...(posterBuf ? { posterBytes: new Uint8Array(posterBuf) } : {}),
        imagePath: imagePath ?? s.imagePath,
        enrichmentState: t.enrichmentState,
        tmdbSearchJson: t.searchJson,
        tmdbDetailsJson: t.detailsJson,
        tmdbCreditsJson: t.creditsJson,
        needsRename: false,
      },
    });
    await syncCreditsSafe({
      tvSeriesId: updated.id,
      credits: jsonRecord(t.creditsJson),
      tvDetails: jsonRecord(t.detailsJson),
    });
    res.json(omitTmdbFetchSnapshots(updated as unknown as Record<string, unknown>));
  } catch (e: unknown) {
    res.status(500).json({ error: (e as Error).message });
  }
});

/** Full table dump for local inspection (no pagination). Register before /api/movies/:id. */
app.get("/api/movies/all-rows", async (_req, res) => {
  const rows = await prisma.movie.findMany({
    orderBy: [{ updatedAt: "desc" }],
    include: {
      categories: { include: { category: true } },
      series: true,
    },
  });
  res.json({
    total: rows.length,
    items: rows.map((row) => stripMovieRowForApi(row as unknown as Record<string, unknown>)),
  });
});

app.get("/api/movies/:id", async (req, res) => {
  const m = await prisma.movie.findUnique({
    where: { id: req.params.id },
    include: { categories: { include: { category: true } }, series: true },
  });
  if (!m) {
    res.status(404).json({ error: "not found" });
    return;
  }
  const extras = await creditsPayloadForMovie(m.id);
  const creditBlocks =
    extras.cast.length > 0 || extras.directors.length > 0
      ? { creditsCast: extras.cast, creditsDirectors: extras.directors }
      : {};
  const locale = parseLocaleFromRequest(req);
  const base = stripMovieRowForApi(m as unknown as Record<string, unknown>);
  if (locale !== "fa") {
    res.json({ ...base, ...creditBlocks });
    return;
  }
  const summary = await resolveSummaryForLocale({
    locale,
    summary: m.summary,
    tmdbId: m.tmdbId,
    tmdbKind: "movie",
  });
  res.json({ ...base, ...creditBlocks, summary });
});

app.patch("/api/movies/:id", async (req, res) => {
  const { isFavorite, show, categoryNames, needsRename } = req.body as {
    isFavorite?: boolean;
    show?: boolean;
    categoryNames?: string[];
    needsRename?: boolean;
  };
  const data: import("@prisma/client").Prisma.MovieUpdateInput = {};
  if (typeof isFavorite === "boolean") data.isFavorite = isFavorite;
  if (typeof show === "boolean") data.show = show;
  if (typeof needsRename === "boolean") data.needsRename = needsRename;
  if (Array.isArray(categoryNames)) {
    const cats = await Promise.all(
      categoryNames
        .filter((n) => n && n.trim())
        .map((name) =>
          prisma.category.upsert({ where: { name: name.trim() }, create: { name: name.trim() }, update: {} })
        )
    );
    data.categories = {
      deleteMany: {},
      create: cats.map((c) => ({ categoryId: c.id })),
    };
  }
  const m = await prisma.movie.update({
    where: { id: req.params.id },
    data,
    include: { categories: { include: { category: true } } },
  });
  res.json(omitTmdbFetchSnapshots(m as unknown as Record<string, unknown>));
});

/** Rename video file on disk (same folder only); refreshes parsed metadata like scan. */
app.post("/api/movies/:id/rename-file", async (req, res) => {
  const { fileName } = req.body as { fileName?: string };
  if (!fileName || typeof fileName !== "string") {
    res.status(400).json({ error: "Send JSON { \"fileName\": \"New.Title.mkv\" } (basename only)." });
    return;
  }
  try {
    await renameMovieVideoOnDisk(prisma, req.params.id, fileName);
    const m = await prisma.movie.findUnique({
      where: { id: req.params.id },
      include: { categories: { include: { category: true } }, series: true },
    });
    if (!m) {
      res.status(404).json({ error: "not found" });
      return;
    }
    res.json(stripMovieRowForApi(m as unknown as Record<string, unknown>));
  } catch (e: unknown) {
    res.status(400).json({ error: (e as Error).message });
  }
});

app.post("/api/movies/:id/play-local", async (req, res) => {
  const m = await prisma.movie.findUnique({ where: { id: req.params.id } });
  if (!m) {
    res.status(404).json({ error: "not found" });
    return;
  }
  try {
    const st = await stat(m.filePath);
    if (!st.isFile()) {
      res.status(404).json({ error: "file missing on disk" });
      return;
    }
    await openFileWithDefaultApp(m.filePath);
    res.json({ ok: true });
  } catch (e: unknown) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// --- categories list (distinct for filters)
app.get("/api/categories", async (_req, res) => {
  const c = await prisma.category.findMany({ orderBy: { name: "asc" } });
  res.json(c);
});

// --- enrich
app.post("/api/movies/:id/enrich", async (req, res) => {
  const m = await prisma.movie.findUnique({ where: { id: req.params.id } });
  if (!m) {
    res.status(404).json({ error: "not found" });
    return;
  }
  if (m.mediaKind === "episode" && m.seriesId) {
    const series = await prisma.tvSeries.findUnique({ where: { id: m.seriesId } });
    if (!series) {
      res.status(404).json({ error: "series missing" });
      return;
    }
    try {
      let t = tryHydrateTvEnrichmentFromRow({
        tmdbTvId: series.tmdbTvId,
        tmdbSearchJson: series.tmdbSearchJson,
        tmdbDetailsJson: series.tmdbDetailsJson,
        tmdbCreditsJson: series.tmdbCreditsJson,
        title: series.title,
        year: series.year,
      });
      if (!t) {
        if (!TMDB_API_KEY) {
          res.status(400).json({ error: "TMDB_API_KEY not set" });
          return;
        }
        t = await enrichTvSeriesWithTmdb(series.title, series.year ?? "");
      }
      if (!t) {
        await prisma.tvSeries.update({
          where: { id: series.id },
          data: { needsRename: true },
        });
        res.status(400).json({ error: "no tmdb result" });
        return;
      }
      const poster = await resolvePosterForEnrichment(t.posterPath, series.title, series.posterBytes, series.imagePath);
      const posterBuf = poster.posterBytes;
      let imagePath: string | null = poster.diskPath ?? series.imagePath;
      const updated = await prisma.tvSeries.update({
        where: { id: series.id },
        data: {
          title: t.title,
          year: t.year,
          summary: t.summary,
          imdbRating: t.imdbRating,
          imdbScore: t.imdbScore,
          numberOfVotes: t.numberOfVotes,
          duration: t.duration,
          genre: t.genre,
          actors: t.actors,
          directors: t.directors,
          tmdbTvId: t.tmdbTvId,
          ...(posterBuf ? { posterBytes: new Uint8Array(posterBuf) } : {}),
          imagePath: imagePath ?? series.imagePath,
          enrichmentState: t.enrichmentState,
          tmdbSearchJson: t.searchJson,
          tmdbDetailsJson: t.detailsJson,
          tmdbCreditsJson: t.creditsJson,
          needsRename: false,
        },
      });
      await syncCreditsSafe({
        tvSeriesId: updated.id,
        credits: jsonRecord(t.creditsJson),
        tvDetails: jsonRecord(t.detailsJson),
      });
      res.json(omitTmdbFetchSnapshots(updated as unknown as Record<string, unknown>));
    } catch (e: unknown) {
      res.status(500).json({ error: (e as Error).message });
    }
    return;
  }
  try {
    let t = tryHydrateMovieEnrichmentFromRow({
      tmdbId: m.tmdbId,
      tmdbSearchJson: m.tmdbSearchJson,
      tmdbDetailsJson: m.tmdbDetailsJson,
      tmdbCreditsJson: m.tmdbCreditsJson,
      name: m.name,
      year: m.year,
    });
    if (!t) {
      if (!TMDB_API_KEY) {
        res.status(400).json({ error: "TMDB_API_KEY not set" });
        return;
      }
      t = await enrichWithTmdb(m.name, m.year ?? "");
    }
    if (!t) {
      await prisma.movie.update({
        where: { id: m.id },
        data: { needsRename: true },
      });
      res.status(400).json({ error: "no tmdb result" });
      return;
    }
    const poster = await resolvePosterForEnrichment(t.posterPath, m.name, m.posterBytes, m.imagePath);
    const posterBuf = poster.posterBytes;
    let imagePath: string | null = poster.diskPath ?? m.imagePath;
    const updated = await prisma.movie.update({
      where: { id: m.id },
      data: {
        name: t.name,
        year: t.year,
        summary: t.summary,
        imdbRating: t.imdbRating,
        imdbScore: t.imdbScore,
        numberOfVotes: t.numberOfVotes,
        duration: t.duration,
        genre: t.genre,
        actors: t.actors,
        directors: t.directors,
        tmdbId: t.tmdbId,
        ...(posterBuf ? { posterBytes: new Uint8Array(posterBuf) } : {}),
        imagePath: imagePath ?? m.imagePath,
        enrichmentState: t.enrichmentState,
        tmdbSearchJson: t.searchJson,
        tmdbDetailsJson: t.detailsJson,
        tmdbCreditsJson: t.creditsJson,
        needsRename: false,
      },
    });
    await syncCreditsSafe({
      movieId: updated.id,
      credits: jsonRecord(t.creditsJson),
    });
    res.json(omitTmdbFetchSnapshots(updated as unknown as Record<string, unknown>));
  } catch (e: unknown) {
    const err = e as Error;
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/enrich-bulk", async (req, res) => {
  res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("X-Accel-Buffering", "no");

  const send = (obj: unknown) => {
    res.write(JSON.stringify(obj) + "\n");
  };

  try {
    const { limit: lim } = (req.body as { limit?: number }) || {};
    const take = Math.min(200, lim ?? 50);
    const half = Math.max(1, Math.floor(take / 2));

    const results: { id: string; kind: "series" | "movie"; ok: boolean; error?: string }[] = [];

    const seriesBatch = await prisma.tvSeries.findMany({
      where: {
        needsRename: false,
        OR: [{ enrichmentState: "none" }, { enrichmentState: "partial" }],
      },
      take: half,
    });

    const movieBatch = await prisma.movie.findMany({
      where: {
        mediaKind: "movie",
        needsRename: false,
        OR: [{ enrichmentState: "none" }, { enrichmentState: "partial" }],
      },
      take: take - seriesBatch.length,
    });

    const total = seriesBatch.length + movieBatch.length;
    let done = 0;

    const bump = () => {
      done++;
      send({
        type: "progress",
        job: "enrich",
        done,
        total,
        percent: total ? Math.round((done / total) * 100) : 100,
      });
    };

    send({
      type: "progress",
      job: "enrich",
      done: 0,
      total,
      percent: 0,
    });

    for (const s of seriesBatch) {
      try {
        let t = tryHydrateTvEnrichmentFromRow({
          tmdbTvId: s.tmdbTvId,
          tmdbSearchJson: s.tmdbSearchJson,
          tmdbDetailsJson: s.tmdbDetailsJson,
          tmdbCreditsJson: s.tmdbCreditsJson,
          title: s.title,
          year: s.year,
        });
        if (!t) {
          if (!TMDB_API_KEY) {
            results.push({ id: s.id, kind: "series", ok: false, error: "TMDB_API_KEY not set (no cached TMDb JSON)" });
            bump();
            continue;
          }
          t = await enrichTvSeriesWithTmdb(s.title, s.year ?? "");
        }
        if (!t) {
          await prisma.tvSeries.update({
            where: { id: s.id },
            data: { needsRename: true },
          });
          results.push({ id: s.id, kind: "series", ok: false, error: "no match" });
          bump();
          continue;
        }
        const poster = await resolvePosterForEnrichment(t.posterPath, s.title, s.posterBytes, s.imagePath);
        const posterBuf = poster.posterBytes;
        let imagePath: string | null = poster.diskPath ?? s.imagePath;
        await prisma.tvSeries.update({
          where: { id: s.id },
          data: {
            title: t.title,
            year: t.year,
            summary: t.summary,
            imdbRating: t.imdbRating,
            imdbScore: t.imdbScore,
            numberOfVotes: t.numberOfVotes,
            duration: t.duration,
            genre: t.genre,
            actors: t.actors,
            directors: t.directors,
            tmdbTvId: t.tmdbTvId,
            ...(posterBuf ? { posterBytes: new Uint8Array(posterBuf) } : {}),
            imagePath: imagePath ?? s.imagePath,
            enrichmentState: t.enrichmentState,
            tmdbSearchJson: t.searchJson,
            tmdbDetailsJson: t.detailsJson,
            tmdbCreditsJson: t.creditsJson,
            needsRename: false,
          },
        });
        await syncCreditsSafe({
          tvSeriesId: s.id,
          credits: jsonRecord(t.creditsJson),
          tvDetails: jsonRecord(t.detailsJson),
        });
        results.push({ id: s.id, kind: "series", ok: true });
      } catch (e: unknown) {
        results.push({ id: s.id, kind: "series", ok: false, error: (e as Error).message });
      }
      bump();
    }

    for (const m of movieBatch) {
      try {
        let t = tryHydrateMovieEnrichmentFromRow({
          tmdbId: m.tmdbId,
          tmdbSearchJson: m.tmdbSearchJson,
          tmdbDetailsJson: m.tmdbDetailsJson,
          tmdbCreditsJson: m.tmdbCreditsJson,
          name: m.name,
          year: m.year,
        });
        if (!t) {
          if (!TMDB_API_KEY) {
            results.push({ id: m.id, kind: "movie", ok: false, error: "TMDB_API_KEY not set (no cached TMDb JSON)" });
            bump();
            continue;
          }
          t = await enrichWithTmdb(m.name, m.year ?? "");
        }
        if (!t) {
          await prisma.movie.update({
            where: { id: m.id },
            data: { needsRename: true },
          });
          results.push({ id: m.id, kind: "movie", ok: false, error: "no match" });
          bump();
          continue;
        }
        const poster = await resolvePosterForEnrichment(t.posterPath, m.name, m.posterBytes, m.imagePath);
        const posterBuf = poster.posterBytes;
        let imagePath: string | null = poster.diskPath ?? m.imagePath;
        await prisma.movie.update({
          where: { id: m.id },
          data: {
            name: t.name,
            year: t.year,
            summary: t.summary,
            imdbRating: t.imdbRating,
            imdbScore: t.imdbScore,
            numberOfVotes: t.numberOfVotes,
            duration: t.duration,
            genre: t.genre,
            actors: t.actors,
            directors: t.directors,
            tmdbId: t.tmdbId,
            ...(posterBuf ? { posterBytes: new Uint8Array(posterBuf) } : {}),
            imagePath: imagePath ?? m.imagePath,
            enrichmentState: t.enrichmentState,
            tmdbSearchJson: t.searchJson,
            tmdbDetailsJson: t.detailsJson,
            tmdbCreditsJson: t.creditsJson,
            needsRename: false,
          },
        });
        await syncCreditsSafe({
          movieId: m.id,
          credits: jsonRecord(t.creditsJson),
        });
        results.push({ id: m.id, kind: "movie", ok: true });
      } catch (e: unknown) {
        results.push({ id: m.id, kind: "movie", ok: false, error: (e as Error).message });
      }
      bump();
    }

    send({ type: "complete", processed: results.length, results });
    res.end();
  } catch (e) {
    send({ type: "error", message: (e as Error).message });
    res.end();
  }
});

// --- import legacy JSON
app.post("/api/import/legacy-json", async (req, res) => {
  const body = req.body;
  if (!Array.isArray(body) && !body?.movies) {
    res.status(400).json({ error: "expected array of movies or { movies: [] }" });
    return;
  }
  if (body?.paths && Array.isArray(body.paths)) {
    for (const p of body.paths) {
      if (typeof p !== "string" || !p.trim()) continue;
      const normalized = resolve(p.trim());
      if (await pathExists(normalized)) {
        await prisma.libraryPath.upsert({
          where: { path: normalized },
          create: { path: normalized },
          update: {},
        });
      }
    }
  }
  const list = (Array.isArray(body) ? body : body.movies) as Record<string, unknown>[];
  let n = 0;
  for (const raw of list) {
    const path = (raw.path ?? raw.filePath) as string | undefined;
    const name = (raw.name as string) || "Unknown";
    if (!path) continue;
    const year = (raw.year as string) || "";
    const folderPath = (raw.folderPath as string) || dirname(path);
    await prisma.movie.upsert({
      where: { filePath: path },
      create: {
        name,
        year,
        filePath: path,
        folderPath,
        mediaKind: "movie",
        imdbScore: (raw.IMDBscore ?? raw.imdbScore) as string | undefined,
        imdbRating: (raw.IMDBrating ?? raw.imdbRating) as string | undefined,
        summary: (raw.summery ?? raw.summary) as string | undefined,
        fullSummary: (raw.fullSummery ?? raw.fullSummary) as string | undefined,
        actors: raw.actors as string | undefined,
        directors: raw.directors as string | undefined,
        genre: raw.genre as string | undefined,
        imagePath: raw.imagePath as string | undefined,
        duration: raw.duration as string | undefined,
        numberOfVotes: raw.numberOfVotes as string | undefined,
        show: raw.show !== false,
        isFavorite: Boolean(raw.favoriteMovie),
        enrichmentState: raw.isUpdated2 ? "full" : raw.isUpdatedFromNet ? "partial" : "none",
        dubbed: isDubbedFromPath(path),
      },
      update: {
        name,
        year,
        folderPath,
        mediaKind: "movie",
        seriesId: null,
        seasonNumber: null,
        episodeNumber: null,
        episodeTitle: null,
        dubbed: isDubbedFromPath(path),
      },
    });
    n++;
  }
  res.json({ imported: n });
});

// --- stream video (local file)
app.get("/api/stream/:id", async (req, res) => {
  const m = await prisma.movie.findUnique({ where: { id: req.params.id } });
  if (!m) {
    res.status(404).end();
    return;
  }
  const filePath = m.filePath;
  try {
    const st = await statAsync(filePath);
    if (!st.isFile()) {
      res.status(404).end();
      return;
    }
    const size = st.size;
    const mime = lookup(filePath) || "application/octet-stream";
    const range = req.headers.range;
    if (range) {
      const match = /bytes=(\d+)-(\d*)/.exec(range);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = match[2] ? parseInt(match[2], 10) : size - 1;
        const chunk = end - start + 1;
        res.status(206);
        res.setHeader("Content-Range", `bytes ${start}-${end}/${size}`);
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Content-Length", String(chunk));
        res.setHeader("Content-Type", String(mime));
        res.setHeader("Cache-Control", "no-store");
        const stream = createReadStream(filePath, { start, end });
        await pipeline(stream, res);
        return;
      }
    }
    res.setHeader("Content-Length", String(size));
    res.setHeader("Content-Type", String(mime));
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "no-store");
    await pipeline(createReadStream(filePath), res);
  } catch {
    res.status(500).end();
  }
});

function posterUrlFromStoredTmdbDetails(detailsJson: unknown): string | null {
  const d = jsonRecord(detailsJson);
  const p = d.poster_path;
  if (typeof p !== "string" || !p.trim()) return null;
  return `${TMDB_IMAGE_BASE}${p}`;
}

/** When poster bytes / disk file are missing but TMDb details JSON has poster_path — download once and persist. */
async function lazyFetchPosterBufferForMovie(movieId: string): Promise<Buffer | null> {
  const m = await prisma.movie.findUnique({
    where: { id: movieId },
    select: {
      id: true,
      mediaKind: true,
      seriesId: true,
      tmdbDetailsJson: true,
    },
  });
  if (!m) return null;

  let posterUrl = posterUrlFromStoredTmdbDetails(m.tmdbDetailsJson);
  if (!posterUrl && m.mediaKind === "episode" && m.seriesId) {
    const s = await prisma.tvSeries.findUnique({
      where: { id: m.seriesId },
      select: { tmdbDetailsJson: true },
    });
    if (s) posterUrl = posterUrlFromStoredTmdbDetails(s.tmdbDetailsJson);
  }
  if (!posterUrl) return null;

  const fetched = await fetchPosterForStorage(posterUrl, `movie-${movieId}`);
  if (!fetched.posterBytes) return null;

  await prisma.movie.update({
    where: { id: movieId },
    data: {
      posterBytes: new Uint8Array(fetched.posterBytes),
      ...(fetched.diskPath ? { imagePath: fetched.diskPath } : {}),
    },
  });
  return fetched.posterBytes;
}

async function lazyFetchPosterBufferForSeries(seriesId: string): Promise<Buffer | null> {
  const s = await prisma.tvSeries.findUnique({
    where: { id: seriesId },
    select: { id: true, tmdbDetailsJson: true },
  });
  if (!s) return null;
  const posterUrl = posterUrlFromStoredTmdbDetails(s.tmdbDetailsJson);
  if (!posterUrl) return null;

  const fetched = await fetchPosterForStorage(posterUrl, `series-${seriesId}`);
  if (!fetched.posterBytes) return null;

  await prisma.tvSeries.update({
    where: { id: seriesId },
    data: {
      posterBytes: new Uint8Array(fetched.posterBytes),
      ...(fetched.diskPath ? { imagePath: fetched.diskPath } : {}),
    },
  });
  return fetched.posterBytes;
}

function posterMimeFromBytes(buf: Buffer): string {
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    buf.length >= 12 &&
    buf.subarray(0, 4).toString("latin1") === "RIFF" &&
    buf.subarray(8, 12).toString("latin1") === "WEBP"
  ) {
    return "image/webp";
  }
  return "image/jpeg";
}

app.get("/api/person-photo/:tmdbPersonId", async (req, res) => {
  const id = parseInt(req.params.tmdbPersonId, 10);
  if (!Number.isFinite(id)) {
    res.status(400).end();
    return;
  }
  const p = await prisma.person.findUnique({
    where: { tmdbPersonId: id },
    select: { profileImagePath: true, profileBytes: true },
  });
  if (!p) {
    res.status(404).end();
    return;
  }
  if (p.profileBytes != null && p.profileBytes.byteLength > 0) {
    const buf = Buffer.from(p.profileBytes);
    res.setHeader("Content-Type", posterMimeFromBytes(buf));
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(buf);
    return;
  }
  if (!p.profileImagePath) {
    res.status(404).end();
    return;
  }
  const filePath = p.profileImagePath;
  try {
    const st = await statAsync(filePath);
    if (!st.isFile()) {
      res.status(404).end();
      return;
    }
    const mime = (lookup(extname(filePath)) as string) || "image/jpeg";
    res.setHeader("Content-Type", mime);
    res.setHeader("Cache-Control", "public, max-age=86400");
    await pipeline(createReadStream(filePath), res);
  } catch {
    res.status(404).end();
  }
});

// serve series poster — DB bytes first, then disk
app.get("/api/poster/series/:seriesId", async (req, res) => {
  const s = await prisma.tvSeries.findUnique({
    where: { id: req.params.seriesId },
    select: { imagePath: true, posterBytes: true },
  });
  if (!s) {
    res.status(404).end();
    return;
  }
  if (s.posterBytes != null && s.posterBytes.byteLength > 0) {
    const buf = Buffer.from(s.posterBytes);
    res.setHeader("Content-Type", posterMimeFromBytes(buf));
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(buf);
    return;
  }
  if (!s.imagePath) {
    try {
      const buf = await lazyFetchPosterBufferForSeries(req.params.seriesId);
      if (buf && buf.length > 0) {
        res.setHeader("Content-Type", posterMimeFromBytes(buf));
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.send(buf);
        return;
      }
    } catch {
      /* ignore */
    }
    res.status(404).end();
    return;
  }
  const filePath = s.imagePath;
  try {
    const st = await statAsync(filePath);
    if (!st.isFile()) {
      const buf = await lazyFetchPosterBufferForSeries(req.params.seriesId);
      if (buf && buf.length > 0) {
        res.setHeader("Content-Type", posterMimeFromBytes(buf));
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.send(buf);
        return;
      }
      res.status(404).end();
      return;
    }
    const mime = (lookup(extname(filePath)) as string) || "image/jpeg";
    res.setHeader("Content-Type", mime);
    res.setHeader("Cache-Control", "public, max-age=3600");
    await pipeline(createReadStream(filePath), res);
  } catch {
    try {
      const buf = await lazyFetchPosterBufferForSeries(req.params.seriesId);
      if (buf && buf.length > 0) {
        res.setHeader("Content-Type", posterMimeFromBytes(buf));
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.send(buf);
        return;
      }
    } catch {
      /* ignore */
    }
    res.status(404).end();
  }
});

app.get("/api/poster/:id", async (req, res) => {
  const m = await prisma.movie.findUnique({
    where: { id: req.params.id },
    select: { imagePath: true, posterBytes: true },
  });
  if (!m) {
    res.status(404).end();
    return;
  }
  if (m.posterBytes != null && m.posterBytes.byteLength > 0) {
    const buf = Buffer.from(m.posterBytes);
    res.setHeader("Content-Type", posterMimeFromBytes(buf));
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(buf);
    return;
  }
  if (!m.imagePath) {
    try {
      const buf = await lazyFetchPosterBufferForMovie(req.params.id);
      if (buf && buf.length > 0) {
        res.setHeader("Content-Type", posterMimeFromBytes(buf));
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.send(buf);
        return;
      }
    } catch {
      /* ignore */
    }
    res.status(404).end();
    return;
  }
  const filePath = m.imagePath;
  try {
    const st = await statAsync(filePath);
    if (!st.isFile()) {
      const buf = await lazyFetchPosterBufferForMovie(req.params.id);
      if (buf && buf.length > 0) {
        res.setHeader("Content-Type", posterMimeFromBytes(buf));
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.send(buf);
        return;
      }
      res.status(404).end();
      return;
    }
    const mime = (lookup(extname(filePath)) as string) || "image/jpeg";
    res.setHeader("Content-Type", mime);
    res.setHeader("Cache-Control", "public, max-age=3600");
    await pipeline(createReadStream(filePath), res);
  } catch {
    try {
      const buf = await lazyFetchPosterBufferForMovie(req.params.id);
      if (buf && buf.length > 0) {
        res.setHeader("Content-Type", posterMimeFromBytes(buf));
        res.setHeader("Cache-Control", "public, max-age=3600");
        res.send(buf);
        return;
      }
    } catch {
      /* ignore */
    }
    res.status(404).end();
  }
});

// expose stream via proxy: Next rewrites to here; browser uses same origin in dev... Actually Next rewrites from web to 4000, so from browser the URL is /api/stream/:id on port 3000, Next proxies to 4000. Good.

// Fix year filter in GET /api/movies - Prisma for SQLite: year is string, use gte/lte carefully for "1999" style
// Simplified: if yearFrom/To use string compare (works for 4-digit years)

// Fix where.year merge bug - I used messy merge. Let me use single object:
// where.year: { gte: yearFrom, lte: yearTo } when both set

// I'll fix the handler in a separate patch

async function startServer(): Promise<void> {
  try {
    await refreshUserDubbedRules(prisma);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[library settings] could not load dubbed rules:", (e as Error).message);
  }
  app.listen(API_PORT, API_HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`API http://${API_HOST}:${API_PORT}`);
  });
}

void startServer();
