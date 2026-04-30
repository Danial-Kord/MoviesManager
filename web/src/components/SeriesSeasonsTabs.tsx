"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PlayLocalButton } from "@/components/PlayLocalButton";
import { formatScore } from "@/lib/formatScore";
import { interpolate } from "@/lib/i18n/messages";

export type SeriesSeasonTab = {
  id: string;
  title: string;
  episodes: SeriesEpisodeRow[];
};

export type SeriesEpisodeRow = {
  id: string;
  name: string;
  seasonNumber: number | null;
  episodeNumber: number | null;
  episodeTitle: string | null;
  filePath: string;
  imdbRating: string | null;
  dubbed: boolean;
};

type TabStrings = Record<
  "episodeCardEpisode" | "episodeCardEpisodes" | "badgeDubbed" | "heroPlay" | "details",
  string
>;

function seasonEpisodeLabel(s: number | null, e: number | null): string {
  if (s == null || e == null) return "—";
  return `S${String(s).padStart(2, "0")}E${String(e).padStart(2, "0")}`;
}

export function SeriesSeasonsTabs({
  seasonsSectionTitle,
  tabs,
  strings,
}: {
  seasonsSectionTitle: string;
  tabs: SeriesSeasonTab[];
  strings: TabStrings;
}) {
  const [activeId, setActiveId] = useState(() => tabs[0]?.id ?? "");

  const active = useMemo(() => tabs.find((x) => x.id === activeId) ?? tabs[0], [tabs, activeId]);

  const episodeCountLine = (n: number) =>
    n === 1 ? interpolate(strings.episodeCardEpisode, { n }) : interpolate(strings.episodeCardEpisodes, { n });

  if (tabs.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-5 border-b border-imdb-border pb-4 text-[1.35rem] font-bold tracking-tight text-imdb-text">
        {seasonsSectionTitle}
      </h2>

      <div className="flex min-h-[min(70vh,560px)] flex-col gap-4 md:flex-row md:gap-6">
        <nav
          className="flex max-h-40 shrink-0 flex-col gap-1 overflow-y-auto overflow-x-hidden rounded-imdb border border-imdb-border bg-imdb-elevated p-2 shadow-sm md:max-h-[min(70vh,640px)] md:w-[min(100%,220px)]"
          aria-label={seasonsSectionTitle}
        >
          {tabs.map((tab) => {
            const selected = tab.id === active?.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveId(tab.id)}
                className={`flex w-full flex-col items-stretch gap-0.5 rounded-imdb px-3 py-2.5 text-start transition md:py-2 ${
                  selected
                    ? "bg-imdb-gold/15 text-imdb-text ring-2 ring-imdb-gold/50"
                    : "text-imdb-muted hover:bg-imdb-panel hover:text-imdb-text"
                }`}
              >
                <span className="text-[13px] font-semibold leading-snug">{tab.title}</span>
                <span className="text-[11px] font-medium text-imdb-dim">{episodeCountLine(tab.episodes.length)}</span>
              </button>
            );
          })}
        </nav>

        <div className="min-h-[280px] flex-1 overflow-y-auto rounded-imdb border border-imdb-border bg-imdb-elevated shadow-inner shadow-black/20 md:max-h-[min(70vh,640px)]">
          {active ? (
            <div className="divide-y divide-imdb-border p-3 md:p-4">
              {active.episodes.map((ep) => {
                const label = seasonEpisodeLabel(ep.seasonNumber, ep.episodeNumber);
                const score = formatScore(ep.imdbRating);
                return (
                  <article
                    key={ep.id}
                    className="flex flex-col gap-3 py-4 first:pt-2 md:flex-row md:items-start md:justify-between md:gap-6"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-imdb-text">
                        <span className="text-imdb-gold">{label}</span>
                        {ep.episodeTitle ? <span className="text-imdb-muted"> · {ep.episodeTitle}</span> : null}
                      </p>
                      <p className="mt-1 truncate text-[12px] text-imdb-muted" title={ep.name}>
                        {ep.name}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {score ? <span className="text-[12px] font-medium text-imdb-gold">★ {score}</span> : null}
                        {ep.dubbed ? (
                          <span className="inline-flex items-center justify-center rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wide text-imdb-gold ring-1 ring-imdb-gold/50">
                            {strings.badgeDubbed}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 line-clamp-2 break-all font-mono text-[10px] leading-snug text-imdb-subtle">
                        {ep.filePath}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2 md:flex-col md:items-stretch">
                      <PlayLocalButton movieId={ep.id}>{strings.heroPlay}</PlayLocalButton>
                      <Link
                        href={"/movie/" + ep.id}
                        className="inline-flex items-center justify-center rounded-imdb bg-imdb-panel px-[14px] py-[6px] text-[12px] font-semibold text-imdb-text transition hover:bg-imdb-rail md:text-center"
                      >
                        {strings.details}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
