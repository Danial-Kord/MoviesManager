import type { Prisma } from "@prisma/client";
import { join } from "path";
import { mkdir, writeFile } from "fs/promises";
import { TMDB_API_KEY, TMDB_IMAGE_BASE, IMAGES_DIR } from "./config.js";
import type { ParsedVideoFile } from "./parseFilename.js";

const BASE = "https://api.themoviedb.org/3";

/** Bundled sub-resources merged into the details JSON by TMDb (`append_to_response`). */
function appendToResponseQuery(parts: readonly string[]): string {
  return parts.map((p) => encodeURIComponent(p)).join(",");
}

const MOVIE_APPEND_PARTS = [
  "alternative_titles",
  "credits",
  "external_ids",
  "images",
  "keywords",
  "recommendations",
  "similar",
  "videos",
] as const;

const TV_APPEND_PARTS = MOVIE_APPEND_PARTS;

/** Clone API payloads for Prisma Json columns (lossless vs references). */
export function tmdbResponseToJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`TMDb ${res.status}: ${t.slice(0, 200)}`);
  }
  return res.json() as Promise<Record<string, unknown>>;
}

function firstIdInResults(search: Record<string, unknown>): number {
  const results = search.results;
  if (!Array.isArray(results) || results.length === 0) return -1;
  const first = results[0] as Record<string, unknown>;
  if (typeof first.id !== "number") return -1;
  return first.id;
}

function joinGenres(d: Record<string, unknown>): string | null {
  const g = d.genres;
  if (!Array.isArray(g)) return null;
  return g
    .map((x) => (x as { name?: string }).name)
    .filter(Boolean)
    .join(", ");
}

function directorsFromCredits(c: Record<string, unknown>): string | null {
  const crew = c.crew;
  if (!Array.isArray(crew)) return null;
  const names: string[] = [];
  for (const person of crew) {
    const p = person as { job?: string; name?: string };
    if (p.job === "Director" && p.name) names.push(p.name);
  }
  return names.length ? names.join(", ") : null;
}

function castNames(c: Record<string, unknown>): string | null {
  const cast = c.cast;
  if (!Array.isArray(cast)) return null;
  const names: string[] = [];
  for (const item of cast) {
    const p = item as { name?: string };
    if (p.name) names.push(p.name);
  }
  return names.length ? names.join(", ") : null;
}

