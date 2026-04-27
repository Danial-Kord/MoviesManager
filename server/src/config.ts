import "dotenv/config";
import { mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

export const DATA_DIR = join(homedir(), ".moviemanager");
export const IMAGES_DIR = join(DATA_DIR, "images");

/**
 * Set DATABASE_URL to host SQLite under ~/.moviemanager (must run before @prisma/client import).
 */
export function ensureDataDirAndDatabaseUrl() {
  mkdirSync(DATA_DIR, { recursive: true });
  mkdirSync(IMAGES_DIR, { recursive: true });
  if (!process.env.DATABASE_URL) {
    const dbFile = join(DATA_DIR, "movies.db");
    const urlPath = dbFile.split("\\").join("/");
    // Prisma on Windows: file:C:/... or file:///C:/... (file:/C:/ is invalid for sqlite)
    if (urlPath.match(/^[A-Za-z]:/)) {
      process.env.DATABASE_URL = `file:${urlPath}`;
    } else {
      process.env.DATABASE_URL = `file:${urlPath}`;
    }
  }
}

export const API_HOST = process.env.API_HOST ?? "127.0.0.1";
export const API_PORT = Number(process.env.API_PORT ?? 4000);
export const TMDB_API_KEY = process.env.TMDB_API_KEY ?? "";
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
