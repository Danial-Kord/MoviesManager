import Link from "next/link";
import { notFound } from "next/navigation";
import { SeriesSeasonsTabs } from "@/components/SeriesSeasonsTabs";
import { SeriesDetailPoster } from "@/components/SeriesDetailPoster";
import { CreditAvatarStrip } from "@/components/CreditAvatarStrip";
import { SeriesDetailAutoEnrich } from "@/components/SeriesDetailAutoEnrich";
import { formatScore } from "@/lib/formatScore";
import type { CreditPerson } from "@/lib/api";
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
  directors?: string | null;
  actors?: string | null;
  creditsCast?: CreditPerson[];
  creditsDirectors?: CreditPerson[];
  episodes: EpisodeRow[];
  enrichmentState?: string;
  needsRename?: boolean;
};

async function getSeries(id: string, locale: string): Promise<TvSeriesDetail | null> {
  const { INTERNAL_API } = await import("@/lib/server-api");
  const qs = locale === "fa" ? "?locale=fa" : "";
  const r = await fetch(`${INTERNAL_API}/api/series/${id}${qs}`, { cache: "no-store" });
  if (r.status === 404) return null;
  if (!r.ok) return null;
  return r.json() as Promise<TvSeriesDetail>;
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

  const hasCreditTiles =
    (s.creditsDirectors?.length ?? 0) > 0 || (s.creditsCast?.length ?? 0) > 0;

  const tabs = seasons.map((season) => ({
    id: season === null ? "unknown" : String(season),
    title: season === null ? t.seasonUnknown : season === 0 ? t.specials : `${t.seasonPrefix}${season}`,
    episodes: grouped.get(season) ?? [],
  }));

  return (
    <div className="min-h-[70vh] bg-imdb-canvas px-4 py-8 font-imdb md:px-8">
      <SeriesDetailAutoEnrich
        seriesId={s.id}
        needsRename={Boolean(s.needsRename)}
        enrichmentState={s.enrichmentState ?? "none"}
      />
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
            {hasCreditTiles ? (
              <>
                <CreditAvatarStrip title={t.directorsStrip} people={s.creditsDirectors ?? []} />
                <CreditAvatarStrip title={t.castStrip} people={s.creditsCast ?? []} showCharacter />
              </>
            ) : (
              <>
                {s.directors && (
                  <p className="mt-5 text-[14px] leading-relaxed text-imdb-text">
                    <span className="text-imdb-muted">{t.directors} </span>
                    {s.directors}
                  </p>
                )}
                {s.actors && (
                  <p className="mt-2 text-[14px] leading-relaxed text-imdb-text">
                    <span className="text-imdb-muted">{t.cast} </span>
                    {s.actors}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <SeriesSeasonsTabs
          seasonsSectionTitle={t.seasonsTitle}
          tabs={tabs}
          strings={{
            episodeCardEpisode: t.episodeCardEpisode,
            episodeCardEpisodes: t.episodeCardEpisodes,
            badgeDubbed: t.badgeDubbed,
            heroPlay: t.heroPlay,
            details: t.details,
          }}
        />
      </div>
    </div>
  );
}
