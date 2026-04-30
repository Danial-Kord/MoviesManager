"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconDuplicates } from "@/components/icons";
import { fetchLibraryDuplicates, type DuplicateLibraryGroup } from "@/lib/api";
import { useLocale } from "@/lib/i18n/context";
import { interpolate } from "@/lib/i18n/messages";

import type { MessageKey } from "@/lib/i18n/messages";

function kindLabel(t: (key: MessageKey) => string, kind: DuplicateLibraryGroup["kind"]): string {
  switch (kind) {
    case "title_year":
      return t("duplicatesKindTitleYear");
    case "tmdb_id":
      return t("duplicatesKindTmdbId");
    case "episode_slot":
      return t("duplicatesKindEpisodeSlot");
    default:
      return kind;
  }
}

export function DuplicatesClient() {
  const { t } = useLocale();
  const [groups, setGroups] = useState<DuplicateLibraryGroup[] | null>(null);
  const [duplicateRowCount, setDuplicateRowCount] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchLibraryDuplicates()
      .then((data) => {
        if (!cancelled) {
          setGroups(data.groups);
          setDuplicateRowCount(data.duplicateRowCount);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setErr(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-[960px] space-y-8">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-imdb-card border border-imdb-border bg-imdb-elevated shadow-md shadow-black/25 ring-1 ring-white/5">
          <IconDuplicates className="text-imdb-gold" size={26} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-[1.75rem] font-bold tracking-tight text-imdb-text md:text-[2rem]" style={{ letterSpacing: "-1.2px" }}>
            {t("duplicatesTitle")}
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-imdb-muted">{t("duplicatesIntro")}</p>
          {groups && (
            <p className="mt-3 text-[13px] font-medium text-imdb-subtle">
              {interpolate(t("duplicatesStats"), { groups: groups.length, rows: duplicateRowCount })}
            </p>
          )}
        </div>
      </div>

      {err && (
        <div className="rounded-imdb border border-imdb-error/50 bg-red-950/35 px-4 py-3 text-[13px] text-imdb-error">{err}</div>
      )}

      {!groups && !err && (
        <p className="text-[14px] text-imdb-muted">{t("loading")}</p>
      )}

      {groups && groups.length === 0 && !err && (
        <p className="rounded-imdb border border-imdb-border bg-imdb-elevated px-5 py-8 text-center text-[14px] text-imdb-muted">
          {t("duplicatesNoGroups")}
        </p>
      )}

      {groups && groups.length > 0 && (
        <ul className="space-y-6">
          {groups.map((g, idx) => (
            <li
              key={`${g.kind}-${g.label}-${idx}`}
              className="overflow-hidden rounded-imdb-card border border-imdb-border bg-imdb-elevated shadow-sm shadow-black/20"
            >
              <div className="flex flex-wrap items-center gap-2 border-b border-imdb-border bg-imdb-panel/40 px-4 py-3 md:px-5">
                <span className="rounded-full bg-imdb-gold/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-imdb-gold ring-1 ring-imdb-gold/35">
                  {kindLabel(t, g.kind)}
                </span>
                <h2 className="min-w-0 flex-1 text-[15px] font-semibold leading-snug text-imdb-text">{g.label}</h2>
                <span className="text-[12px] tabular-nums text-imdb-muted">{g.items.length}×</span>
              </div>
              <div className="px-4 py-3 md:px-5 md:py-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-imdb-dim">{t("duplicatesPathsHeading")}</p>
                <ul className="space-y-3">
                  {g.items.map((row) => (
                    <li key={row.id} className="rounded-imdb border border-imdb-border/80 bg-imdb-canvas/35 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="min-w-0 flex-1 break-all font-mono text-[11px] leading-relaxed text-imdb-text md:text-[12px]">
                          {row.filePath}
                        </p>
                        <Link
                          href={"/movie/" + row.id}
                          className="shrink-0 rounded-imdb bg-imdb-panel px-3 py-1 text-[11px] font-semibold text-imdb-text ring-1 ring-imdb-border transition hover:bg-imdb-rail"
                        >
                          {t("duplicatesOpen")}
                        </Link>
                      </div>
                      <p className="mt-1.5 truncate text-[11px] text-imdb-muted" title={row.folderPath}>
                        {row.folderPath}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
