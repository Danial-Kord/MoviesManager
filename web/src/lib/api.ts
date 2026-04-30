import { readNdjsonResponse } from "./ndjsonStream";

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
  seriesId?: string | null;
  dubbed?: boolean;
  enrichmentState?: string;
  needsRename?: boolean;
  /** True when enrichment is complete (full metadata + no pending rename). Episodes follow parent series. */
  isEnriched?: boolean;
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
  enrichmentState?: string;
  needsRename?: boolean;
  /** True when series enrichment is complete (full + no rename pending). */
  isEnriched?: boolean;
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

export async function fetchLibraryGenres() {
  const r = await fetch(`${BASE}/api/library/genres`, { cache: "no-store" });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{ genres: string[] }>;
}

export type DubbedRuleDto = {
  pattern: string;
  mode: "contains" | "regex";
  enabled?: boolean;
};

async function readHttpErrorMessage(r: Response): Promise<string> {
  const raw = await r.text();
  try {
    const j = JSON.parse(raw) as { error?: unknown };
    if (typeof j.error === "string" && j.error.trim()) return j.error;
  } catch {
    /* ignore */
  }
  return raw.trim() || `HTTP ${r.status}`;
}

export async function fetchLibrarySettings(): Promise<{ dubbedRules: DubbedRuleDto[] }> {
  const r = await fetch(`${BASE}/api/settings/library`, { cache: "no-store" });
  if (!r.ok) throw new Error(await readHttpErrorMessage(r));
  return r.json() as Promise<{ dubbedRules: DubbedRuleDto[] }>;
}

export async function patchLibrarySettings(body: {
  dubbedRules: DubbedRuleDto[];
}): Promise<{ dubbedRules: DubbedRuleDto[] }> {
  const r = await fetch(`${BASE}/api/settings/library`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await readHttpErrorMessage(r));
  return r.json() as Promise<{ dubbedRules: DubbedRuleDto[] }>;
}

