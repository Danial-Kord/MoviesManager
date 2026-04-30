# MoviesManager

## Features

- **Movies & TV series**: Standalone video files are **movies**. Paths that look like TV episodes (`S01E02`, `1x02`, etc.) are grouped under one **series** tile on the home grid; open a series to see episodes. Each episode stays a normal row for playback and metadata.
- **Dubbed**: A **heuristic** flag derived from folder/filename hints (not detection of actual audio). Shown as a badge on posters where relevant and on detail pages.
- **Categories**: Assign tags per movie on the movie detail screen. Use **Genre** and library filters on Home alongside TMDb genre text after enrichment.
- **Home filters**: Browse **movies only**, **series only**, or both; visible vs hidden; favorites; sort; folder and year filters.
- **TMDb enrichment**: Optional `TMDB_API_KEY`; **Enrich TMDb** on Home fills posters, summaries, scores, and merges series metadata.
- **Play locally**: **Play** asks the local API to open the file in your OS default app (VLC, Movies & TV, etc.), not inside the browser.
- **Languages**: English / فارسی from the header. Persian plot text prefers TMDb’s Persian overview; optional **Ollama** fallback for translation (`OLLAMA_URL`, `OLLAMA_MODEL` in `server/.env` — see `.env.example`).
- **Settings**: Library folders to scan, SQLite/poster paths, legacy Java export JSON import, and destructive database reset. The Settings UI also summarizes how the library behaves.

## Web app (Next.js + local API)

1. Install: `npm install` (from repo root)
2. Database: `npm run db:push`
3. Optional: copy `server/.env.example` to `server/.env` and set `TMDB_API_KEY`
4. Run **both** dev servers from the repo root: `npm run dev` (UI on http://localhost:3000, API on http://127.0.0.1:4000)

If you only run `npm run dev` inside `web/`, you will see **ECONNREFUSED 127.0.0.1:4000** — the Express API is not running. Either use root `npm run dev`, or open a second terminal and run `npm run dev:api`.

If Prisma says **`The table Movie does not exist`**, the API was pointed at the wrong SQLite file. Remove any `DATABASE_URL=...placeholder...` line from `server/.env` (default is `%USERPROFILE%\.moviemanager\movies.db`), then run **`npm run db:push`** from the repo root once.

The API stores SQLite at `%USERPROFILE%\.moviemanager\movies.db` and posters under `images\` in that folder. Filename parsing tests: `npm run test -w server`.

### Legacy Java desktop

The original JavaFX app remains under `src/`. Export `MovieManager.DMM` to JSON with `com.company.ExportDmmJson` and import it from **Settings** in the web UI.

