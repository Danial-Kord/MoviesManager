"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { IconRename } from "@/components/icons";
import { RenameMovieFileForm, videoBasenameFromPath } from "@/components/RenameMovieFileForm";
import {
  fetchLibraryNeedsRename,
  patchMovie,
  patchSeries,
  type NeedsRenameMovieRow,
  type NeedsRenameSeriesRow,
} from "@/lib/api";
import { useLocale } from "@/lib/i18n/context";
import { interpolate } from "@/lib/i18n/messages";

export function NeedsRenameClient() {
  const { t } = useLocale();
  const [series, setSeries] = useState<NeedsRenameSeriesRow[] | null>(null);
  const [movies, setMovies] = useState<NeedsRenameMovieRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const data = await fetchLibraryNeedsRename();
      setSeries(data.series);
      setMovies(data.movies);
    } catch (e) {
      setErr((e as Error).message);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function resolveSeries(id: string) {
    const key = `series:${id}`;
    setBusyKey(key);
    try {
      await patchSeries(id, { needsRename: false });
      await load();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusyKey(null);
    }
  }

  async function resolveMovie(id: string) {
    const key = `movie:${id}`;
    setBusyKey(key);
    try {
      await patchMovie(id, { needsRename: false });
      await load();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusyKey(null);
    }
  }

  const loading = series === null || movies === null;
  const empty = !loading && series.length === 0 && movies.length === 0;

  return (
    <div className="mx-auto max-w-[960px] space-y-8">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-imdb-card border border-imdb-border bg-imdb-elevated shadow-md shadow-black/25 ring-1 ring-white/5">
          <IconRename className="text-imdb-gold" size={26} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-[1.75rem] font-bold tracking-tight text-imdb-text md:text-[2rem]" style={{ letterSpacing: "-1.2px" }}>
            {t("needsRenameTitle")}
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-imdb-muted">{t("needsRenameIntro")}</p>
        </div>
      </div>

      {err && (
        <div className="rounded-imdb border border-imdb-error/50 bg-red-950/35 px-4 py-3 text-[13px] text-imdb-error">{err}</div>
      )}

      {loading && <p className="text-[14px] text-imdb-muted">{t("loading")}</p>}

      {empty && !err && (
        <p className="rounded-imdb border border-imdb-border bg-imdb-elevated px-5 py-8 text-center text-[14px] text-imdb-muted">
          {t("needsRenameEmpty")}
        </p>
      )}

      {!loading && series.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-imdb-dim">{t("needsRenameSeries")}</h2>
          <ul className="space-y-4">
            {series.map((s) => (
              <li
                key={s.id}
                className="overflow-hidden rounded-imdb-card border border-imdb-border bg-imdb-elevated shadow-sm shadow-black/20"
              >
                <div className="flex flex-wrap items-center gap-2 border-b border-imdb-border bg-imdb-panel/40 px-4 py-3 md:px-5">
                  <h3 className="min-w-0 flex-1 text-[15px] font-semibold leading-snug text-imdb-text">
                    {s.title}
                    {s.year ? <span className="font-normal text-imdb-muted"> ({s.year})</span> : null}
                  </h3>
                <Link
                  href={"/series/" + s.id}
                  className="rounded-imdb bg-imdb-panel px-3 py-1 text-[11px] font-semibold text-imdb-text ring-1 ring-imdb-border transition hover:bg-imdb-rail"
                >
                  {t("duplicatesOpen")}
                </Link>
                  <button
                    type="button"
                    disabled={busyKey === `series:${s.id}`}
                    onClick={() => void resolveSeries(s.id)}
                    className="rounded-imdb bg-imdb-gold/90 px-3 py-1 text-[11px] font-semibold text-black transition hover:brightness-95 disabled:opacity-50"
                  >
                    {t("needsRenameResolved")}
                  </button>
                </div>
                <div className="px-4 py-3 md:px-5 md:py-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-imdb-dim">
                    {interpolate(t("needsRenameEpisodesHint"), { n: s.episodeCount })}
                  </p>
                  <ul className="space-y-2">
                    {s.sampleEpisodes.map((ep) => (
                      <li key={ep.id} className="rounded-imdb border border-imdb-border/80 bg-imdb-canvas/35 p-2">
                        <p className="break-all font-mono text-[11px] leading-relaxed text-imdb-text md:text-[12px]">{ep.filePath}</p>
                        <Link href={"/movie/" + ep.id} className="mt-1 inline-block text-[11px] font-semibold text-imdb-gold hover:underline">
                          {t("duplicatesOpen")}
                        </Link>
                        <RenameMovieFileForm
                          compact
                          movieId={ep.id}
                          initialFileName={videoBasenameFromPath(ep.filePath)}
                          onRenamed={() => void load()}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!loading && movies.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-imdb-dim">{t("needsRenameMovies")}</h2>
          <ul className="space-y-3">
            {movies.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-imdb-card border border-imdb-border bg-imdb-elevated p-4 shadow-sm shadow-black/20"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-imdb-text">
                    {m.name}
                    {m.year ? <span className="text-imdb-muted"> ({m.year})</span> : null}
                  </p>
                  <p className="mt-1 break-all font-mono text-[11px] leading-relaxed text-imdb-muted md:text-[12px]">{m.filePath}</p>
                  <p className="mt-1 truncate text-[11px] text-imdb-dim" title={m.folderPath}>
                    {m.folderPath}
                  </p>
                  <RenameMovieFileForm
                    compact
                    movieId={m.id}
                    initialFileName={videoBasenameFromPath(m.filePath)}
                    onRenamed={() => void load()}
                  />
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link
                    href={"/movie/" + m.id}
                    className="rounded-imdb bg-imdb-panel px-3 py-1.5 text-[11px] font-semibold text-imdb-text ring-1 ring-imdb-border transition hover:bg-imdb-rail"
                  >
                    {t("duplicatesOpen")}
                  </Link>
                  <button
                    type="button"
                    disabled={busyKey === `movie:${m.id}`}
                    onClick={() => void resolveMovie(m.id)}
                    className="rounded-imdb bg-imdb-gold/90 px-3 py-1.5 text-[11px] font-semibold text-black transition hover:brightness-95 disabled:opacity-50"
                  >
                    {t("needsRenameResolved")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
