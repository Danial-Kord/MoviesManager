import Link from "next/link";
import type { Metadata } from "next";
import { INTERNAL_API } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Database · Movie Manager",
  description: "All Movie rows from the local SQLite database",
};

type MovieDbRow = {
  id: string;
  name: string;
  year: string | null;
  mediaKind: string;
  seriesId: string | null;
  seasonNumber: number | null;
  episodeNumber: number | null;
  episodeTitle: string | null;
  dubbed: boolean;
  series: { id: string; title: string } | null;
  filePath: string;
  folderPath: string;
  imdbScore: string | null;
  imdbRating: string | null;
  summary: string | null;
  fullSummary: string | null;
  actors: string | null;
  directors: string | null;
  genre: string | null;
  imagePath: string | null;
  duration: string | null;
  numberOfVotes: string | null;
  tmdbId: number | null;
  tmdbSearchJson?: unknown;
  tmdbDetailsJson?: unknown;
  tmdbCreditsJson?: unknown;
  show: boolean;
  isFavorite: boolean;
  enrichmentState: string;
  createdAt: string;
  updatedAt: string;
  categories: { category: { id: string; name: string } }[];
};

async function loadRows(): Promise<{ total: number; items: MovieDbRow[] } | null> {
  try {
    const r = await fetch(`${INTERNAL_API}/api/movies/all-rows`, { cache: "no-store" });
    if (!r.ok) return null;
    return r.json();
  } catch {
    return null;
  }
}

function jsonStoredHint(value: unknown): string | null {
  if (value == null) return null;
  try {
    return `${JSON.stringify(value).length} chars`;
  } catch {
    return "stored";
  }
}

function TextCell({ value }: { value: string | null | undefined }) {
  const t = value ?? "";
  return (
    <td className="max-h-48 min-w-[100px] max-w-lg overflow-auto border border-imdb-border px-2 py-1 align-top font-mono text-[11px] text-imdb-text">
      <span className="whitespace-pre-wrap break-words">{t === "" ? "—" : t}</span>
    </td>
  );
}

const COLUMNS = [
  "id",
  "name",
  "year",
  "mediaKind",
  "seriesId",
  "seriesTitle",
  "seasonNumber",
  "episodeNumber",
  "episodeTitle",
  "dubbed",
  "filePath",
  "folderPath",
  "imdbScore",
  "imdbRating",
  "numberOfVotes",
  "genre",
  "duration",
  "tmdbId",
  "tmdbSearchRaw",
  "tmdbDetailsRaw",
  "tmdbCreditsRaw",
  "show",
  "isFavorite",
  "enrichmentState",
  "summary",
  "fullSummary",
  "actors",
  "directors",
  "imagePath",
  "categories",
  "createdAt",
  "updatedAt",
] as const;

export default async function DatabasePage() {
  const data = await loadRows();

  if (!data) {
    return (
      <div className="min-h-[70vh] bg-imdb-canvas px-4 py-8 font-imdb md:px-8">
        <div className="mx-auto max-w-[1400px]">
          <Link href="/" className="text-[14px] text-imdb-muted underline-offset-4 hover:text-imdb-text hover:underline">
            ← Home
          </Link>
          <p className="mt-6 rounded-imdb-card border border-imdb-error/40 bg-red-950/40 px-4 py-3 text-sm text-imdb-error">
            Could not load database rows. Ensure the local API is running on port 4000 (e.g.{" "}
            <code className="rounded bg-imdb-panel px-1 font-mono text-[12px] text-imdb-text">npm run dev</code> from the repo
            root).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-imdb-canvas px-4 py-8 font-imdb md:px-6">
      <div className="mx-auto max-w-[100vw]">
        <div className="mb-6">
          <Link href="/" className="text-[14px] text-imdb-muted underline-offset-4 hover:text-imdb-text hover:underline">
            ← Home
          </Link>
          <h1 className="mt-3 text-[1.75rem] font-bold tracking-tight text-imdb-text">Database</h1>
          <p className="mt-1 max-w-3xl text-[14px] leading-relaxed text-imdb-muted">
            Full <code className="rounded bg-imdb-panel px-1 font-mono text-[13px] text-imdb-text">Movie</code> rows returned by
            the API (<span className="text-imdb-text">{data.total}</span> rows). Category names are joined from{" "}
            <code className="rounded bg-imdb-panel px-1 font-mono text-[12px] text-imdb-text">MovieCategory</code>. Scroll the table
            horizontally if columns do not fit.
          </p>
        </div>

        <div className="overflow-x-auto rounded-imdb-card border border-imdb-border bg-imdb-elevated shadow-lg shadow-black/25">
          <table className="w-max min-w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-imdb-border bg-imdb-panel">
                {COLUMNS.map((col) => (
                  <th
                    key={col}
                    scope="col"
                    className="whitespace-nowrap border border-imdb-border px-2 py-2 text-[11px] font-semibold uppercase tracking-wide text-imdb-muted"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.items.map((row) => (
                <tr key={row.id} className="even:bg-imdb-surface/35 hover:bg-imdb-hover/40">
                  <TextCell value={row.id} />
                  <TextCell value={row.name} />
                  <TextCell value={row.year} />
                  <TextCell value={row.mediaKind} />
                  <TextCell value={row.seriesId} />
                  <TextCell value={row.series?.title ?? null} />
                  <TextCell value={row.seasonNumber != null ? String(row.seasonNumber) : null} />
                  <TextCell value={row.episodeNumber != null ? String(row.episodeNumber) : null} />
                  <TextCell value={row.episodeTitle} />
                  <TextCell value={row.dubbed ? "true" : "false"} />
                  <TextCell value={row.filePath} />
                  <TextCell value={row.folderPath} />
                  <TextCell value={row.imdbScore} />
                  <TextCell value={row.imdbRating} />
                  <TextCell value={row.numberOfVotes} />
                  <TextCell value={row.genre} />
                  <TextCell value={row.duration} />
                  <TextCell value={row.tmdbId != null ? String(row.tmdbId) : null} />
                  <TextCell value={jsonStoredHint(row.tmdbSearchJson)} />
                  <TextCell value={jsonStoredHint(row.tmdbDetailsJson)} />
                  <TextCell value={jsonStoredHint(row.tmdbCreditsJson)} />
                  <TextCell value={row.show ? "true" : "false"} />
                  <TextCell value={row.isFavorite ? "true" : "false"} />
                  <TextCell value={row.enrichmentState} />
                  <TextCell value={row.summary} />
                  <TextCell value={row.fullSummary} />
                  <TextCell value={row.actors} />
                  <TextCell value={row.directors} />
                  <TextCell value={row.imagePath} />
                  <TextCell value={row.categories.map((c) => c.category.name).join(", ") || null} />
                  <TextCell value={row.createdAt} />
                  <TextCell value={row.updatedAt} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
