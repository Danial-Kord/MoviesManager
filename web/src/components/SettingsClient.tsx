"use client";

import { useCallback, useEffect, useState } from "react";
import { IconFolder } from "@/components/icons";

type PathRow = { id: string; path: string; createdAt: string };

export function SettingsClient() {
  const [paths, setPaths] = useState<PathRow[]>([]);
  const [newPath, setNewPath] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [imp, setImp] = useState(false);

  const refresh = useCallback(async () => {
    const r = await fetch("/api/paths", { cache: "no-store" });
    if (!r.ok) {
      setErr(await r.text());
      return;
    }
    setPaths(await r.json());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function addPath() {
    setErr(null);
    setOk(null);
    if (!newPath.trim()) return;
    const r = await fetch("/api/paths", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: newPath.trim() }),
    });
    if (!r.ok) {
      setErr(await r.text());
      return;
    }
    setNewPath("");
    setOk("Path added. Use Rescan on Home to import files.");
    void refresh();
  }

  async function removePath(id: string) {
    await fetch("/api/paths/" + id, { method: "DELETE" });
    void refresh();
  }

  return (
    <div className="space-y-8 rounded-imdb-card border border-imdb-border bg-imdb-elevated p-6 text-[14px] text-imdb-text shadow-sm md:p-8">
      <p className="text-imdb-muted">
        Add one or more folders on this PC that contain your video files. The local API (port 4000) scans them when you use{" "}
        <strong className="font-semibold text-imdb-text">Rescan</strong> on the home page.
      </p>

      <div className="space-y-2">
        <label className="text-[12px] font-medium text-imdb-muted">New folder (absolute path, e.g. D:\Movies)</label>
        <div className="flex flex-wrap gap-2">
          <input
            className="min-w-0 flex-1 rounded-imdb border border-imdb-border bg-imdb-elevated px-3 py-[11px] text-[16px] text-imdb-text outline-none focus:border-imdb-focus focus:ring-2 focus:ring-imdb-focus/25"
            value={newPath}
            onChange={(e) => setNewPath(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addPath()}
            placeholder="D:\path\to\library"
          />
          <button
            type="button"
            onClick={addPath}
            className="shrink-0 rounded-imdb bg-imdb-gold px-[14px] py-[6px] text-[12px] font-semibold text-black transition hover:brightness-95"
          >
            Add
          </button>
        </div>
        {ok && <p className="text-[12px] text-imdb-muted">{ok}</p>}
        {err && <p className="text-[12px] text-imdb-error">{err}</p>}
      </div>

      <ul className="space-y-2">
        {paths.length === 0 && <li className="text-imdb-subtle">No library paths yet.</li>}
        {paths.map((p) => (
          <li
            key={p.id}
            className="flex items-start gap-3 rounded-imdb border border-imdb-border bg-imdb-canvas/50 px-3 py-3 md:items-center md:justify-between"
          >
            <span className="flex min-w-0 items-start gap-2">
              <IconFolder className="mt-0.5 shrink-0 text-imdb-subtle" size={18} />
              <span className="break-all text-[13px] leading-snug text-imdb-text sm:text-sm">{p.path}</span>
            </span>
            <button
              type="button"
              onClick={() => removePath(p.id)}
              className="shrink-0 rounded-imdb px-2 py-1 text-[12px] font-semibold text-imdb-error hover:bg-imdb-hover"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="border-t border-imdb-border pt-8">
        <h2 className="mb-3 text-[16px] font-bold text-imdb-text">Import legacy JSON</h2>
        <p className="mb-4 text-[13px] leading-relaxed text-imdb-muted">
          Export your library with the Java tool, then choose the JSON file. Format: an array of movie objects (with{" "}
          <code className="rounded bg-imdb-panel px-1 font-mono text-[12px] text-imdb-text">path</code> or{" "}
          <code className="rounded bg-imdb-panel px-1 font-mono text-[12px] text-imdb-text">filePath</code>).
        </p>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-imdb border border-imdb-border px-4 py-2 text-[12px] font-semibold text-imdb-text transition hover:bg-imdb-hover">
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setImp(true);
              setErr(null);
              setOk(null);
              try {
                const text = await f.text();
                const data = JSON.parse(text) as unknown;
                const r = await fetch("/api/import/legacy-json", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data),
                });
                if (!r.ok) throw new Error(await r.text());
                const j = (await r.json()) as { imported: number };
                setOk(`Imported ${j.imported} items.`);
              } catch (er) {
                setErr((er as Error).message);
              } finally {
                setImp(false);
                e.target.value = "";
              }
            }}
          />
          {imp ? "Importing…" : "Choose JSON file"}
        </label>
      </div>

      <div className="border-t border-imdb-border pt-6 text-[12px] text-imdb-subtle">
        <p>
          Set <code className="rounded bg-imdb-canvas px-1 font-mono text-imdb-text">TMDB_API_KEY</code> in{" "}
          <code className="rounded bg-imdb-canvas px-1 font-mono text-imdb-text">server/.env</code> for TMDb enrichment.{" "}
          <a className="font-medium text-imdb-text underline underline-offset-2 hover:text-imdb-gold" href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer">
            Create a key
          </a>
          .
        </p>
      </div>
    </div>
  );
}
