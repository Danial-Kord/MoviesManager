const BASE = typeof window === "undefined" ? "" : "";

export type MovieListItem = {
  id: string;
  name: string;
  year: string | null;
  imdbRating: string | null;
  genre: string | null;
  imagePath: string | null;
  /** Present on browse items when poster can be loaded (path or DB bytes). */
  posterAvailable?: boolean;
  filePath: string;
  isFavorite: boolean;
  show: boolean;
  summary: string | null;
  directors: string | null;
  actors: string | null;
  duration: string | null;
  categories: { category: { id: string; name: string } }[];
  mediaKind?: string;
  dubbed?: boolean;
};

export type BrowseSeriesItem = {
  kind: "series";
  id: string;
  title: string;
  year: string | null;
  imagePath: string | null;
  /** True when a poster is available from disk path or DB blob (`GET /api/poster/…`). */
  posterAvailable?: boolean;
  episodeCount: number;
  imdbRating: string | null;
  isFavorite: boolean;
  summary: string | null;
  genre: string | null;
  updatedAt: string;
};

export type BrowseMovieItem = MovieListItem & {
  kind: "movie";
  updatedAt: string;
};

export type BrowseItem = BrowseSeriesItem | BrowseMovieItem;

export async function fetchMovies(params: URLSearchParams) {
  const r = await fetch(`${BASE}/api/movies?` + params.toString(), { cache: "no-store" });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{
    total: number;
    page: number;
    pageSize: number;
    items: MovieListItem[];
  }>;
}

export async function fetchLibraryBrowse(params: URLSearchParams) {
  const r = await fetch(`${BASE}/api/library/browse?` + params.toString(), { cache: "no-store" });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{
    total: number;
    page: number;
    pageSize: number;
    items: BrowseItem[];
  }>;
}

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

export async function fetchLibraryDuplicates() {
  const r = await fetch(`${BASE}/api/library/duplicates`, { cache: "no-store" });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{ groups: DuplicateLibraryGroup[]; duplicateRowCount: number }>;
}

export async function scanLibrary() {
  return fetch(`${BASE}/api/scan`, { method: "POST" });
}

export async function enrichBulk(limit = 30) {
  return fetch(`${BASE}/api/enrich-bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ limit }),
  });
}

/** Must match server `RESET_DATABASE_CONFIRM` — type this phrase to enable erase. */
export const RESET_DATABASE_CONFIRM_PHRASE = "RESET_LIBRARY_DATABASE";

export async function fetchDatabaseInfo() {
  const r = await fetch(`${BASE}/api/database/info`, { cache: "no-store" });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{ databaseFile: string; dataDir: string; imagesDir: string }>;
}

export async function resetLibraryDatabase(): Promise<void> {
  const r = await fetch(`${BASE}/api/database/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ confirm: RESET_DATABASE_CONFIRM_PHRASE }),
  });
  if (!r.ok) {
    let msg = await r.text();
    try {
      const j = JSON.parse(msg) as { error?: string };
      if (j.error) msg = j.error;
    } catch {
      /* raw */
    }
    throw new Error(msg || r.statusText);
  }
}

export function posterUrlForMovieId(id: string) {
  return `${BASE}/api/poster/${id}`;
}

export function posterUrlForSeriesId(id: string) {
  return `${BASE}/api/poster/series/${id}`;
}

/** PATCH movie fields (favorite, visibility, …). */
export async function patchMovie(id: string, body: { isFavorite?: boolean; show?: boolean }) {
  const r = await fetch(`${BASE}/api/movies/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
}

export async function patchSeries(id: string, body: { isFavorite?: boolean; show?: boolean }) {
  const r = await fetch(`${BASE}/api/series/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
}

/** Ask local API to open the video file with the OS default app (VLC, Movies & TV, etc.). */
export async function playLocal(movieId: string): Promise<void> {
  const r = await fetch(`${BASE}/api/movies/${movieId}/play-local`, { method: "POST" });
  if (!r.ok) {
    let msg = await r.text();
    try {
      const j = JSON.parse(msg) as { error?: string };
      if (j.error) msg = j.error;
    } catch {
      /* raw text */
    }
    throw new Error(msg || r.statusText);
  }
}
