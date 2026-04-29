import Link from "next/link";
import { notFound } from "next/navigation";
import { MovieDetailActions } from "@/components/MovieDetailActions";
import { MovieImage } from "@/components/MovieImage";
import { PlayLocalButton } from "@/components/PlayLocalButton";
import { formatScore } from "@/lib/formatScore";

type Movie = {
  id: string;
  name: string;
  year: string | null;
  summary: string | null;
  imdbRating: string | null;
  imdbScore: string | null;
  genre: string | null;
  directors: string | null;
  actors: string | null;
  duration: string | null;
  filePath: string;
  isFavorite: boolean;
  show: boolean;
};

async function getMovie(id: string): Promise<Movie | null> {
  const { INTERNAL_API } = await import("@/lib/server-api");
  const r = await fetch(`${INTERNAL_API}/api/movies/${id}`, { cache: "no-store" });
  if (r.status === 404) return null;
  if (!r.ok) return null;
  return r.json() as Promise<Movie>;
}

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = await getMovie(id);
  if (!m) notFound();

  const ratingLabel = formatScore(m.imdbRating);

  return (
    <div className="min-h-[70vh] bg-imdb-canvas px-4 py-8 font-imdb md:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-6">
          <Link href="/" className="text-[14px] font-medium text-imdb-muted underline-offset-4 hover:text-imdb-text hover:underline">
            ← Back to library
          </Link>
        </div>
        <div className="overflow-hidden rounded-imdb-card border border-imdb-border bg-imdb-elevated p-6 shadow-lg shadow-black/30 md:grid md:grid-cols-[minmax(200px,280px),1fr] md:gap-10 md:p-8">
          <div className="relative mx-auto mb-8 aspect-[2/3] w-full max-w-[280px] overflow-hidden rounded-imdb-card bg-imdb-surface md:mb-0">
            <MovieImage id={m.id} name={m.name} />
          </div>
          <div>
            <h1 className="text-[1.75rem] font-bold tracking-tight text-imdb-text md:text-3xl" style={{ letterSpacing: "-1.2px" }}>
              {m.name}{" "}
              {m.year && <span className="text-xl font-normal text-imdb-muted">({m.year})</span>}
            </h1>
            {ratingLabel && (
              <p className="mt-3 text-2xl font-bold text-imdb-gold">
                {ratingLabel}
                <span className="ml-1 text-sm font-normal text-imdb-muted">/10</span>
              </p>
            )}
            {m.genre && <p className="mt-2 text-[14px] text-imdb-muted">{m.genre}</p>}
            {m.duration && <p className="text-[14px] text-imdb-subtle">Runtime: {m.duration}</p>}
            <p className="mt-2 break-all text-[12px] text-imdb-subtle">File: {m.filePath}</p>
            {m.directors && (
              <p className="mt-5 text-[14px] leading-relaxed text-imdb-text">
                <span className="text-imdb-muted">Directors: </span>
                {m.directors}
              </p>
            )}
            {m.actors && (
              <p className="mt-2 text-[14px] leading-relaxed text-imdb-text">
                <span className="text-imdb-muted">Cast: </span>
                {m.actors}
              </p>
            )}
            {m.summary && (
              <p className="mt-6 text-[16px] leading-relaxed text-imdb-text">{m.summary}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <PlayLocalButton movieId={m.id}>Play</PlayLocalButton>
              <MovieDetailActions id={m.id} isFavorite={m.isFavorite} show={m.show} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
