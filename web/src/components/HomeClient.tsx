"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ENRICH_BULK_DEFAULT,
  ENRICH_BULK_MAX,
  enrichMovieById,
  enrichSeriesById,
  fetchLibraryBrowse,
  fetchLibraryGenres,
  patchMovie,
  patchSeries,
  type BrowseItem,
  type BrowseMovieItem,
  posterUrlForMovieId,
  posterUrlForSeriesId,
} from "@/lib/api";
import { useLibraryJob } from "@/components/LibraryJobProvider";
import { formatScore } from "@/lib/formatScore";
import {
  IconArrowUpDown,
  IconChevronLeft,
  IconChevronRight,
  IconHeart,
  IconRefreshCw,
  IconSlidersHorizontal,
  IconSparkles,
} from "@/components/icons";
import { PlayLocalButton } from "@/components/PlayLocalButton";
import { useLocale } from "@/lib/i18n/context";
import { interpolate } from "@/lib/i18n/messages";

const PAGE_SIZE = 24;

function buildPageEnrichExecutors(pending: BrowseItem[]): Array<() => Promise<void>> {
  const executors: Array<() => Promise<void>> = [];
  const seenSeries = new Set<string>();
  const addedKeys = new Set<string>();

  for (const p of pending) {
    if (p.kind === "series") {
      const key = `s:${p.id}`;
      if (addedKeys.has(key)) continue;
      addedKeys.add(key);
      executors.push(() => enrichSeriesById(p.id).then(() => undefined));
      continue;
    }
    const m = p as BrowseMovieItem;
    if (m.mediaKind === "episode" && m.seriesId) {
      if (seenSeries.has(m.seriesId)) continue;
      seenSeries.add(m.seriesId);
      const sk = `s:${m.seriesId}`;
      if (addedKeys.has(sk)) continue;
      addedKeys.add(sk);
      const sid = m.seriesId;
      executors.push(() => enrichSeriesById(sid).then(() => undefined));
    } else {
      const mk = `m:${m.id}`;
      if (addedKeys.has(mk)) continue;
      addedKeys.add(mk);
      const mid = m.id;
      executors.push(() => enrichMovieById(mid).then(() => undefined));
    }
  }
  return executors;
}

