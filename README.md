# MoviesManager

## Web app (Next.js + local API)

1. Install: `npm install` (from repo root)
2. Database: `npm run db:push`
3. Optional: copy `server/.env.example` to `server/.env` and set `TMDB_API_KEY`
4. Run **both** dev servers from the repo root: `npm run dev` (UI on http://localhost:3000, API on http://127.0.0.1:4000)

If you only run `npm run dev` inside `web/`, you will see **ECONNREFUSED 127.0.0.1:4000** — the Express API is not running. Either use root `npm run dev`, or open a second terminal and run `npm run dev:api`.

If Prisma says **`The table Movie does not exist`**, the API was pointed at the wrong SQLite file. Remove any `DATABASE_URL=...placeholder...` line from `server/.env` (default is `%USERPROFILE%\.moviemanager\movies.db`), then run **`npm run db:push`** from the repo root once.

The API stores SQLite at `%USERPROFILE%\.moviemanager\movies.db` and posters under `images\` in that folder.

**Play** opens the video with your OS default application (Movies & TV, VLC, etc.) through the local API (`POST /api/movies/:id/play-local`), not inside the browser.

### Legacy Java desktop

The original JavaFX app remains under `src/`. Export `MovieManager.DMM` to JSON with `com.company.ExportDmmJson` and import it from **Settings** in the web UI.

