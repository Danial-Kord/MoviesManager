import "dotenv/config";
import { mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

export const DATA_DIR = join(homedir(), ".moviemanager");
export const IMAGES_DIR = join(DATA_DIR, "images");

/**
 * Resolve SQLite URL to %USERPROFILE%/.moviemanager/movies.db
 * unless DATABASE_URL is set to a real path (not a template placeholder).
 */
export function ensureDataDirAndDatabaseUrl() {
  mkdirSync(DATA_DIR, { recursive: true });
  mkdirSync(IMAGES_DIR, { recursive: true });

  const dbFile = join(DATA_DIR, "movies.db");
  const urlPath = dbFile.split("\\").join("/");
  const homeUrl = urlPath.match(/^[A-Za-z]:/) ? `file:${urlPath}` : `file:${urlPath}`;

  const raw = (process.env.DATABASE_URL ?? "").trim();
  const isPlaceholder =
    !raw ||
    /placeholder/i.test(raw) ||
    raw.includes("../prisma/movies.db") ||
    raw === "file:./dev.db";

  if (isPlaceholder) {
    process.env.DATABASE_URL = homeUrl;
  }
}

export const API_HOST = process.env.API_HOST ?? "127.0.0.1";
export const API_PORT = Number(process.env.API_PORT ?? 4000);
export const TMDB_API_KEY = process.env.TMDB_API_KEY ?? "";
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
