import Link from "next/link";
import { notFound } from "next/navigation";
import { MovieDetailActions } from "@/components/MovieDetailActions";
import { MovieImage } from "@/components/MovieImage";
import { RenameMovieFileForm } from "@/components/RenameMovieFileForm";
import { videoBasenameFromPath } from "@/lib/videoBasenameFromPath";
import { CreditAvatarStrip } from "@/components/CreditAvatarStrip";
import { PlayLocalButton } from "@/components/PlayLocalButton";
import type { CreditPerson } from "@/lib/api";
import { formatScore } from "@/lib/formatScore";
import { getLocale } from "@/lib/i18n/getLocale";
import { getMessages } from "@/lib/i18n/messages";

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
  mediaKind: string;
  seasonNumber: number | null;
  episodeNumber: number | null;
  episodeTitle: string | null;
  series: { id: string; title: string } | null;
  dubbed: boolean;
  creditsCast?: CreditPerson[];
  creditsDirectors?: CreditPerson[];
};

async function getMovie(id: string, locale: string): Promise<Movie | null> {
  const { INTERNAL_API } = await import("@/lib/server-api");
  const qs = locale === "fa" ? "?locale=fa" : "";
  const r = await fetch(`${INTERNAL_API}/api/movies/${id}${qs}`, { cache: "no-store" });
  if (r.status === 404) return null;
  if (!r.ok) return null;
  return r.json() as Promise<Movie>;
}

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = await getLocale();
  const t = getMessages(locale);
  const m = await getMovie(id, locale);
  if (!m) notFound();

  const ratingLabel = formatScore(m.imdbRating);
  const isEpisode = m.mediaKind === "episode" && m.series;
  const epLabel =
    m.seasonNumber != null && m.episodeNumber != null
      ? `S${String(m.seasonNumber).padStart(2, "0")}E${String(m.episodeNumber).padStart(2, "0")}`
      : null;

  const hasCreditTiles =
    (m.creditsDirectors?.length ?? 0) > 0 || (m.creditsCast?.length ?? 0) > 0;

  return (
    <div className="min-h-[70vh] bg-imdb-canvas px-4 py-8 font-imdb md:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-6">
          <Link href="/" className="text-[14px] font-medium text-imdb-muted underline-offset-4 hover:text-imdb-text hover:underline">
            {t.backToLibrary}
          </Link>
          {isEpisode && m.series && (
            <nav className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-imdb-muted">
              <Link href={"/series/" + m.series.id} className="font-medium text-imdb-text underline-offset-4 hover:underline">
                {m.series.title}
              </Link>
              {epLabel && (
                <>
                  <span aria-hidden>/</span>
                  <span>{epLabel}</span>
                </>
              )}
            </nav>
          )}
        </div>
        <div className="overflow-hidden rounded-imdb-card border border-imdb-border bg-imdb-elevated p-6 shadow-lg shadow-black/30 md:grid md:grid-cols-[minmax(200px,280px),1fr] md:gap-10 md:p-8">
          <div className="relative mx-auto mb-8 aspect-[2/3] w-full max-w-[280px] overflow-hidden rounded-imdb-card bg-imdb-surface md:mb-0">
            <MovieImage id={m.id} name={m.name} seriesId={isEpisode ? m.series?.id ?? null : null} />
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
            {m.episodeTitle && <p className="mt-2 text-[14px] text-imdb-muted">{m.episodeTitle}</p>}
            {m.genre && <p className="mt-2 text-[14px] text-imdb-muted">{m.genre}</p>}
            {m.duration && (
              <p className="text-[14px] text-imdb-subtle">
                {t.runtime} {m.duration}
              </p>
            )}
            <p className="mt-2 break-all text-[12px] text-imdb-subtle">
              {t.fileLabel} {m.filePath}
            </p>
            <RenameMovieFileForm
              movieId={m.id}
              initialFileName={videoBasenameFromPath(m.filePath)}
              refreshAfterRename
            />
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
              <span className="text-imdb-muted">{t.dubbedLabel}</span>
              {m.dubbed ? (
                <span className="inline-flex h-6 items-center justify-center rounded-full bg-black/35 px-2.5 text-[11px] font-bold uppercase leading-none tracking-wide text-imdb-gold ring-2 ring-imdb-gold/55">
                  {t.badgeDubbed}
                </span>
              ) : (
                <span className="text-imdb-muted">{t.dubbedNo}</span>
              )}
            </div>
            {m.summary && (
              <p className="mt-6 text-[16px] leading-relaxed text-imdb-text" dir={locale === "fa" ? "rtl" : "ltr"}>
                {m.summary}
              </p>
            )}
            {hasCreditTiles ? (
              <>
                <CreditAvatarStrip title={t.directorsStrip} people={m.creditsDirectors ?? []} />
                <CreditAvatarStrip title={t.castStrip} people={m.creditsCast ?? []} showCharacter />
              </>
            ) : (
              <>
                {m.directors && (
                  <p className="mt-5 text-[14px] leading-relaxed text-imdb-text">
                    <span className="text-imdb-muted">{t.directors} </span>
                    {m.directors}
                  </p>
                )}
                {m.actors && (
                  <p className="mt-2 text-[14px] leading-relaxed text-imdb-text">
                    <span className="text-imdb-muted">{t.cast} </span>
                    {m.actors}
                  </p>
                )}
              </>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <PlayLocalButton movieId={m.id}>{t.heroPlay}</PlayLocalButton>
              <MovieDetailActions id={m.id} isFavorite={m.isFavorite} show={m.show} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
