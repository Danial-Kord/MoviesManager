const BASE = typeof window === "undefined" ? "" : "";

export type MovieListItem = {
  id: string;
  name: string;
  year: string | null;
  imdbRating: string | null;
  genre: string | null;
  imagePath: string | null;
  filePath: string;
  isFavorite: boolean;
  show: boolean;
  summary: string | null;
  directors: string | null;
  actors: string | null;
  duration: string | null;
  categories: { category: { id: string; name: string } }[];
};

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

export function posterUrlForMovieId(id: string) {
  return `${BASE}/api/poster/${id}`;
}

export function streamUrlForMovieId(id: string) {
  return `${BASE}/api/stream/${id}`;
}
