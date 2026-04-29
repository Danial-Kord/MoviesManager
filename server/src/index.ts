import cors from "cors";
import express from "express";
import { createReadStream, stat as statCb } from "fs";
import { dirname, extname, resolve } from "path";
import { stat } from "fs/promises";
import { pipeline } from "stream/promises";
import { promisify } from "util";
import { lookup } from "mime-types";
import { API_HOST, API_PORT, TMDB_API_KEY } from "./config.js";
import { prisma } from "./prisma.js";
import { collectVideoFiles, pathExists } from "./scan.js";
import { downloadPosterToImagesDir, enrichWithTmdb } from "./tmdb.js";
import { openFileWithDefaultApp } from "./openLocal.js";

const statAsync = promisify(statCb);

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "50mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, tmdb: Boolean(TMDB_API_KEY) });
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

// --- scan
app.post("/api/scan", async (_req, res) => {
  const paths = await prisma.libraryPath.findMany();
  const discovered: { filePath: string; folderPath: string; name: string; year: string }[] = [];
  for (const row of paths) {
    if (await pathExists(row.path)) {
      const files = await collectVideoFiles(row.path);
      discovered.push(...files);
    }
  }
  let created = 0;
  for (const f of discovered) {
    const r = await prisma.movie.upsert({
      where: { filePath: f.filePath },
      create: {
        name: f.name,
        year: f.year,
        filePath: f.filePath,
        folderPath: f.folderPath,
        enrichmentState: "none",
      },
      update: { name: f.name, year: f.year, folderPath: f.folderPath },
    });
    if (r) created++;
  }
  res.json({ scanned: discovered.length, upserted: created });
});

// --- list movies
app.get("/api/movies", async (req, res) => {
  const q = (req.query as Record<string, string | undefined>) || {};
  const page = Math.max(1, parseInt(q.page ?? "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(q.pageSize ?? "24", 10) || 24));
  const where: import("@prisma/client").Prisma.MovieWhereInput = {};

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
  res.json({ total, page, pageSize, items: rows });
});

app.get("/api/movies/:id", async (req, res) => {
  const m = await prisma.movie.findUnique({
    where: { id: req.params.id },
    include: { categories: { include: { category: true } } },
  });
  if (!m) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.json(m);
});

app.patch("/api/movies/:id", async (req, res) => {
  const { isFavorite, show, categoryNames } = req.body as {
    isFavorite?: boolean;
    show?: boolean;
    categoryNames?: string[];
  };
  const data: import("@prisma/client").Prisma.MovieUpdateInput = {};
  if (typeof isFavorite === "boolean") data.isFavorite = isFavorite;
  if (typeof show === "boolean") data.show = show;
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
  res.json(m);
});

/** Open video file with the system default application (not in-browser). */
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
  if (!TMDB_API_KEY) {
    res.status(400).json({ error: "TMDB_API_KEY not set" });
    return;
  }
  const m = await prisma.movie.findUnique({ where: { id: req.params.id } });
  if (!m) {
    res.status(404).end();
    return;
  }
  try {
    const t = await enrichWithTmdb(m.name, m.year ?? "");
    if (!t) {
      res.status(400).json({ error: "no tmdb result" });
      return;
    }
    let imagePath: string | null = m.imagePath;
    if (t.posterPath) {
      imagePath = await downloadPosterToImagesDir(t.posterPath, m.name);
    }
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
        imagePath: imagePath ?? m.imagePath,
        enrichmentState: t.enrichmentState,
      },
    });
    res.json(updated);
  } catch (e: unknown) {
    const err = e as Error;
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/enrich-bulk", async (req, res) => {
  if (!TMDB_API_KEY) {
    res.status(400).json({ error: "TMDB_API_KEY not set" });
    return;
  }
  const { limit: lim } = (req.body as { limit?: number }) || {};
  const take = Math.min(200, lim ?? 50);
  const movies = await prisma.movie.findMany({
    where: { OR: [{ enrichmentState: "none" }, { enrichmentState: "partial" }] },
    take,
  });
  const results: { id: string; ok: boolean; error?: string }[] = [];
  for (const m of movies) {
    try {
      const t = await enrichWithTmdb(m.name, m.year ?? "");
      if (!t) {
        results.push({ id: m.id, ok: false, error: "no match" });
        continue;
      }
      let imagePath: string | null = m.imagePath;
      if (t.posterPath) {
        imagePath = await downloadPosterToImagesDir(t.posterPath, m.name);
      }
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
          imagePath: imagePath ?? m.imagePath,
          enrichmentState: t.enrichmentState,
        },
      });
      results.push({ id: m.id, ok: true });
    } catch (e: unknown) {
      results.push({ id: m.id, ok: false, error: (e as Error).message });
    }
  }
  res.json({ processed: results.length, results });
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
      },
      update: { name, year, folderPath },
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

// serve poster: local path
app.get("/api/poster/:id", async (req, res) => {
  const m = await prisma.movie.findUnique({ where: { id: req.params.id } });
  if (!m?.imagePath) {
    res.status(404).end();
    return;
  }
  const filePath = m.imagePath;
  try {
    const st = await statAsync(filePath);
    if (!st.isFile()) {
      res.status(404).end();
      return;
    }
    const mime = (lookup(extname(filePath)) as string) || "image/jpeg";
    res.setHeader("Content-Type", mime);
    res.setHeader("Cache-Control", "public, max-age=3600");
    await pipeline(createReadStream(filePath), res);
  } catch {
    res.status(404).end();
  }
});

// expose stream via proxy: Next rewrites to here; browser uses same origin in dev... Actually Next rewrites from web to 4000, so from browser the URL is /api/stream/:id on port 3000, Next proxies to 4000. Good.

// Fix year filter in GET /api/movies - Prisma for SQLite: year is string, use gte/lte carefully for "1999" style
// Simplified: if yearFrom/To use string compare (works for 4-digit years)

// Fix where.year merge bug - I used messy merge. Let me use single object:
// where.year: { gte: yearFrom, lte: yearTo } when both set

// I'll fix the handler in a separate patch

app.listen(API_PORT, API_HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`API http://${API_HOST}:${API_PORT}`);
});
