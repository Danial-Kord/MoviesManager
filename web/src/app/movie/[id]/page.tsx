import Link from "next/link";
import { notFound } from "next/navigation";
import { MovieDetailActions } from "@/components/MovieDetailActions";
import { MovieImage } from "@/components/MovieImage";

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

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <div className="mb-4">
        <Link href="/" className="text-sm text-gray-400 hover:text-white">
          ← Back
        </Link>
      </div>
      <div className="grid gap-8 md:grid-cols-[240px,1fr]">
        <div className="relative aspect-[2/3] w-full max-w-xs overflow-hidden rounded-lg bg-surface">
          <MovieImage id={m.id} name={m.name} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">
            {m.name}{" "}
            {m.year && <span className="text-xl font-normal text-gray-400">({m.year})</span>}
          </h1>
          {m.imdbRating && (
            <p className="mt-2 text-2xl font-bold text-[#F5C518]">
              {m.imdbRating}
              <span className="ml-1 text-sm font-normal text-gray-500">/10</span>
            </p>
          )}
          {m.genre && <p className="mt-2 text-sm text-amber-100/80">{m.genre}</p>}
          {m.duration && <p className="text-sm text-gray-500">Runtime: {m.duration}</p>}
          <p className="mt-2 text-sm text-gray-500 break-all">File: {m.filePath}</p>
          {m.directors && (
            <p className="mt-4 text-sm text-gray-300">
              <span className="text-gray-500">Directors: </span>
              {m.directors}
            </p>
          )}
          {m.actors && (
            <p className="mt-2 text-sm text-gray-300">
              <span className="text-gray-500">Cast: </span>
              {m.actors}
            </p>
          )}
          {m.summary && <p className="mt-6 text-base leading-relaxed text-gray-200">{m.summary}</p>}
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href={"/watch/" + m.id}
              className="inline-flex rounded bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-gray-200"
            >
              Play
            </Link>
            <MovieDetailActions id={m.id} isFavorite={m.isFavorite} show={m.show} />
          </div>
        </div>
      </div>
    </div>
  );
}
