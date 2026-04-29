"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { IconHome, IconPinLogo, IconSearch, IconSettings, IconTable } from "@/components/icons";

export function SiteHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qUrl = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(qUrl);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed === "") {
      router.push("/");
      return;
    }
    router.push(`/?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-imdb-border bg-imdb-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3 md:gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-imdb-text">
          <IconPinLogo size={36} />
          <span className="hidden font-semibold tracking-tight text-imdb-text sm:inline-block">
            Movie Manager
          </span>
        </Link>

        <form onSubmit={onSubmit} className="flex min-w-0 flex-1 justify-center px-1 md:px-4">
          <div className="relative w-full max-w-xl">
            <IconSearch
              size={20}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-imdb-dim"
            />
            <input
              type="search"
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles…"
              autoComplete="off"
              className="w-full rounded-imdb border border-imdb-border bg-imdb-elevated py-[11px] pl-10 pr-4 text-[16px] text-imdb-text placeholder:text-imdb-dim outline-none ring-0 transition focus:border-imdb-focus focus:ring-2 focus:ring-imdb-focus/30"
              aria-label="Search titles"
            />
          </div>
        </form>

        <nav className="flex shrink-0 items-center gap-1 md:gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full px-3 py-2 text-[14px] font-medium text-imdb-text transition hover:bg-imdb-hover md:px-4"
          >
            <IconHome size={22} className="text-imdb-text" />
            <span className="hidden lg:inline">Home</span>
          </Link>
          <Link
            href="/database"
            className="flex items-center gap-2 rounded-full px-3 py-2 text-[14px] font-medium text-imdb-text transition hover:bg-imdb-hover md:px-4"
          >
            <IconTable size={22} className="text-imdb-text" />
            <span className="hidden lg:inline">Database</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-2 rounded-full px-3 py-2 text-[14px] font-medium text-imdb-text transition hover:bg-imdb-hover md:px-4"
          >
            <IconSettings size={22} className="text-imdb-text" />
            <span className="hidden lg:inline">Settings</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
