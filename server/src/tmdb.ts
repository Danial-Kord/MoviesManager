import { createWriteStream } from "fs";
import { join } from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { TMDB_API_KEY, TMDB_IMAGE_BASE, IMAGES_DIR } from "./config.js";
import { mkdir } from "fs/promises";

const BASE = "https://api.themoviedb.org/3";

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

function castNames(c: Record<string, unknown>, n: number): string | null {
  const cast = c.cast;
  if (!Array.isArray(cast)) return null;
  const names: string[] = [];
  for (const item of cast.slice(0, n)) {
    const p = item as { name?: string };
    if (p.name) names.push(p.name);
  }
  return names.length ? names.join(", ") : null;
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
}

export async function enrichWithTmdb(
  name: string,
  year: string
): Promise<TmdbEnrichment | null> {
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
    `${BASE}/movie/${id}?api_key=${key}`
  )) as Record<string, unknown>;
  const credits = (await fetchJson(
    `${BASE}/movie/${id}/credits?api_key=${key}`
  )) as Record<string, unknown>;

  const rel = (details.release_date as string) || "";
  const y = rel.length >= 4 ? rel.slice(0, 4) : year;
  const va = details.vote_average;
  const voteAvg =
    typeof va === "number" ? String(va) : "0";
  const vc = details.vote_count;
  const votes =
    typeof vc === "number" ? String(vc) : "";
  const rt = details.runtime;
  const runtime =
    typeof rt === "number" ? `${rt} min` : "";
  const overview = (details.overview as string) || "";
  const title = (details.title as string) || name;
  const poster = details.poster_path as string | null;
  return {
    tmdbId: id,
    name: title,
    year: y,
    summary: overview,
    imdbRating: voteAvg,
    imdbScore: voteAvg,
    numberOfVotes: votes,
    duration: runtime,
    genre: joinGenres(details) || "",
    actors: castNames(credits, 5) || "",
    directors: directorsFromCredits(credits) || "",
    posterPath: poster ? `${TMDB_IMAGE_BASE}${poster}` : null,
    enrichmentState: "full",
  };
}

export async function downloadPosterToImagesDir(
  posterUrl: string,
  fileBaseName: string
): Promise<string> {
  await mkdir(IMAGES_DIR, { recursive: true });
  const safe = fileBaseName.replace(/[/\\?%*:|"<>]/g, "_");
  const dest = join(IMAGES_DIR, `${safe}image.jpg`);
  const res = await fetch(posterUrl);
  if (!res.ok) throw new Error("Poster download failed");
  if (!res.body) throw new Error("No body");
  const nodeStream = Readable.fromWeb(res.body as import("stream/web").ReadableStream);
  await pipeline(nodeStream, createWriteStream(dest));
  return dest;
}
