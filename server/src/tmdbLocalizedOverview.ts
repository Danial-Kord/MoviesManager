import { TMDB_API_KEY } from "./config.js";

const BASE = "https://api.themoviedb.org/3";

async function fetchJson(url: string): Promise<Record<string, unknown>> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`TMDb ${res.status}: ${t.slice(0, 200)}`);
  }
  return res.json() as Promise<Record<string, unknown>>;
}

/** Overview text for a given display language (e.g. fa-IR). */
export async function fetchTmdbOverviewLocalized(
  kind: "movie" | "tv",
  tmdbNumericId: number,
  language: string
): Promise<string | null> {
  if (!TMDB_API_KEY || !Number.isFinite(tmdbNumericId)) return null;
  const key = encodeURIComponent(TMDB_API_KEY);
  const segment = kind === "movie" ? "movie" : "tv";
  const lang = encodeURIComponent(language);
  const url = `${BASE}/${segment}/${tmdbNumericId}?api_key=${key}&language=${lang}`;
  try {
    const details = await fetchJson(url);
    const overview = (details.overview as string) || "";
    const trimmed = overview.trim();
    return trimmed.length > 0 ? trimmed : null;
  } catch {
    return null;
  }
}
