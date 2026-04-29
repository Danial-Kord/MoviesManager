"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  enrichBulk,
  fetchMovies,
  patchMovie,
  type MovieListItem,
  posterUrlForMovieId,
  scanLibrary,
} from "@/lib/api";
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

const PAGE_SIZE = 24;

export function HomeClient() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim() ?? "";

  const [items, setItems] = useState<MovieListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"none" | "name" | "year" | "score" | "votes">("none");
  const [filter, setFilter] = useState<"all" | "favorites" | "scored" | "hidden" | "visible">("visible");
  const [genre, setGenre] = useState("");
  const [folder, setFolder] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [apiReachable, setApiReachable] = useState<boolean | null>(null);
  const [favoriteBusyId, setFavoriteBusyId] = useState<string | null>(null);

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

  const load = useCallback(
    async (pageOverride?: number) => {
      setLoading(true);
      setErr(null);
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
        const data = await fetchMovies(p);
        setItems(data.items);
        setTotal(data.total);
      } catch (e) {
        setErr((e as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [page, sort, q, filter, genre, folder, yearFrom, yearTo]
  );

  useEffect(() => {
    void load();
  }, [load]);

  const feature = items[0];
  const heroRating = formatScore(feature?.imdbRating ?? null);

  async function onScan() {
    setBusy("Scanning…");
    try {
      const r = await scanLibrary();
      if (!r.ok) throw new Error(await r.text());
      setPage(1);
      await load(1);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function onEnrich() {
    setBusy("Enriching TMDb…");
    try {
      const r = await enrichBulk(40);
      if (!r.ok) throw new Error(await r.text());
      await load();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function toggleFavorite(id: string, nextFavorite: boolean) {
    setFavoriteBusyId(id);
    setErr(null);
    try {
      await patchMovie(id, { isFavorite: nextFavorite });
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, isFavorite: nextFavorite } : item)));
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
          <strong className="font-semibold">Local API not running.</strong> Next.js proxies{" "}
          <code className="rounded bg-imdb-panel/90 px-1 text-imdb-text">/api</code> to{" "}
          <code className="rounded bg-imdb-panel/90 px-1 text-imdb-text">127.0.0.1:4000</code>. From the repo
          root run <code className="rounded bg-imdb-panel/90 px-1 text-imdb-text">npm run dev</code>, or{" "}
          <code className="rounded bg-imdb-panel/90 px-1 text-imdb-text">npm run dev:api</code>.
        </div>
      )}
      {busy && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-50 rounded-imdb border border-imdb-border bg-imdb-elevated px-4 py-2 text-sm text-imdb-muted shadow-lg shadow-black/40">
          {busy}
        </div>
      )}

      {feature && !loading && (
        <section className="relative mx-auto max-h-[min(50vh,520px)] min-h-[280px] max-w-[1600px] overflow-hidden rounded-b-[32px] bg-imdb-canvas">
          {feature.id ? (
            <div className="absolute inset-0">
              <Image
                src={posterUrlForMovieId(feature.id)}
                alt=""
                fill
                unoptimized
                className="object-cover opacity-90"
                onError={() => undefined}
              />
            </div>
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-imdb-canvas via-black/55 to-transparent" />
          <button
            type="button"
            disabled={favoriteBusyId === feature.id}
            onClick={(e) => {
              e.preventDefault();
              void toggleFavorite(feature.id, !feature.isFavorite);
            }}
            aria-label={feature.isFavorite ? "Remove from favorites" : "Add to favorites"}
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
              {feature.name}
            </h1>
            {heroRating && (
              <p className="mt-2 flex items-baseline gap-2 text-imdb-muted">
                <span className="text-2xl font-bold text-imdb-gold">{heroRating}</span>
                <span className="text-sm">/ 10</span>
              </p>
            )}
            {feature.genre && <p className="mt-2 text-sm text-imdb-muted">{feature.genre}</p>}
            <div className="mt-5 flex flex-wrap gap-3">
              <PlayLocalButton movieId={feature.id}>Play</PlayLocalButton>
              <Link
                href={"/movie/" + feature.id}
                className="inline-flex items-center justify-center rounded-imdb bg-imdb-panel px-[14px] py-[6px] text-[12px] font-semibold text-imdb-text transition hover:bg-imdb-rail"
              >
                More info
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
              Filters
            </h2>
          </div>

          <div className="flex flex-wrap items-end gap-3 md:gap-4">
            <div className="hidden min-w-[140px] flex-1 md:block">
              <p className="mb-1 text-[12px] text-imdb-muted">Search uses the bar above</p>
              <p className="text-[14px] text-imdb-subtle">
                {q ? (
                  <>
                    Query: <span className="font-medium text-imdb-text">&ldquo;{q}&rdquo;</span>
                  </>
                ) : (
                  "No title filter — browse full library"
                )}
              </p>
            </div>
            <div>
              <label className="mb-1 flex items-center gap-1 text-[12px] font-medium text-imdb-muted">
                <IconArrowUpDown size={14} />
                Sort
              </label>
              <select
                className="block rounded-imdb border border-imdb-border bg-imdb-elevated px-3 py-2 text-[14px] text-imdb-text outline-none focus:border-imdb-focus focus:ring-2 focus:ring-imdb-focus/25"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as typeof sort);
                  setPage(1);
                }}
              >
                <option value="none">None</option>
                <option value="name">Name</option>
                <option value="year">Year</option>
                <option value="score">Score</option>
                <option value="votes">Votes</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-imdb-muted">Library</label>
              <select
                className="block rounded-imdb border border-imdb-border bg-imdb-elevated px-3 py-2 text-[14px] text-imdb-text outline-none focus:border-imdb-focus focus:ring-2 focus:ring-imdb-focus/25"
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value as typeof filter);
                  setPage(1);
                }}
              >
                <option value="visible">Visible only</option>
                <option value="all">All (incl. hidden)</option>
                <option value="favorites">Favorites</option>
                <option value="scored">With score</option>
                <option value="hidden">Hidden (blacklist)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-imdb-muted">Genre</label>
              <input
                className="w-32 rounded-imdb border border-imdb-border bg-imdb-elevated px-3 py-2 text-[14px] text-imdb-text outline-none focus:border-imdb-focus focus:ring-2 focus:ring-imdb-focus/25"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-imdb-muted">Folder contains</label>
              <input
                className="w-40 rounded-imdb border border-imdb-border bg-imdb-elevated px-3 py-2 text-[14px] text-imdb-text outline-none focus:border-imdb-focus focus:ring-2 focus:ring-imdb-focus/25"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-imdb-muted">Year from</label>
              <input
                className="w-24 rounded-imdb border border-imdb-border bg-imdb-elevated px-3 py-2 text-[14px] text-imdb-text outline-none focus:border-imdb-focus focus:ring-2 focus:ring-imdb-focus/25"
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
                placeholder="1990"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-imdb-muted">Year to</label>
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
              Apply
            </button>
            <button
              type="button"
              onClick={() => onScan()}
              className="inline-flex items-center gap-2 rounded-imdb bg-imdb-panel px-[14px] py-[6px] text-[12px] font-semibold text-imdb-text transition hover:bg-imdb-border/90"
            >
              <IconRefreshCw size={16} />
              Rescan
            </button>
            <button
              type="button"
              onClick={() => onEnrich()}
              className="inline-flex items-center gap-2 rounded-imdb border border-imdb-border bg-transparent px-[14px] py-[6px] text-[12px] font-semibold text-imdb-text transition hover:bg-imdb-hover"
            >
              <IconSparkles size={16} />
              Enrich TMDb
            </button>
          </div>
        </div>

        {err && <p className="text-sm text-imdb-error">{err}</p>}

        <h2 className="text-[1.75rem] font-bold tracking-tight text-imdb-text" style={{ letterSpacing: "-1.2px" }}>
          Your library
        </h2>
        {loading && <p className="text-sm text-imdb-muted">Loading…</p>}

        <div className="columns-2 gap-4 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6">
          {items.map((m) => {
            const scoreLabel = formatScore(m.imdbRating);
            return (
              <div
                key={m.id}
                className="group mb-4 break-inside-avoid overflow-hidden rounded-imdb-card bg-imdb-elevated shadow-sm ring-1 ring-imdb-border transition hover:ring-2 hover:ring-imdb-gold/50"
              >
                <div className="relative aspect-[2/3] w-full bg-imdb-surface">
                  <Link href={"/movie/" + m.id} className="absolute inset-0 block outline-none ring-imdb-focus focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-imdb-canvas">
                    {m.imagePath ? (
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
                  <button
                    type="button"
                    disabled={favoriteBusyId === m.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void toggleFavorite(m.id, !m.isFavorite);
                    }}
                    aria-label={m.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    className="absolute bottom-2 right-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-imdb-text shadow-md backdrop-blur-sm ring-1 ring-white/15 transition hover:bg-black/75 disabled:opacity-50"
                  >
                    <IconHeart size={18} filled={m.isFavorite} className={m.isFavorite ? "text-imdb-gold" : "text-imdb-text"} />
                  </button>
                </div>
                <Link
                  href={"/movie/" + m.id}
                  className="block border-t border-imdb-border bg-imdb-elevated px-2 py-2 hover:bg-imdb-panel/80"
                >
                  <p className="line-clamp-2 min-h-[2.75em] text-[14px] font-medium leading-snug text-imdb-text">{m.name}</p>
                  {scoreLabel && (
                    <p className="mt-1 text-[12px] text-imdb-gold">★ {scoreLabel}</p>
                  )}
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
              aria-label="Previous page"
            >
              <IconChevronLeft />
            </button>
            <span className="text-[14px] text-imdb-muted">
              {page} / {pages} ({total} total)
            </span>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-imdb-rail text-imdb-text transition hover:bg-imdb-panel disabled:opacity-40"
              aria-label="Next page"
            >
              <IconChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
