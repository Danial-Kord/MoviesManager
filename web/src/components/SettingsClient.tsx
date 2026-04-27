"use client";

import { useCallback, useEffect, useState } from "react";

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
    <div className="space-y-8 text-sm text-gray-300">
      <p className="text-gray-500">
        Add one or more folders on this PC that contain your video files. The local API (port 4000) scans
        them when you use <strong className="text-gray-300">Rescan</strong> on the home page.
      </p>

      <div className="space-y-2">
        <label className="text-xs text-gray-500">New folder (absolute path, e.g. D:\Movies)</label>
        <div className="flex gap-2">
          <input
            className="min-w-0 flex-1 rounded border border-white/10 bg-black/40 px-3 py-2"
            value={newPath}
            onChange={(e) => setNewPath(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addPath()}
            placeholder="D:\path\to\library"
          />
          <button
            type="button"
            onClick={addPath}
            className="shrink-0 rounded bg-[#F5C518] px-4 py-2 font-semibold text-black hover:bg-[#e4b800]"
          >
            Add
          </button>
        </div>
        {ok && <p className="text-xs text-emerald-400">{ok}</p>}
        {err && <p className="text-xs text-red-400">{err}</p>}
      </div>

      <ul className="space-y-2">
        {paths.length === 0 && <li className="text-gray-500">No library paths yet.</li>}
        {paths.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between gap-2 rounded border border-white/5 bg-surface/60 px-3 py-2"
          >
            <span className="min-w-0 break-all text-xs sm:text-sm">{p.path}</span>
            <button
              type="button"
              onClick={() => removePath(p.id)}
              className="shrink-0 text-xs text-red-400 hover:underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="border-t border-white/10 pt-6">
        <h2 className="mb-2 font-semibold text-white">Import legacy JSON</h2>
        <p className="mb-3 text-xs text-gray-500">
          Export your library with the Java tool, then choose the JSON file. Format: an array of movie objects
          (with <code>path</code> or <code>filePath</code>).
        </p>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-white/20 px-3 py-2 hover:bg-white/5">
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

      <div className="border-t border-white/10 pt-4 text-xs text-gray-500">
        <p>
          Set <code className="text-gray-400">TMDB_API_KEY</code> in the server process environment (e.g.{" "}
          <code className="text-gray-400">server/.env</code>) to enable TMDb enrichment. Create a key at{" "}
          <a className="text-amber-500 hover:underline" href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer">
            themoviedb.org
          </a>
          .
        </p>
      </div>
    </div>
  );
}