function parseJsonObject(v: unknown): Record<string, unknown> | null {
  if (v == null) return null;
  if (typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  return null;
}

function numericDetailId(details: Record<string, unknown>): number {
  const raw = details.id;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
}

export interface TmdbEnrichment {
  tmdbId: number;
  name: string;
  year: string;
  summary: string;
  imdbRating: string;
  imdbScore: string;
  numberOfVotes: string;
  duration: string;
  genre: string;
  actors: string;
  directors: string;
  posterPath: string | null;
  enrichmentState: "full";
  searchJson: Prisma.InputJsonValue;
  detailsJson: Prisma.InputJsonValue;
  creditsJson: Prisma.InputJsonValue;
}

function buildMovieEnrichmentFromParsedPayload(
  tmdbId: number,
  search: Record<string, unknown>,
  details: Record<string, unknown>,
  credits: Record<string, unknown>,
  fallbackName: string,
  fallbackYear: string
): TmdbEnrichment | null {
  if (numericDetailId(details) !== tmdbId) return null;
  const rel = (details.release_date as string) || "";
  const y = rel.length >= 4 ? rel.slice(0, 4) : fallbackYear;
  const va = details.vote_average;
  const voteAvg = typeof va === "number" ? String(va) : "0";
  const vc = details.vote_count;
  const votes = typeof vc === "number" ? String(vc) : "";
  const rt = details.runtime;
  const runtime = typeof rt === "number" ? `${rt} min` : "";
  const overview = (details.overview as string) || "";
  const title = (details.title as string) || fallbackName;
  const poster = details.poster_path as string | null;
  return {
    tmdbId,
    name: title,
    year: y,
    summary: overview,
    imdbRating: voteAvg,
    imdbScore: voteAvg,
    numberOfVotes: votes,
    duration: runtime,
    genre: joinGenres(details) || "",
    actors: castNames(credits) || "",
    directors: directorsFromCredits(credits) || "",
    posterPath: poster ? `${TMDB_IMAGE_BASE}${poster}` : null,
    enrichmentState: "full",
    searchJson: tmdbResponseToJson(search),
    detailsJson: tmdbResponseToJson(details),
    creditsJson: tmdbResponseToJson(credits),
  };
}

/** Rebuild enrichment from DB snapshots — avoids TMDb HTTP when JSON is complete and ids match. */
export function tryHydrateMovieEnrichmentFromRow(m: {
  tmdbId: number | null;
  tmdbSearchJson: unknown;
  tmdbDetailsJson: unknown;
  tmdbCreditsJson: unknown;
  name: string;
  year: string | null;
}): TmdbEnrichment | null {
  const tid = m.tmdbId;
  if (tid == null || tid <= 0) return null;
  const search = parseJsonObject(m.tmdbSearchJson);
  const details = parseJsonObject(m.tmdbDetailsJson);
  if (!search || !details) return null;
  let credits = parseJsonObject(m.tmdbCreditsJson);
  if (!credits) {
    const emb = details.credits;
    if (emb && typeof emb === "object" && !Array.isArray(emb)) credits = emb as Record<string, unknown>;
  }
  if (!credits) return null;
  const fy = (m.year ?? "").trim();
  return buildMovieEnrichmentFromParsedPayload(tid, search, details, credits, m.name, fy);
}

export async function enrichWithTmdb(name: string, year: string): Promise<TmdbEnrichment | null> {
  if (!TMDB_API_KEY) {
    throw new Error("Set TMDB_API_KEY in the server environment or .env");
  }
  const key = encodeURIComponent(TMDB_API_KEY);
  const q = encodeURIComponent(name);
  let searchUrl = `${BASE}/search/movie?api_key=${key}&query=${q}`;
  if (year && /^\d{4}$/.test(year)) {
    searchUrl += `&year=${year}`;
  }
  const search = (await fetchJson(searchUrl)) as Record<string, unknown>;
  const id = firstIdInResults(search);
  if (id < 0) return null;

  const details = (await fetchJson(
    `${BASE}/movie/${id}?api_key=${key}&append_to_response=${appendToResponseQuery(MOVIE_APPEND_PARTS)}`
  )) as Record<string, unknown>;
  const credits = (await fetchJson(`${BASE}/movie/${id}/credits?api_key=${key}`)) as Record<string, unknown>;

  return buildMovieEnrichmentFromParsedPayload(id, search, details, credits, name, year);
}

export interface TmdbTvEnrichment {
  tmdbTvId: number;
  title: string;
  year: string;
  summary: string;
  imdbRating: string;
  imdbScore: string;
  numberOfVotes: string;
  duration: string;
  genre: string;
  actors: string;
  directors: string;
  posterPath: string | null;
  enrichmentState: "full";
  searchJson: Prisma.InputJsonValue;
  detailsJson: Prisma.InputJsonValue;
  creditsJson: Prisma.InputJsonValue;
}

function creatorsFromTv(details: Record<string, unknown>): string | null {
  const cb = details.created_by;
  if (!Array.isArray(cb)) return null;
  const names = cb.map((x) => (x as { name?: string }).name).filter(Boolean) as string[];
  return names.length ? names.join(", ") : null;
}

function buildTvEnrichmentFromParsedPayload(
  tmdbTvId: number,
  search: Record<string, unknown>,
  details: Record<string, unknown>,
  credits: Record<string, unknown>,
  fallbackTitle: string,
  fallbackYear: string
): TmdbTvEnrichment | null {
  if (numericDetailId(details) !== tmdbTvId) return null;
  const fa = (details.first_air_date as string) || "";
  const y = fa.length >= 4 ? fa.slice(0, 4) : fallbackYear;
  const va = details.vote_average;
  const voteAvg = typeof va === "number" ? String(va) : "0";
  const vc = details.vote_count;
  const votes = typeof vc === "number" ? String(vc) : "";
  const er = details.episode_run_time;
  let runtime = "";
  if (Array.isArray(er) && er.length && typeof er[0] === "number") {
    runtime = `~${er[0]} min/ep`;
  }
  const overview = (details.overview as string) || "";
  const tvTitle = (details.name as string) || fallbackTitle;
  const poster = details.poster_path as string | null;
  const creators = creatorsFromTv(details);
  const directors = creators || directorsFromCredits(credits) || "";

  return {
    tmdbTvId,
    title: tvTitle,
    year: y,
    summary: overview,
    imdbRating: voteAvg,
    imdbScore: voteAvg,
    numberOfVotes: votes,
    duration: runtime,
    genre: joinGenres(details) || "",
    actors: castNames(credits) || "",
    directors,
    posterPath: poster ? `${TMDB_IMAGE_BASE}${poster}` : null,
    enrichmentState: "full",
    searchJson: tmdbResponseToJson(search),
    detailsJson: tmdbResponseToJson(details),
    creditsJson: tmdbResponseToJson(credits),
  };
}

/** Rebuild TV enrichment from DB snapshots — avoids TMDb HTTP when JSON is complete and ids match. */
export function tryHydrateTvEnrichmentFromRow(s: {
  tmdbTvId: number | null;
  tmdbSearchJson: unknown;
  tmdbDetailsJson: unknown;
  tmdbCreditsJson: unknown;
  title: string;
  year: string | null;
}): TmdbTvEnrichment | null {
  const tid = s.tmdbTvId;
  if (tid == null || tid <= 0) return null;
  const search = parseJsonObject(s.tmdbSearchJson);
  const details = parseJsonObject(s.tmdbDetailsJson);
  if (!search || !details) return null;
  let credits = parseJsonObject(s.tmdbCreditsJson);
  if (!credits) {
    const emb = details.credits;
    if (emb && typeof emb === "object" && !Array.isArray(emb)) credits = emb as Record<string, unknown>;
  }
  if (!credits) return null;
  const fy = (s.year ?? "").trim();
  return buildTvEnrichmentFromParsedPayload(tid, search, details, credits, s.title, fy);
}

export async function enrichTvSeriesWithTmdb(title: string, year: string): Promise<TmdbTvEnrichment | null> {
  if (!TMDB_API_KEY) {
    throw new Error("Set TMDB_API_KEY in the server environment or .env");
  }
  const key = encodeURIComponent(TMDB_API_KEY);
  const q = encodeURIComponent(title);
  let searchUrl = `${BASE}/search/tv?api_key=${key}&query=${q}`;
  if (year && /^\d{4}$/.test(year)) {
    searchUrl += `&first_air_date_year=${year}`;
  }
  const search = (await fetchJson(searchUrl)) as Record<string, unknown>;
  const id = firstIdInResults(search);
  if (id < 0) return null;

  const details = (await fetchJson(
    `${BASE}/tv/${id}?api_key=${key}&append_to_response=${appendToResponseQuery(TV_APPEND_PARTS)}`
  )) as Record<string, unknown>;
  const credits = (await fetchJson(`${BASE}/tv/${id}/credits?api_key=${key}`)) as Record<string, unknown>;

  return buildTvEnrichmentFromParsedPayload(id, search, details, credits, title, year);
}

async function tmdbMovieSearchHasResults(name: string, year: string): Promise<boolean> {
  if (!TMDB_API_KEY) return false;
  const key = encodeURIComponent(TMDB_API_KEY);
  const q = encodeURIComponent(name.trim());
  let searchUrl = `${BASE}/search/movie?api_key=${key}&query=${q}`;
  if (year && /^\d{4}$/.test(year)) {
    searchUrl += `&year=${year}`;
  }
  const search = (await fetchJson(searchUrl)) as Record<string, unknown>;
  return firstIdInResults(search) >= 0;
}

async function tmdbTvSearchHasResults(title: string, year: string): Promise<boolean> {
  if (!TMDB_API_KEY) return false;
  const key = encodeURIComponent(TMDB_API_KEY);
  const q = encodeURIComponent(title.trim());
  let searchUrl = `${BASE}/search/tv?api_key=${key}&query=${q}`;
  if (year && /^\d{4}$/.test(year)) {
    searchUrl += `&first_air_date_year=${year}`;
  }
  const search = (await fetchJson(searchUrl)) as Record<string, unknown>;
  return firstIdInResults(search) >= 0;
}

/**
 * Ensures a rename target filename resolves to metadata TMDb recognizes (search only, before touching disk).
 * Movies must include a 4-digit year in the filename so the query matches enrichment behavior.
 */
export async function assertRenameMatchesTmdb(parsed: ParsedVideoFile): Promise<void> {
  if (!TMDB_API_KEY) {
    throw new Error("Cannot verify title with TMDb: TMDB_API_KEY is not set in server/.env.");
  }
  if (parsed.kind === "movie") {
    const year = (parsed.year ?? "").trim();
    if (!/^\d{4}$/.test(year)) {
      throw new Error(
        "Movies must include a 4-digit release year in the filename so TMDb can verify it (e.g. Movie.Title.2010.mkv)."
      );
    }
    const name = parsed.displayName.trim();
    if (!name) {
      throw new Error("Could not read a movie title from the filename.");
    }
    const ok = await tmdbMovieSearchHasResults(name, year);
    if (!ok) {
      throw new Error(`No TMDb match for "${name}" (${year}). Fix the title or year in the filename.`);
    }
    return;
  }

  const seriesTitle = parsed.seriesTitle.trim();
  if (!seriesTitle || /^unknown series$/i.test(seriesTitle)) {
    throw new Error("Could not read a TV series title from the filename.");
  }
  const year = (parsed.year ?? "").trim();
  const ok = await tmdbTvSearchHasResults(seriesTitle, year);
  if (!ok) {
    const yHint = /^\d{4}$/.test(year) ? ` (${year})` : "";
    throw new Error(`No TMDb match for TV series "${seriesTitle}"${yHint}. Fix the series name or add a first-air year.`);
  }
}

export async function resolvePosterForEnrichment(
  posterUrl: string | null,
  fileBaseName: string,
  existingBytes: Uint8Array | Buffer | null | undefined,
  existingPath: string | null | undefined
): Promise<{ posterBytes: Buffer | null; diskPath: string | null }> {
  if (existingBytes != null && existingBytes.byteLength > 0) {
    return { posterBytes: Buffer.from(existingBytes), diskPath: existingPath ?? null };
  }
  if (existingPath?.trim()) {
    return { posterBytes: null, diskPath: existingPath.trim() };
  }
  return fetchPosterForStorage(posterUrl, fileBaseName);
}

export async function fetchPosterBuffer(posterUrl: string): Promise<Buffer> {
  const res = await fetch(posterUrl);
  if (!res.ok) throw new Error("Poster download failed");
  return Buffer.from(await res.arrayBuffer());
}

/** Best-effort mirror next to the data dir; returns `null` if the folder cannot be written. */
export async function tryWritePosterToDisk(fileBaseName: string, buf: Buffer): Promise<string | null> {
  try {
    await mkdir(IMAGES_DIR, { recursive: true });
    const safe = fileBaseName.replace(/[/\\?%*:|"<>]/g, "_");
    const dest = join(IMAGES_DIR, `${safe}image.jpg`);
    await writeFile(dest, buf);
    return dest;
  } catch {
    return null;
  }
}

/**
 * Download poster from TMDb; store bytes for SQLite. Optionally mirrors to `images/` when writable.
 */
export async function fetchPosterForStorage(
  posterUrl: string | null | undefined,
  fileBaseName: string
): Promise<{ posterBytes: Buffer | null; diskPath: string | null }> {
  if (!posterUrl) return { posterBytes: null, diskPath: null };
  try {
    const buf = await fetchPosterBuffer(posterUrl);
    const diskPath = await tryWritePosterToDisk(fileBaseName, buf);
    return { posterBytes: buf, diskPath };
  } catch {
    return { posterBytes: null, diskPath: null };
  }
}