export async function postRecomputeDubbed(): Promise<{ ok: boolean; rowsChecked: number; rowsUpdated: number }> {
  const r = await fetch(`${BASE}/api/library/recompute-dubbed`, { method: "POST" });
  if (!r.ok) throw new Error(await readHttpErrorMessage(r));
  return r.json() as Promise<{ ok: boolean; rowsChecked: number; rowsUpdated: number }>;
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

export type NeedsRenameSeriesRow = {
  id: string;
  title: string;
  year: string | null;
  episodeCount: number;
  sampleEpisodes: Array<{
    id: string;
    filePath: string;
    folderPath: string;
    seasonNumber: number | null;
    episodeNumber: number | null;
  }>;
};

export type NeedsRenameMovieRow = {
  id: string;
  name: string;
  year: string | null;
  filePath: string;
  folderPath: string;
};

export async function fetchLibraryNeedsRename() {
  const r = await fetch(`${BASE}/api/library/needs-rename`, { cache: "no-store" });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{ series: NeedsRenameSeriesRow[]; movies: NeedsRenameMovieRow[] }>;
}

export type ScanProgressEvent = {
  type: "progress";
  job: "scan";
  scanPhase: "discover" | "import";
  pathsDone: number;
  pathsTotal: number;
  filesDiscovered?: number;
  filesDone?: number;
  filesTotal?: number;
  percent: number;
};

export type ScanSummary = {
  scanned: number;
  moviesUpserted: number;
  episodesUpserted: number;
  seriesOrphansRemoved: number;
  seriesDistinct: number;
};

export async function scanLibraryStream(onProgress: (e: ScanProgressEvent) => void): Promise<ScanSummary> {
  const r = await fetch(`${BASE}/api/scan`, { method: "POST" });
  let complete: ScanSummary | undefined;
  await readNdjsonResponse(r, (obj) => {
    if (obj.type === "error") throw new Error(String((obj as { message?: string }).message ?? "Scan failed"));
    if (obj.type === "complete") {
      complete = {
        scanned: Number((obj as { scanned?: number }).scanned ?? 0),
        moviesUpserted: Number((obj as { moviesUpserted?: number }).moviesUpserted ?? 0),
        episodesUpserted: Number((obj as { episodesUpserted?: number }).episodesUpserted ?? 0),
        seriesOrphansRemoved: Number((obj as { seriesOrphansRemoved?: number }).seriesOrphansRemoved ?? 0),
        seriesDistinct: Number((obj as { seriesDistinct?: number }).seriesDistinct ?? 0),
      };
      return;
    }
    if (obj.type === "progress") onProgress(obj as unknown as ScanProgressEvent);
  });
  if (!complete) throw new Error("Scan finished without summary");
  return complete;
}

export type EnrichProgressEvent = {
  type: "progress";
  job: "enrich";
  done: number;
  total: number;
  percent: number;
};

export type EnrichBulkResultRow = { id: string; kind: "series" | "movie"; ok: boolean; error?: string };

export type EnrichSummary = {
  processed: number;
  results: EnrichBulkResultRow[];
};

/** Mirrors server `POST /api/enrich-bulk` (`limit` default and ceiling). */
export const ENRICH_BULK_DEFAULT = 50;
export const ENRICH_BULK_MAX = 200;

export async function enrichBulkStream(
  limit: number,
  onProgress: (e: EnrichProgressEvent) => void
): Promise<EnrichSummary> {
  const clamped = Math.min(ENRICH_BULK_MAX, Math.max(1, Math.floor(Number(limit)) || ENRICH_BULK_DEFAULT));
  const r = await fetch(`${BASE}/api/enrich-bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ limit: clamped }),
  });
  let complete: EnrichSummary | undefined;
  await readNdjsonResponse(r, (obj) => {
    if (obj.type === "error") throw new Error(String((obj as { message?: string }).message ?? "Enrich failed"));
    if (obj.type === "complete") {
      complete = {
        processed: Number((obj as { processed?: number }).processed ?? 0),
        results: Array.isArray((obj as { results?: unknown }).results)
          ? ((obj as { results: EnrichBulkResultRow[] }).results)
          : [],
      };
      return;
    }
    if (obj.type === "progress") onProgress(obj as unknown as EnrichProgressEvent);
  });
  if (!complete) throw new Error("Enrich finished without summary");
  return complete;
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

export type CreditPerson = {
  tmdbPersonId: number;
  name: string;
  character: string | null;
  photoAvailable: boolean;
};

export function personPhotoUrl(tmdbPersonId: number): string {
  return `${BASE}/api/person-photo/${tmdbPersonId}`;
}

/** Single-title TMDb enrich. Returns true only on HTTP 200. */
export async function enrichMovieById(movieId: string): Promise<boolean> {
  const r = await fetch(`${BASE}/api/movies/${movieId}/enrich`, { method: "POST" });
  return r.ok;
}

/** Manual enrich from movie detail; throws with server error message on failure. */
export async function postMovieEnrich(movieId: string): Promise<void> {
  const r = await fetch(`${BASE}/api/movies/${movieId}/enrich`, { method: "POST" });
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

/** Series-level TMDb enrich. Returns true only on HTTP 200. */
export async function enrichSeriesById(seriesId: string): Promise<boolean> {
  const r = await fetch(`${BASE}/api/series/${seriesId}/enrich`, { method: "POST" });
  return r.ok;
}

export async function renameMovieFile(movieId: string, fileName: string): Promise<Record<string, unknown>> {
  const r = await fetch(`${BASE}/api/movies/${movieId}/rename-file`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName }),
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
  return r.json() as Promise<Record<string, unknown>>;
}

/** PATCH movie fields (favorite, visibility, needsRename, …). */
export async function patchMovie(id: string, body: { isFavorite?: boolean; show?: boolean; needsRename?: boolean }) {
  const r = await fetch(`${BASE}/api/movies/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
}

export async function patchSeries(id: string, body: { isFavorite?: boolean; show?: boolean; needsRename?: boolean }) {
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