export function HomeClient() {
  const { t } = useLocale();
  const { busy: libraryBusy, runScan, runEnrich, runBrowsePageEnrich } = useLibraryJob();
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim() ?? "";

  const [items, setItems] = useState<BrowseItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"none" | "name" | "year" | "score" | "votes">("none");
  const [filter, setFilter] = useState<"all" | "favorites" | "scored" | "hidden" | "visible">("visible");
  const [browseKind, setBrowseKind] = useState<"all" | "movies" | "series">("all");
  const [genre, setGenre] = useState("");
  const [genreOptions, setGenreOptions] = useState<string[]>([]);
  const [folder, setFolder] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [enrichBatchLimit, setEnrichBatchLimit] = useState(ENRICH_BULK_DEFAULT);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [apiReachable, setApiReachable] = useState<boolean | null>(null);
  const [favoriteBusyId, setFavoriteBusyId] = useState<string | null>(null);

  /** After changing browse page index, run page enrich overlay once load settles. */
  const pendingPageEnrichRef = useRef(false);
  const prevPageRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevPageRef.current !== null && prevPageRef.current !== page) {
      pendingPageEnrichRef.current = true;
    }
    prevPageRef.current = page;
  }, [page]);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/health")
      .then((r) => {
        if (!cancelled) setApiReachable(r.ok);
      })
      .catch(() => {
        if (!cancelled) setApiReachable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshGenres = useCallback(async () => {
    try {
      const { genres } = await fetchLibraryGenres();
      setGenreOptions(genres);
    } catch {
      /* offline or API error — keep prior options */
    }
  }, []);

  useEffect(() => {
    void refreshGenres();
  }, [refreshGenres]);

  const genreChoices = useMemo(() => {
    if (genre && !genreOptions.includes(genre)) {
      return [...genreOptions, genre].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    }
    return genreOptions;
  }, [genre, genreOptions]);

  const load = useCallback(
    async (pageOverride?: number, opts?: { silent?: boolean }) => {
      const silent = opts?.silent === true;
      if (!silent) {
        setLoading(true);
        setErr(null);
      }
      const pageNum = pageOverride ?? page;
      try {
        const p = new URLSearchParams();
        p.set("page", String(pageNum));
        p.set("pageSize", String(PAGE_SIZE));
        p.set("sort", sort);
        if (q) p.set("q", q);
        if (filter === "favorites" || filter === "scored" || filter === "hidden") {
          p.set("filter", filter);
        } else if (filter === "visible") {
          p.set("show", "1");
        }
        if (genre) p.set("genre", genre);
        if (folder) p.set("folder", folder);
        if (yearFrom) p.set("yearFrom", yearFrom);
        if (yearTo) p.set("yearTo", yearTo);
        p.set("browseKind", browseKind);
        const data = await fetchLibraryBrowse(p);
        setItems(data.items);
        setTotal(data.total);
      } catch (e) {
        if (!silent) setErr((e as Error).message);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [page, sort, q, filter, genre, folder, yearFrom, yearTo, browseKind]
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (loading || libraryBusy || apiReachable === false) return;
    if (!pendingPageEnrichRef.current) return;
    if (items.length === 0) {
      pendingPageEnrichRef.current = false;
      return;
    }

    const pending = items.filter((it) => {
      if (it.needsRename === true) return false;
      if (it.isEnriched === true) return false;
      const es = it.enrichmentState ?? "none";
      return es === "none" || es === "partial";
    });

    pendingPageEnrichRef.current = false;

    if (pending.length === 0) return;

    const executors = buildPageEnrichExecutors(pending);
    if (executors.length === 0) return;

    void (async () => {
      try {
        await runBrowsePageEnrich(executors);
      } finally {
        await load(undefined, { silent: true });
      }
    })();
  }, [loading, libraryBusy, apiReachable, items, load, runBrowsePageEnrich]);

  const feature = items[0];
  const heroRating = formatScore(feature ? feature.imdbRating : null);
  const featureBusyKey = feature ? `${feature.kind}:${feature.id}` : "";

  async function onScan() {
    if (libraryBusy) return;
    setErr(null);
    try {
      await runScan();
      setPage(1);
      await refreshGenres();
      await load(1);
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  async function onEnrich() {
    if (libraryBusy) return;
    setErr(null);
    try {
      await runEnrich(enrichBatchLimit);
      await refreshGenres();
      await load();
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function toggleFavorite(item: BrowseItem, nextFavorite: boolean) {
    setFavoriteBusyId(`${item.kind}:${item.id}`);
    setErr(null);
    try {
      if (item.kind === "series") {
        await patchSeries(item.id, { isFavorite: nextFavorite });
      } else {
        await patchMovie(item.id, { isFavorite: nextFavorite });
      }
      setItems((prev) =>
        prev.map((row) => (row.kind === item.kind && row.id === item.id ? { ...row, isFavorite: nextFavorite } : row))
      );
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setFavoriteBusyId(null);
    }
  }

  return (
    <div className="min-h-screen bg-imdb-canvas font-imdb">
      {apiReachable === false && (
        <div className="border-b border-imdb-error/40 bg-red-950/50 px-4 py-3 text-center text-sm text-imdb-error">
          <strong className="font-semibold">{t("apiOfflineBold")}</strong> {t("apiOfflineRest")}
        </div>
      )}

      {feature && !loading && (
        <section className="relative mx-auto max-h-[min(50vh,520px)] min-h-[280px] max-w-[1600px] overflow-hidden rounded-b-[32px] bg-imdb-canvas">
          <div className="absolute inset-0">
            <Image
              src={feature.kind === "series" ? posterUrlForSeriesId(feature.id) : posterUrlForMovieId(feature.id)}
              alt=""
              fill
              unoptimized
              className="object-cover opacity-90"
              onError={() => undefined}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-imdb-canvas via-black/55 to-transparent" />
          {feature.kind === "movie" && feature.dubbed && (
            <div
              className="pointer-events-none absolute start-5 top-6 z-20 inline-flex h-8 shrink-0 items-center justify-center rounded-full bg-black/80 px-3 shadow-lg shadow-black/50 ring-2 ring-imdb-gold/70 backdrop-blur-sm md:start-8 md:top-8"
              aria-hidden
            >
              <span className="text-[11px] font-bold uppercase leading-none tracking-wide text-imdb-gold">{t("badgeDubbed")}</span>
            </div>
          )}
          <button
            type="button"
            disabled={favoriteBusyId === featureBusyKey}
            onClick={(e) => {
              e.preventDefault();
              void toggleFavorite(feature, !feature.isFavorite);
            }}
            aria-label={feature.isFavorite ? t("favRemove") : t("favAdd")}
            className="absolute bottom-6 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-imdb-text shadow-lg backdrop-blur-sm ring-1 ring-white/15 transition hover:bg-black/75 disabled:opacity-50 md:bottom-10 md:right-8"
          >
            <IconHeart
              size={20}
              filled={feature.isFavorite}
              className={feature.isFavorite ? "text-imdb-gold" : "text-imdb-text"}
            />
          </button>
          <div className="relative z-10 flex h-full min-h-[280px] max-w-2xl flex-col justify-end px-4 pb-10 pt-16 md:px-8">
            <h1 className="text-3xl font-semibold tracking-tight text-imdb-text text-shadow-hero-dark md:text-5xl md:leading-tight">
              {feature.kind === "series" ? feature.title : feature.name}
            </h1>
            {feature.kind === "series" && (
              <p className="mt-2 text-sm text-imdb-muted">
                {interpolate(feature.episodeCount === 1 ? t("heroEpisodesOne") : t("heroEpisodesMany"), {
                  n: feature.episodeCount,
                })}
              </p>
            )}
            {heroRating && (
              <p className="mt-2 flex items-baseline gap-2 text-imdb-muted">
                <span className="text-2xl font-bold text-imdb-gold">{heroRating}</span>
                <span className="text-sm">/ 10</span>
              </p>
            )}
            {feature.genre && <p className="mt-2 text-sm text-imdb-muted">{feature.genre}</p>}
            <div className="mt-5 flex flex-wrap gap-3">
              {feature.kind === "movie" ? (
                <PlayLocalButton movieId={feature.id}>{t("heroPlay")}</PlayLocalButton>
              ) : (
                <Link
                  href={"/series/" + feature.id}
                  className="inline-flex items-center justify-center rounded-imdb bg-imdb-gold px-[14px] py-[6px] text-[12px] font-semibold text-black transition hover:brightness-95"
                >
                  {t("heroEpisodes")}
                </Link>
              )}
              <Link
                href={feature.kind === "series" ? "/series/" + feature.id : "/movie/" + feature.id}
                className="inline-flex items-center justify-center rounded-imdb bg-imdb-panel px-[14px] py-[6px] text-[12px] font-semibold text-imdb-text transition hover:bg-imdb-rail"
              >
                {t("heroMoreInfo")}
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-8 md:px-6">
        <div className="rounded-imdb-card border border-imdb-border bg-imdb-elevated p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-center gap-2 border-b border-imdb-border pb-3">
            <IconSlidersHorizontal className="text-imdb-dim" size={22} />
            <h2 className="text-[1.75rem] font-bold tracking-tight text-imdb-text" style={{ letterSpacing: "-1.2px" }}>
              {t("filtersTitle")}
            </h2>
          </div>

          <div className="flex flex-wrap items-end gap-3 md:gap-4">
            <div className="hidden min-w-[140px] flex-1 md:block">
              <p className="mb-1 text-[12px] text-imdb-muted">{t("filtersSearchHint")}</p>
              <p className="text-[14px] text-imdb-subtle">
                {q ? (
                  <>
                    {t("filtersQuery")} <span className="font-medium text-imdb-text">&ldquo;{q}&rdquo;</span>
                  </>
                ) : (
                  t("filtersNoQuery")
                )}
              </p>
            </div>
            <div>
              <label className="mb-1 flex items-center gap-1 text-[12px] font-medium text-imdb-muted">
                <IconArrowUpDown size={14} />
                {t("sortLabel")}
              </label>
              <select
                className="block rounded-imdb border border-imdb-border bg-imdb-elevated px-3 py-2 text-[14px] text-imdb-text outline-none focus:border-imdb-focus focus:ring-2 focus:ring-imdb-focus/25"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as typeof sort);
                  setPage(1);
                }}
              >
                <option value="none">{t("sortNone")}</option>
                <option value="name">{t("sortName")}</option>
                <option value="year">{t("sortYear")}</option>
                <option value="score">{t("sortScore")}</option>
                <option value="votes">{t("sortVotes")}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-imdb-muted">{t("catalogLabel")}</label>
              <select
                className="block min-w-[10rem] rounded-imdb border border-imdb-border bg-imdb-elevated px-3 py-2 text-[14px] text-imdb-text outline-none focus:border-imdb-focus focus:ring-2 focus:ring-imdb-focus/25"
                value={browseKind}
                onChange={(e) => {
                  setBrowseKind(e.target.value as typeof browseKind);
                  setPage(1);
                }}
              >
                <option value="all">{t("catAll")}</option>
                <option value="movies">{t("catMovies")}</option>
                <option value="series">{t("catSeries")}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-imdb-muted">{t("libraryLabel")}</label>
              <select
                className="block rounded-imdb border border-imdb-border bg-imdb-elevated px-3 py-2 text-[14px] text-imdb-text outline-none focus:border-imdb-focus focus:ring-2 focus:ring-imdb-focus/25"
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value as typeof filter);
                  setPage(1);
                }}
              >
                <option value="visible">{t("libVisible")}</option>
                <option value="all">{t("libAll")}</option>
                <option value="favorites">{t("libFavorites")}</option>
                <option value="scored">{t("libScored")}</option>
                <option value="hidden">{t("libHidden")}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-imdb-muted">{t("genreLabel")}</label>
              <select
                className="block min-w-[11rem] max-w-[16rem] rounded-imdb border border-imdb-border bg-imdb-elevated px-3 py-2 text-[14px] text-imdb-text outline-none focus:border-imdb-focus focus:ring-2 focus:ring-imdb-focus/25"
                value={genre}
                onChange={(e) => {
                  setGenre(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">{t("genreAll")}</option>
                {genreChoices.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-imdb-muted">{t("folderLabel")}</label>
              <input
                className="w-40 rounded-imdb border border-imdb-border bg-imdb-elevated px-3 py-2 text-[14px] text-imdb-text outline-none focus:border-imdb-focus focus:ring-2 focus:ring-imdb-focus/25"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-imdb-muted">{t("yearFrom")}</label>
              <input
                className="w-24 rounded-imdb border border-imdb-border bg-imdb-elevated px-3 py-2 text-[14px] text-imdb-text outline-none focus:border-imdb-focus focus:ring-2 focus:ring-imdb-focus/25"
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
                placeholder="1990"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-imdb-muted">{t("yearTo")}</label>
              <input
                className="w-24 rounded-imdb border border-imdb-border bg-imdb-elevated px-3 py-2 text-[14px] text-imdb-text outline-none focus:border-imdb-focus focus:ring-2 focus:ring-imdb-focus/25"
                value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}
                placeholder="2024"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setPage(1);
                void load(1);
              }}
              className="inline-flex items-center gap-2 rounded-imdb bg-imdb-gold px-[14px] py-[6px] text-[12px] font-semibold text-black transition hover:brightness-95"
            >
              {t("apply")}
            </button>
            <button
              type="button"
              disabled={libraryBusy}
              onClick={() => onScan()}
              className="inline-flex items-center gap-2 rounded-imdb bg-imdb-panel px-[14px] py-[6px] text-[12px] font-semibold text-imdb-text transition hover:bg-imdb-border/90"
            >
              <IconRefreshCw size={16} />
              {t("rescan")}
            </button>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-imdb-muted">{t("enrichBatchLabel")}</label>
              <input
                type="number"
                min={1}
                max={ENRICH_BULK_MAX}
                disabled={libraryBusy}
                className="w-[4.5rem] rounded-imdb border border-imdb-border bg-imdb-elevated px-2 py-2 text-[14px] text-imdb-text outline-none focus:border-imdb-focus focus:ring-2 focus:ring-imdb-focus/25"
                value={enrichBatchLimit}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (Number.isFinite(v)) setEnrichBatchLimit(Math.min(ENRICH_BULK_MAX, Math.max(1, v)));
                }}
                title={t("enrichBatchTitle")}
              />
            </div>
            <button
              type="button"
              disabled={libraryBusy}
              onClick={() => onEnrich()}
              className="inline-flex items-center gap-2 rounded-imdb border border-imdb-border bg-transparent px-[14px] py-[6px] text-[12px] font-semibold text-imdb-text transition hover:bg-imdb-hover"
            >
              <IconSparkles size={16} />
              {t("enrichTmdb")}
            </button>
          </div>
        </div>

        {err && <p className="text-sm text-imdb-error">{err}</p>}

        <h2 className="text-[1.75rem] font-bold tracking-tight text-imdb-text" style={{ letterSpacing: "-1.2px" }}>
          {t("yourLibrary")}
        </h2>
        {loading && <p className="text-sm text-imdb-muted">{t("loading")}</p>}

        <div className="columns-2 gap-4 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6">
          {items.map((row) => {
            const scoreLabel = formatScore(row.imdbRating);
            const busyKey = `${row.kind}:${row.id}`;
            if (row.kind === "series") {
              const title = row.title;
              return (
                <div
                  key={busyKey}
                  className="group mb-4 break-inside-avoid overflow-hidden rounded-imdb-card bg-imdb-elevated shadow-sm ring-1 ring-imdb-border transition hover:ring-2 hover:ring-imdb-gold/50 [container-type:inline-size]"
                >
                  <div className="relative aspect-[2/3] w-full bg-imdb-surface">
                    <Link
                      href={"/series/" + row.id}
                      className="absolute inset-0 block outline-none ring-imdb-focus focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-imdb-canvas"
                      title={row.isEnriched ? t("browseTooltipEnriched") : t("browseTooltipNotEnriched")}
                    >
                      {row.imagePath || row.posterAvailable ? (
                        <Image
                          src={posterUrlForSeriesId(row.id)}
                          alt={title}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-imdb-rail p-2 text-center text-[12px] text-imdb-muted">
                          {title}
                        </div>
                      )}
                    </Link>
                    {scoreLabel && (
                      <div
                        className="pointer-events-none absolute bottom-2 left-2 z-10 flex h-9 max-w-[calc(100%-3.75rem)] items-center rounded-full bg-black/55 px-2.5 shadow-md ring-1 ring-white/15 backdrop-blur-sm"
                        aria-hidden
                      >
                        <span className="truncate tabular-nums font-semibold leading-none text-imdb-gold [font-size:clamp(10px,3.2cqw,12px)]">
                          ★ {scoreLabel}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      disabled={favoriteBusyId === busyKey}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        void toggleFavorite(row, !row.isFavorite);
                      }}
                      aria-label={row.isFavorite ? t("favRemove") : t("favAdd")}
                      className="absolute bottom-2 right-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-imdb-text shadow-md backdrop-blur-sm ring-1 ring-white/15 transition hover:bg-black/75 disabled:opacity-50"
                    >
                      <IconHeart size={18} filled={row.isFavorite} className={row.isFavorite ? "text-imdb-gold" : "text-imdb-text"} />
                    </button>
                  </div>
                  <Link
                    href={"/series/" + row.id}
                    className="block border-t border-imdb-border bg-imdb-elevated px-2 py-2 hover:bg-imdb-panel/80"
                  >
                    <p
                      className="truncate font-medium leading-tight text-imdb-text [font-size:clamp(0.625rem,min(4cqw,4cqh),0.875rem)]"
                      title={title}
                    >
                      {title}
                    </p>
                    <p className="truncate text-[11px] text-imdb-muted">
                      {row.episodeCount} {t("seriesEpSuffix")}
                    </p>
                  </Link>
                </div>
              );
            }
            const m = row;
            return (
              <div
                key={busyKey}
                className="group mb-4 break-inside-avoid overflow-hidden rounded-imdb-card bg-imdb-elevated shadow-sm ring-1 ring-imdb-border transition hover:ring-2 hover:ring-imdb-gold/50 [container-type:inline-size]"
              >
                <div className="relative aspect-[2/3] w-full bg-imdb-surface">
                  <Link
                    href={"/movie/" + m.id}
                    className="absolute inset-0 block outline-none ring-imdb-focus focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-imdb-canvas"
                    title={m.isEnriched ? t("browseTooltipEnriched") : t("browseTooltipNotEnriched")}
                  >
                    {m.imagePath || m.posterAvailable ? (
                      <Image
                        src={posterUrlForMovieId(m.id)}
                        alt={m.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-imdb-rail p-2 text-center text-[12px] text-imdb-muted">
                        {m.name}
                      </div>
                    )}
                  </Link>
                  {m.dubbed && (
                    <div
                      className="pointer-events-none absolute start-2 top-2 z-10 inline-flex h-7 min-h-7 items-center justify-center rounded-full bg-black/80 px-2.5 shadow-md shadow-black/45 ring-2 ring-imdb-gold/65 backdrop-blur-sm"
                      aria-hidden
                    >
                      <span className="text-center font-bold uppercase leading-none tracking-wide text-imdb-gold [font-size:clamp(9px,2.8cqw,11px)]">
                        {t("badgeDubbed")}
                      </span>
                    </div>
                  )}
                  {scoreLabel && (
                    <div
                      className="pointer-events-none absolute bottom-2 left-2 z-10 flex h-9 max-w-[calc(100%-3.75rem)] items-center rounded-full bg-black/55 px-2.5 shadow-md ring-1 ring-white/15 backdrop-blur-sm"
                      aria-hidden
                    >
                      <span className="truncate tabular-nums font-semibold leading-none text-imdb-gold [font-size:clamp(10px,3.2cqw,12px)]">
                        ★ {scoreLabel}
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    disabled={favoriteBusyId === busyKey}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void toggleFavorite(m, !m.isFavorite);
                    }}
                    aria-label={m.isFavorite ? t("favRemove") : t("favAdd")}
                    className="absolute bottom-2 right-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-imdb-text shadow-md backdrop-blur-sm ring-1 ring-white/15 transition hover:bg-black/75 disabled:opacity-50"
                  >
                    <IconHeart size={18} filled={m.isFavorite} className={m.isFavorite ? "text-imdb-gold" : "text-imdb-text"} />
                  </button>
                </div>
                <Link
                  href={"/movie/" + m.id}
                  className="block border-t border-imdb-border bg-imdb-elevated px-2 py-2 hover:bg-imdb-panel/80"
                >
                  <p
                    className="truncate font-medium leading-tight text-imdb-text [font-size:clamp(0.625rem,min(4cqw,4cqh),0.875rem)]"
                    title={m.name}
                  >
                    {m.name}
                  </p>
                </Link>
              </div>
            );
          })}
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-center gap-4 py-6">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-imdb-rail text-imdb-text transition hover:bg-imdb-panel disabled:opacity-40"
              aria-label={t("paginationPrev")}
            >
              <IconChevronLeft />
            </button>
            <span className="text-[14px] text-imdb-muted">
              {page} / {pages} ({interpolate(t("paginationTotal"), { total })})
            </span>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-imdb-rail text-imdb-text transition hover:bg-imdb-panel disabled:opacity-40"
              aria-label={t("paginationNext")}
            >
              <IconChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
