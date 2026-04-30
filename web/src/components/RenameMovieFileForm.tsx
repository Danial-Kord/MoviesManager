"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { renameMovieFile } from "@/lib/api";
import { useLocale } from "@/lib/i18n/context";

export function RenameMovieFileForm({
  movieId,
  initialFileName,
  onRenamed,
  compact,
  refreshAfterRename,
}: {
  movieId: string;
  initialFileName: string;
  onRenamed?: () => void;
  /** Tighter layout for Needs rename list rows */
  compact?: boolean;
  /** Call after success (e.g. movie detail server component) */
  refreshAfterRename?: boolean;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [fileName, setFileName] = useState(initialFileName);
  const [busy, setBusy] = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);

  useEffect(() => {
    setFileName(initialFileName);
  }, [initialFileName, movieId]);

  async function apply(e?: FormEvent) {
    e?.preventDefault();
    setLocalErr(null);
    setBusy(true);
    try {
      await renameMovieFile(movieId, fileName.trim());
      onRenamed?.();
      if (refreshAfterRename) router.refresh();
    } catch (err) {
      setLocalErr((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const wrap = compact ? "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center" : "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end";

  return (
    <form onSubmit={(ev) => void apply(ev)} className={compact ? "mt-2 w-full max-w-full" : "mt-4"}>
      <div className={wrap}>
        <label className="block min-w-0 flex-1">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-imdb-dim">{t("renameFileLabel")}</span>
          <input
            type="text"
            value={fileName}
            onChange={(ev) => setFileName(ev.target.value)}
            spellCheck={false}
            autoComplete="off"
            disabled={busy}
            className="w-full min-w-0 rounded-imdb border border-imdb-border bg-imdb-canvas px-3 py-2 font-mono text-[12px] text-imdb-text outline-none focus:border-imdb-focus focus:ring-2 focus:ring-imdb-focus/25 disabled:opacity-60"
          />
        </label>
        <button
          type="submit"
          disabled={busy || fileName.trim() === ""}
          className="shrink-0 rounded-imdb bg-imdb-panel px-4 py-2 text-[12px] font-semibold text-imdb-text ring-1 ring-imdb-border transition hover:bg-imdb-rail disabled:opacity-50"
        >
          {busy ? t("loading") : t("renameFileApply")}
        </button>
      </div>
      {!compact && <p className="mt-2 text-[11px] leading-relaxed text-imdb-muted">{t("renameFileHint")}</p>}
      {localErr && <p className="mt-2 text-[12px] text-imdb-error">{localErr}</p>}
    </form>
  );
}
