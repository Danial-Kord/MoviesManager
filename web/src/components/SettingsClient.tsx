"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  fetchDatabaseInfo,
  RESET_DATABASE_CONFIRM_PHRASE,
  resetLibraryDatabase,
} from "@/lib/api";
import { IconDatabase, IconFolder, IconTrash, IconUpload } from "@/components/icons";

type PathRow = { id: string; path: string; createdAt: string };

function InfoTile({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-imdb border border-imdb-border bg-imdb-canvas/45 p-4 shadow-sm shadow-black/15">
      <h3 className="text-[13px] font-bold tracking-tight text-imdb-text">{title}</h3>
      <div className="mt-2 text-[12px] leading-relaxed text-imdb-muted">{children}</div>
    </div>
  );
}

function SettingsSection({
  icon,
  title,
  description,
  variant = "default",
  children,
}: {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  variant?: "default" | "danger";
  children: ReactNode;
}) {
  const shell =
    variant === "danger"
      ? "border-imdb-error/40 bg-gradient-to-b from-red-950/25 to-imdb-elevated shadow-[inset_0_1px_0_0_rgba(248,113,113,0.12)]"
      : "border-imdb-border bg-imdb-elevated shadow-sm shadow-black/20";

  const iconBg =
    variant === "danger" ? "bg-imdb-error/15 text-imdb-error ring-1 ring-imdb-error/30" : "bg-imdb-panel text-imdb-gold ring-1 ring-imdb-border";

  return (
    <section className={`rounded-imdb-card border p-6 md:p-8 ${shell}`}>
      <div className="mb-6 flex gap-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-imdb ${iconBg}`}>{icon}</div>
        <div className="min-w-0 pt-0.5">
          <h2 className="text-[1.125rem] font-bold tracking-tight text-imdb-text">{title}</h2>
          {description ? <div className="mt-1.5 text-[13px] leading-relaxed text-imdb-muted">{description}</div> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export function SettingsClient() {
  const [paths, setPaths] = useState<PathRow[]>([]);
  const [newPath, setNewPath] = useState("");
  const [dbInfo, setDbInfo] = useState<{ databaseFile: string; dataDir: string; imagesDir: string } | null>(null);
  const [resetPhrase, setResetPhrase] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [imp, setImp] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);

  const refreshPaths = useCallback(async () => {
    const r = await fetch("/api/paths", { cache: "no-store" });
    if (!r.ok) {
      setErr(await r.text());
      return;
    }
    setPaths(await r.json());
  }, []);

  const refreshDbInfo = useCallback(async () => {
    try {
      setDbInfo(await fetchDatabaseInfo());
    } catch {
      setDbInfo(null);
    }
  }, []);

  useEffect(() => {
    void refreshPaths();
    void refreshDbInfo();
  }, [refreshPaths, refreshDbInfo]);

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
    void refreshPaths();
  }

  async function removePath(id: string) {
    await fetch("/api/paths/" + id, { method: "DELETE" });
    void refreshPaths();
  }

  async function onResetDatabase() {
    setErr(null);
    setOk(null);
    setResetBusy(true);
    try {
      await resetLibraryDatabase();
      setResetPhrase("");
      setOk("Database was erased and recreated. Reloading…");
      window.setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setResetBusy(false);
    }
  }

  const resetEnabled = resetPhrase === RESET_DATABASE_CONFIRM_PHRASE && !resetBusy;

  return (
    <div className="space-y-10">
      {ok && (
        <div className="rounded-imdb border border-imdb-border/80 bg-imdb-panel/60 px-4 py-3 text-[13px] text-imdb-muted">
          {ok}
        </div>
      )}
      {err && (
        <div className="rounded-imdb border border-imdb-error/50 bg-red-950/35 px-4 py-3 text-[13px] text-imdb-error">{err}</div>
      )}

      <section className="rounded-imdb-card border border-imdb-border bg-gradient-to-b from-imdb-panel/25 via-imdb-elevated to-imdb-elevated p-6 shadow-md shadow-black/25 md:p-8">
        <div className="mb-5 border-b border-imdb-border pb-4">
          <h2 className="text-[1.125rem] font-bold tracking-tight text-imdb-text">How your library works</h2>
          <p className="mt-1.5 max-w-3xl text-[13px] leading-relaxed text-imdb-muted">
            Quick reference for movies vs series, dubbed hints, categories, and what the Home page can filter.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoTile title="Movies &amp; TV series">
            <p>
              One file per row in the database. Episode-shaped filenames are merged into a single <strong className="font-semibold text-imdb-text">series</strong> card on
              Home; open it for seasons and episodes. Standalone files stay <strong className="font-semibold text-imdb-text">movies</strong>.
            </p>
          </InfoTile>
          <InfoTile title="Dubbed">
            <p>
              <strong className="font-semibold text-imdb-text">Dubbed</strong> is inferred from path/folder naming (heuristic only — not proof of which audio tracks exist).
              You’ll see badges on tiles and flags on movie/episode detail when it matches.
            </p>
          </InfoTile>
          <InfoTile title="Categories">
            <p>
              On a <strong className="font-semibold text-imdb-text">movie</strong> detail page you can assign <strong className="font-semibold text-imdb-text">categories</strong>{" "}
              (tags). Use these together with the <strong className="font-semibold text-imdb-text">Genre</strong> filter on Home (TMDb genre text appears after enrichment).
            </p>
          </InfoTile>
          <InfoTile title="Home filters &amp; enrichment">
            <p>
              Browse <strong className="font-semibold text-imdb-text">all</strong>, <strong className="font-semibold text-imdb-text">movies only</strong>, or{" "}
              <strong className="font-semibold text-imdb-text">TV series only</strong>; toggle favorites, visible/hidden, scores, folder/year. Run{" "}
              <strong className="font-semibold text-imdb-text">Enrich TMDb</strong> on Home after setting{" "}
              <code className="rounded bg-imdb-canvas px-1 font-mono text-[11px] text-imdb-text">TMDB_API_KEY</code> in{" "}
              <code className="rounded bg-imdb-canvas px-1 font-mono text-[11px] text-imdb-text">server/.env</code>.
            </p>
          </InfoTile>
          <InfoTile title="Language &amp; summaries">
            <p>
              Use the header language switcher for English / فارسی. Persian plot text prefers TMDb’s Persian overview; optional local{" "}
              <strong className="font-semibold text-imdb-text">Ollama</strong> fills gaps — set{" "}
              <code className="rounded bg-imdb-canvas px-1 font-mono text-[11px] text-imdb-text">OLLAMA_URL</code> and{" "}
              <code className="rounded bg-imdb-canvas px-1 font-mono text-[11px] text-imdb-text">OLLAMA_MODEL</code> in{" "}
              <code className="rounded bg-imdb-canvas px-1 font-mono text-[11px] text-imdb-text">server/.env</code>.
            </p>
          </InfoTile>
          <InfoTile title="Play">
            <p>
              <strong className="font-semibold text-imdb-text">Play</strong> calls the local API so your OS opens the file (VLC, Movies &amp; TV, etc.) — playback is not
              inside the browser.
            </p>
          </InfoTile>
        </div>
      </section>

      <SettingsSection
        icon={<IconFolder size={20} />}
        title="Library folders"
        description="Folders on this PC scanned when you use Rescan on the home page. Paths are stored in your local database."
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-imdb-dim">
              Add folder
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                className="min-w-0 flex-1 rounded-imdb border border-imdb-border bg-imdb-canvas/80 px-3 py-[11px] text-[15px] text-imdb-text outline-none transition focus:border-imdb-focus focus:ring-2 focus:ring-imdb-focus/25"
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void addPath()}
                placeholder="Absolute path, e.g. D:\Movies"
              />
              <button
                type="button"
                onClick={() => void addPath()}
                className="shrink-0 rounded-imdb bg-imdb-gold px-5 py-[10px] text-[13px] font-semibold text-black transition hover:brightness-95"
              >
                Add path
              </button>
            </div>
          </div>

          <ul className="space-y-2">
            {paths.length === 0 && (
              <li className="rounded-imdb border border-dashed border-imdb-border bg-imdb-canvas/40 px-4 py-8 text-center text-[13px] text-imdb-subtle">
                No folders yet. Add a path above.
              </li>
            )}
            {paths.map((p) => (
              <li
                key={p.id}
                className="flex flex-col gap-3 rounded-imdb border border-imdb-border bg-imdb-canvas/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="flex min-w-0 items-start gap-3">
                  <IconFolder className="mt-0.5 shrink-0 text-imdb-subtle" size={18} />
                  <span className="break-all font-mono text-[12px] leading-snug text-imdb-text sm:text-[13px]">{p.path}</span>
                </span>
                <button
                  type="button"
                  onClick={() => void removePath(p.id)}
                  className="shrink-0 self-start rounded-imdb px-3 py-1.5 text-[12px] font-semibold text-imdb-error ring-1 ring-imdb-error/30 transition hover:bg-imdb-error/10 sm:self-auto"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </SettingsSection>

      <SettingsSection
        icon={<IconDatabase size={20} />}
        title="Local database"
        description="SQLite stores your library paths, movies, series, categories, and enrichment metadata. Poster files stay under your images folder unless you delete them manually."
      >
        <div className="space-y-3 text-[13px]">
          {dbInfo ? (
            <dl className="space-y-2 rounded-imdb border border-imdb-border bg-imdb-canvas/40 p-4 font-mono text-[11px] leading-relaxed text-imdb-muted sm:text-[12px]">
              <div>
                <dt className="text-imdb-dim">Database file</dt>
                <dd className="mt-0.5 break-all text-imdb-text">{dbInfo.databaseFile}</dd>
              </div>
              <div>
                <dt className="text-imdb-dim">Data directory</dt>
                <dd className="mt-0.5 break-all text-imdb-text">{dbInfo.dataDir}</dd>
              </div>
              <div>
                <dt className="text-imdb-dim">Posters</dt>
                <dd className="mt-0.5 break-all text-imdb-text">{dbInfo.imagesDir}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-imdb-subtle">Could not load database paths (is the API running?).</p>
          )}
          <button
            type="button"
            onClick={() => void refreshDbInfo()}
            className="text-[12px] font-semibold text-imdb-muted underline-offset-4 hover:text-imdb-text hover:underline"
          >
            Refresh file paths
          </button>
        </div>
      </SettingsSection>

      <SettingsSection
        icon={<IconTrash size={20} />}
        title="Erase library database"
        description="Deletes the SQLite file (movies, TV rows, library paths, categories) and runs schema sync to create an empty database. Downloaded posters in the images folder are not removed."
        variant="danger"
      >
        <div className="space-y-4">
          <p className="text-[13px] leading-relaxed text-imdb-muted">
            To confirm, type{" "}
            <code className="rounded bg-imdb-canvas px-1.5 py-0.5 font-mono text-[12px] text-imdb-gold">{RESET_DATABASE_CONFIRM_PHRASE}</code>{" "}
            exactly, then click the button.
          </p>
          <input
            className="w-full rounded-imdb border border-imdb-border bg-imdb-canvas/90 px-3 py-[10px] font-mono text-[13px] text-imdb-text outline-none focus:border-imdb-error/60 focus:ring-2 focus:ring-imdb-error/20"
            value={resetPhrase}
            onChange={(e) => setResetPhrase(e.target.value)}
            placeholder={RESET_DATABASE_CONFIRM_PHRASE}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            disabled={!resetEnabled}
            onClick={() => void onResetDatabase()}
            className="rounded-imdb bg-imdb-error/90 px-5 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-black/30 transition hover:bg-imdb-error disabled:cursor-not-allowed disabled:opacity-40"
          >
            {resetBusy ? "Erasing…" : "Erase database and reset"}
          </button>
        </div>
      </SettingsSection>

      <SettingsSection
        icon={<IconUpload size={20} />}
        title="Import legacy JSON"
        description={
          <>
            Export your library with the Java tool, then choose the JSON file. Expect an array of movie objects with{" "}
            <code className="rounded bg-imdb-panel px-1 font-mono text-[11px] text-imdb-text">path</code> or{" "}
            <code className="rounded bg-imdb-panel px-1 font-mono text-[11px] text-imdb-text">filePath</code>.
          </>
        }
      >
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-imdb border border-imdb-border bg-imdb-panel/40 px-5 py-3 text-[13px] font-semibold text-imdb-text ring-1 ring-imdb-border transition hover:bg-imdb-hover hover:ring-imdb-gold/25">
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
      </SettingsSection>

      <footer className="rounded-imdb-card border border-imdb-border bg-imdb-panel/30 px-5 py-5 text-[12px] leading-relaxed text-imdb-subtle">
        <p className="font-semibold text-imdb-text">Environment</p>
        <ul className="mt-2 list-inside list-disc space-y-1.5">
          <li>
            <code className="rounded bg-imdb-canvas px-1 font-mono text-imdb-text">TMDB_API_KEY</code> in{" "}
            <code className="rounded bg-imdb-canvas px-1 font-mono text-imdb-text">server/.env</code> for enrichment —{" "}
            <a
              className="font-medium text-imdb-text underline underline-offset-2 hover:text-imdb-gold"
              href="https://www.themoviedb.org/settings/api"
              target="_blank"
              rel="noreferrer"
            >
              create a key
            </a>
            .
          </li>
          <li>
            Optional Persian summaries: <code className="rounded bg-imdb-canvas px-1 font-mono text-imdb-text">OLLAMA_URL</code>,{" "}
            <code className="rounded bg-imdb-canvas px-1 font-mono text-imdb-text">OLLAMA_MODEL</code> (see{" "}
            <code className="rounded bg-imdb-canvas px-1 font-mono text-imdb-text">server/.env.example</code>).
          </li>
        </ul>
      </footer>
    </div>
  );
}
