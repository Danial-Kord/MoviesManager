"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  enrichBulkStream,
  ENRICH_BULK_DEFAULT,
  scanLibraryStream,
  type EnrichProgressEvent,
  type ScanProgressEvent,
} from "@/lib/api";
import { useLocale } from "@/lib/i18n/context";
import { interpolate } from "@/lib/i18n/messages";

export type OverlayScan = {
  kind: "scan";
  phase: "discover" | "import";
  pathsDone: number;
  pathsTotal: number;
  filesDiscovered: number;
  filesDone: number;
  filesTotal: number;
  percent: number;
};

export type OverlayEnrich = {
  kind: "enrich";
  variant?: "bulk" | "page";
  done: number;
  total: number;
  percent: number;
};

type LibraryJobContextValue = {
  busy: boolean;
  overlay: OverlayScan | OverlayEnrich | null;
  runScan: () => Promise<void>;
  runEnrich: (limit?: number) => Promise<void>;
  runBrowsePageEnrich: (executors: Array<() => Promise<void>>) => Promise<void>;
};

const LibraryJobContext = createContext<LibraryJobContextValue | null>(null);

function scanEventToOverlay(e: ScanProgressEvent): OverlayScan {
  const fd = e.filesDiscovered ?? 0;
  const filesDone = e.filesDone ?? 0;
  const filesTotal = e.filesTotal ?? fd;
  return {
    kind: "scan",
    phase: e.scanPhase,
    pathsDone: e.pathsDone,
    pathsTotal: e.pathsTotal,
    filesDiscovered: fd,
    filesDone,
    filesTotal,
    percent: e.percent,
  };
}

export function LibraryJobProvider({ children }: { children: ReactNode }) {
  const { t } = useLocale();
  const [overlay, setOverlay] = useState<OverlayScan | OverlayEnrich | null>(null);

  useEffect(() => {
    if (!overlay) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [overlay]);

  const runScan = useCallback(async () => {
    setOverlay({
      kind: "scan",
      phase: "discover",
      pathsDone: 0,
      pathsTotal: 0,
      filesDiscovered: 0,
      filesDone: 0,
      filesTotal: 0,
      percent: 0,
    });
    try {
      await scanLibraryStream((e) => {
        setOverlay(scanEventToOverlay(e));
      });
    } finally {
      setOverlay(null);
    }
  }, []);

  const runEnrich = useCallback(async (limit = ENRICH_BULK_DEFAULT) => {
    setOverlay({ kind: "enrich", variant: "bulk", done: 0, total: 0, percent: 0 });
    try {
      await enrichBulkStream(limit, (e: EnrichProgressEvent) => {
        setOverlay({
          kind: "enrich",
          variant: "bulk",
          done: e.done,
          total: e.total,
          percent: e.percent,
        });
      });
    } finally {
      setOverlay(null);
    }
  }, []);

  const runBrowsePageEnrich = useCallback(async (executors: Array<() => Promise<void>>) => {
    const total = executors.length;
    if (total === 0) return;
    setOverlay({ kind: "enrich", variant: "page", done: 0, total, percent: 0 });
    try {
      let done = 0;
      for (const exec of executors) {
        await exec();
        done += 1;
        setOverlay({
          kind: "enrich",
          variant: "page",
          done,
          total,
          percent: Math.round((done / total) * 100),
        });
      }
    } finally {
      setOverlay(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      busy: overlay !== null,
      overlay,
      runScan,
      runEnrich,
      runBrowsePageEnrich,
    }),
    [overlay, runScan, runEnrich, runBrowsePageEnrich]
  );

  const pct = overlay ? Math.min(100, Math.max(0, overlay.percent)) : 0;

  return (
    <LibraryJobContext.Provider value={value}>
      {children}
      {overlay ? (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/65 px-4 backdrop-blur-[2px]"
          role="alertdialog"
          aria-busy="true"
          aria-live="polite"
          aria-modal="true"
        >
          <div className="pointer-events-none w-full max-w-md rounded-imdb-card border border-imdb-border bg-imdb-elevated p-6 shadow-xl shadow-black/60 select-none">
            <h2 className="text-lg font-bold tracking-tight text-imdb-text">
              {overlay.kind === "scan"
                ? t("jobOverlayScanTitle")
                : overlay.variant === "page"
                  ? t("jobOverlayPageEnrichTitle")
                  : t("jobOverlayEnrichTitle")}
            </h2>
            <p className="mt-1 text-[13px] leading-snug text-imdb-muted">
              {overlay.kind === "scan"
                ? overlay.phase === "discover"
                  ? t("jobPhaseDiscover")
                  : t("jobPhaseImport")
                : t("jobPhaseEnrich")}
            </p>

            {overlay.kind === "scan" ? (
              <div className="mt-4 space-y-1 text-[12px] tabular-nums text-imdb-text">
                <p>{interpolate(t("jobPathsProgress"), { done: overlay.pathsDone, total: overlay.pathsTotal })}</p>
                {overlay.phase === "discover" ? (
                  <p>{interpolate(t("jobVideosFound"), { n: overlay.filesDiscovered })}</p>
                ) : (
                  <p>{interpolate(t("jobImportProgress"), { done: overlay.filesDone, total: overlay.filesTotal })}</p>
                )}
              </div>
            ) : (
              <div className="mt-4 text-[12px] tabular-nums text-imdb-text">
                <p>{interpolate(t("jobEnrichProgress"), { done: overlay.done, total: overlay.total })}</p>
              </div>
            )}

            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-imdb-panel ring-1 ring-imdb-border/80">
              <div
                className="h-full rounded-full bg-imdb-gold transition-[width] duration-150 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2 text-end text-[13px] font-semibold tabular-nums text-imdb-gold">{pct}%</p>
          </div>
        </div>
      ) : null}
    </LibraryJobContext.Provider>
  );
}

export function useLibraryJob(): LibraryJobContextValue {
  const ctx = useContext(LibraryJobContext);
  if (!ctx) throw new Error("useLibraryJob must be used within LibraryJobProvider");
  return ctx;
}
