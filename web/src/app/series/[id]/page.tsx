import Link from "next/link";
import { notFound } from "next/navigation";
import { PlayLocalButton } from "@/components/PlayLocalButton";
import { SeriesDetailPoster } from "@/components/SeriesDetailPoster";
import { formatScore } from "@/lib/formatScore";
import { getLocale } from "@/lib/i18n/getLocale";
import { getMessages, interpolate } from "@/lib/i18n/messages";

type EpisodeRow = {
  id: string;
  name: string;
  seasonNumber: number | null;
  episodeNumber: number | null;
  episodeTitle: string | null;
  filePath: string;
  imdbRating: string | null;
  dubbed: boolean;
};

type TvSeriesDetail = {
  id: string;
  title: string;
  year: string | null;
  summary: string | null;
  imdbRating: string | null;
  genre: string | null;
  imagePath: string | null;
  episodes: EpisodeRow[];
};

async function getSeries(id: string, locale: string): Promise<TvSeriesDetail | null> {
  const { INTERNAL_API } = await import("@/lib/server-api");
  const qs = locale === "fa" ? "?locale=fa" : "";
  const r = await fetch(`${INTERNAL_API}/api/series/${id}${qs}`, { cache: "no-store" });
  if (r.status === 404) return null;
  if (!r.ok) return null;
  return r.json() as Promise<TvSeriesDetail>;
}

function seasonEpisodeLabel(s: number | null, e: number | null): string {
  if (s == null || e == null) return "—";
  return `S${String(s).padStart(2, "0")}E${String(e).padStart(2, "0")}`;
}

function groupEpisodesBySeason(episodes: EpisodeRow[]): Map<number | null, EpisodeRow[]> {
  const map = new Map<number | null, EpisodeRow[]>();
  for (const ep of episodes) {
    const key = ep.seasonNumber ?? null;
    const bucket = map.get(key);
    if (bucket) bucket.push(ep);
    else map.set(key, [ep]);
  }
  for (const list of map.values()) {
    list.sort((a, b) => (a.episodeNumber ?? 0) - (b.episodeNumber ?? 0));
  }
  return map;
}

function seasonSortOrder(a: number | null, b: number | null): number {
  const rank = (x: number | null) => (x === null ? Number.POSITIVE_INFINITY : x);
  return rank(a) - rank(b);
}

export default async function SeriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = await getLocale();
  const t = getMessages(locale);
  const s = await getSeries(id, locale);
  if (!s) notFound();

  const ratingLabel = formatScore(s.imdbRating);
  const grouped = groupEpisodesBySeason(s.episodes);
  const seasons = [...grouped.keys()].sort(seasonSortOrder);

  const diskLine =
    s.episodes.length === 1
      ? interpolate(t.diskEpisodeLineSingular, { seasons: seasons.length, episodes: s.episodes.length })
      : interpolate(t.diskEpisodesLine, { seasons: seasons.length, episodes: s.episodes.length });

  return (
    <div className="min-h-[70vh] bg-imdb-canvas px-4 py-8 font-imdb md:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-6 flex flex-wrap gap-3 text-[14px]">
          <Link href="/" className="font-medium text-imdb-muted underline-offset-4 hover:text-imdb-text hover:underline">
            {t.backToLibrary}
          </Link>
        </div>

        <div className="overflow-hidden rounded-imdb-card border border-imdb-border bg-imdb-elevated p-6 shadow-lg shadow-black/30 md:grid md:grid-cols-[minmax(200px,280px),1fr] md:gap-10 md:p-8">
          <div className="relative mx-auto mb-8 aspect-[2/3] w-full max-w-[280px] overflow-hidden rounded-imdb-card bg-imdb-surface md:mb-0">
            <SeriesDetailPoster seriesId={s.id} title={s.title} />
          </div>
          <div>
            <h1 className="text-[1.75rem] font-bold tracking-tight text-imdb-text md:text-3xl" style={{ letterSpacing: "-1.2px" }}>
              {s.title}
              {s.year && <span className="text-xl font-normal text-imdb-muted"> ({s.year})</span>}
            </h1>
            {ratingLabel && (
              <p className="mt-3 text-2xl font-bold text-imdb-gold">
                {ratingLabel}
                <span className="ml-1 text-sm font-normal text-imdb-muted">/10</span>
              </p>
            )}
            {s.genre && <p className="mt-2 text-[14px] text-imdb-muted">{s.genre}</p>}
            <p className="mt-2 text-[14px] text-imdb-subtle">{diskLine}</p>
            {s.summary && (
              <p className="mt-6 text-[16px] leading-relaxed text-imdb-text" dir={locale === "fa" ? "rtl" : "ltr"}>
                {s.summary}
              </p>
            )}
          </div>
        </div>

        <section className="mt-12 space-y-12">
          <h2 className="border-b border-imdb-border pb-4 text-[1.35rem] font-bold tracking-tight text-imdb-text">{t.seasonsTitle}</h2>

          {seasons.map((season) => {
            const eps = grouped.get(season) ?? [];
            const title =
              season === null ? t.seasonUnknown : season === 0 ? t.specials : `${t.seasonPrefix}${season}`;
            return (
              <div key={season === null ? "unknown" : String(season)}>
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="text-lg font-semibold tracking-tight text-imdb-text">{title}</h3>
                  <span className="text-[13px] text-imdb-muted">
                    {eps.length === 1
                      ? interpolate(t.episodeCardEpisode, { n: eps.length })
                      : interpolate(t.episodeCardEpisodes, { n: eps.length })}
                  </span>
                </div>
                <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {eps.map((ep) => {
                    const label = seasonEpisodeLabel(ep.seasonNumber, ep.episodeNumber);
                    const score = formatScore(ep.imdbRating);
                    return (
                      <article
                        key={ep.id}
                        className="w-[min(92vw,280px)] shrink-0 snap-start rounded-imdb-card border border-imdb-border bg-imdb-elevated p-4 shadow-sm"
                      >
                        <p className="font-semibold text-imdb-text">
                          <span className="text-imdb-gold">{label}</span>
                          {ep.episodeTitle ? <span className="text-imdb-muted"> · {ep.episodeTitle}</span> : null}
                        </p>
                        <p className="mt-1 truncate text-[12px] text-imdb-muted" title={ep.name}>
                          {ep.name}
                        </p>
                        {score ? (
                          <p className="mt-2 text-[12px] font-medium text-imdb-gold">★ {score}</p>
                        ) : null}
                        {ep.dubbed ? (
                          <span className="mt-2 inline-flex items-center justify-center rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wide text-imdb-gold ring-1 ring-imdb-gold/50">
                            {t.badgeDubbed}
                          </span>
                        ) : null}
                        <p className="mt-2 line-clamp-2 break-all font-mono text-[10px] leading-snug text-imdb-subtle">
                          {ep.filePath}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <PlayLocalButton movieId={ep.id}>{t.heroPlay}</PlayLocalButton>
                          <Link
                            href={"/movie/" + ep.id}
                            className="inline-flex items-center justify-center rounded-imdb bg-imdb-panel px-[14px] py-[6px] text-[12px] font-semibold text-imdb-text transition hover:bg-imdb-rail"
                          >
                            {t.details}
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
