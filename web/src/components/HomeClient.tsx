"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  enrichBulk,
  fetchMovies,
  type MovieListItem,
  posterUrlForMovieId,
  scanLibrary,
} from "@/lib/api";
import { PlayLocalButton } from "@/components/PlayLocalButton";

const PAGE_SIZE = 24;

export function HomeClient() {
  const [items, setItems] = useState<MovieListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"none" | "name" | "year" | "score" | "votes">("none");
  const [filter, setFilter] = useState<"all" | "favorites" | "scored" | "hidden" | "visible">("visible");
  const [genre, setGenre] = useState("");
  const [folder, setFolder] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  /** null = unknown until first check */
  const [apiReachable, setApiReachable] = useState<boolean | null>(null);

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
      if (q.trim()) p.set("q", q.trim());
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

  return (
    <div className="min-h-screen">
      {apiReachable === false && (
        <div className="border-b border-red-500/50 bg-red-950/90 px-4 py-3 text-center text-sm text-red-100">
          <strong className="font-semibold">Local API not running.</strong> Next.js proxies{" "}
          <code className="rounded bg-black/30 px-1">/api</code> to{" "}
          <code className="rounded bg-black/30 px-1">127.0.0.1:4000</code>. From the repo root run{" "}
          <code className="rounded bg-black/30 px-1">npm run dev</code> (starts web + API), or in another
          terminal run <code className="rounded bg-black/30 px-1">npm run dev:api</code>.
        </div>
      )}
      {busy && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-50 rounded bg-black/80 px-4 py-2 text-sm text-amber-200">
          {busy}
        </div>
      )}

      {/* hero */}
      {feature && !loading && (
        <section className="relative mx-auto h-[50vh] max-w-[1600px] overflow-hidden">
          {feature.id ? (
            <div className="absolute inset-0">
              <Image
                src={posterUrlForMovieId(feature.id)}
                alt=""
                fill
                unoptimized
                className="object-cover opacity-40"
                onError={() => undefined}
              />
            </div>
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] from-40% via-[#0d0d0d]/50 to-transparent" />
          <div className="relative z-10 flex h-full max-w-2xl flex-col justify-end px-4 pb-12 pt-20">
            <h1 className="text-4xl font-extrabold text-shadow-hero drop-shadow-2xl md:text-5xl">
              {feature.name}
            </h1>
            {feature.imdbRating && (
              <p className="mt-2 flex items-center gap-2 text-lg text-[#F5C518]">
                <span className="text-2xl font-bold">{feature.imdbRating}</span>
                <span className="text-sm text-gray-400">/ 10</span>
              </p>
            )}
            {feature.genre && <p className="mt-2 text-sm text-gray-300">{feature.genre}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <PlayLocalButton
                movieId={feature.id}
                className="rounded bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gray-200"
              >
                Play
              </PlayLocalButton>
              <Link
                href={"/movie/" + feature.id}
                className="rounded border border-white/30 bg-black/30 px-4 py-2 text-sm hover:bg-white/10"
              >
                More info
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6">
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-white/10 bg-surface/80 p-4">
          <div className="min-w-[160px] flex-1">
            <label className="text-xs text-gray-500">Search</label>
            <input
              className="mt-1 w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-sm"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (setPage(1), void load(1))}
              placeholder="Title…"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Sort</label>
            <select
              className="mt-1 block w-full rounded border border-white/10 bg-black/40 px-2 py-2 text-sm"
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
            <label className="text-xs text-gray-500">Library</label>
            <select
              className="mt-1 block rounded border border-white/10 bg-black/40 px-2 py-2 text-sm"
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
            <label className="text-xs text-gray-500">Genre</label>
            <input
              className="mt-1 w-32 rounded border border-white/10 bg-black/40 px-2 py-2 text-sm"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Folder path contains</label>
            <input
              className="mt-1 w-40 rounded border border-white/10 bg-black/40 px-2 py-2 text-sm"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Year from</label>
            <input
              className="mt-1 w-20 rounded border border-white/10 bg-black/40 px-2 py-2 text-sm"
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
              placeholder="1990"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Year to</label>
            <input
              className="mt-1 w-20 rounded border border-white/10 bg-black/40 px-2 py-2 text-sm"
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
            className="rounded bg-[#F5C518] px-3 py-2 text-sm font-semibold text-black hover:bg-[#e4b800]"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => onScan()}
            className="rounded border border-[#E50914] bg-transparent px-3 py-2 text-sm text-[#E50914] hover:bg-[#E50914]/10"
          >
            Rescan
          </button>
          <button
            type="button"
            onClick={() => onEnrich()}
            className="rounded border border-white/20 bg-transparent px-3 py-2 text-sm text-gray-200 hover:bg-white/5"
          >
            Enrich TMDb
          </button>
        </div>

        {err && <p className="text-sm text-red-400">{err}</p>}

        <h2 className="text-lg font-semibold">Your library</h2>
        {loading && <p className="text-sm text-gray-500">Loading…</p>}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((m) => (
            <Link
              key={m.id}
              href={"/movie/" + m.id}
              className="group relative block aspect-[2/3] overflow-hidden rounded bg-surface ring-1 ring-white/5 transition hover:z-20 hover:scale-[1.03] hover:ring-2 hover:ring-[#F5C518]/50"
            >
              {m.imagePath ? (
                <Image
                  src={posterUrlForMovieId(m.id)}
                  alt={m.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 p-2 text-center text-xs text-gray-500">
                  {m.name}
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-2 pt-6 opacity-0 transition group-hover:opacity-100">
                <p className="line-clamp-2 text-sm font-medium">{m.name}</p>
                {m.imdbRating && <p className="text-xs text-[#F5C518]">★ {m.imdbRating}</p>}
              </div>
            </Link>
          ))}
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 py-4">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded border border-white/20 px-3 py-1 text-sm disabled:opacity-30"
            >
              Prev
            </button>
            <span className="text-sm text-gray-400">
              {page} / {pages} ({total} total)
            </span>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-white/20 px-3 py-1 text-sm disabled:opacity-30"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
