# MoviesManager

## Web app (Next.js + local API)

1. Install: `npm install` (from repo root)
2. Database: `npm run db:push`
3. Optional: copy `server/.env.example` to `server/.env` and set `TMDB_API_KEY`
4. Run both dev servers: `npm run dev` (UI on http://localhost:3000, API on http://127.0.0.1:4000)

The API stores SQLite at `%USERPROFILE%\.moviemanager\movies.db` and posters under `images\` in that folder.

### Legacy Java desktop

The original JavaFX app remains under `src/`. Export `MovieManager.DMM` to JSON with `com.company.ExportDmmJson` and import it from **Settings** in the web UI.

