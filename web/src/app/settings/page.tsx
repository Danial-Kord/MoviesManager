import Link from "next/link";
import { IconChevronLeft, IconSettings } from "@/components/icons";
import { SettingsClient } from "@/components/SettingsClient";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-imdb-canvas px-4 py-8 font-imdb md:px-10 md:py-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 md:mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[13px] font-medium text-imdb-muted underline-offset-4 hover:text-imdb-text hover:underline"
          >
            <IconChevronLeft size={18} />
            Back to library
          </Link>
          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-imdb-card border border-imdb-border bg-imdb-elevated shadow-md shadow-black/25 ring-1 ring-white/5 md:h-16 md:w-16">
              <IconSettings className="text-imdb-gold" size={30} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-[1.85rem] font-bold tracking-tight text-imdb-text md:text-[2rem]" style={{ letterSpacing: "-1.2px" }}>
                Settings
              </h1>
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-imdb-muted">
                Scan folders, inspect SQLite and poster paths, import legacy data, or wipe the database. The sections below also explain how movies,
                TV series, dubbed hints, categories, and enrichment fit together.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-imdb-panel/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-imdb-muted ring-1 ring-imdb-border">
                  Library folders
                </span>
                <span className="rounded-full bg-imdb-panel/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-imdb-muted ring-1 ring-imdb-border">
                  Database
                </span>
                <span className="rounded-full bg-imdb-panel/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-imdb-muted ring-1 ring-imdb-border">
                  Dubbed &amp; categories
                </span>
                <span className="rounded-full bg-imdb-panel/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-imdb-muted ring-1 ring-imdb-border">
                  Import / reset
                </span>
              </div>
            </div>
          </div>
        </header>

        <SettingsClient />
      </div>
    </div>
  );
}
