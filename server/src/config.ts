import "dotenv/config";
import { mkdirSync } from "fs";
import { homedir } from "os";
import { join, resolve } from "path";

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

/** Absolute path to the SQLite file backing Prisma (after placeholder resolution). */
export function getSqliteDatabaseFilePath(): string {
  ensureDataDirAndDatabaseUrl();
  const raw = (process.env.DATABASE_URL ?? "").trim();
  let pathPart = raw.replace(/^file:/i, "").trim();
  if (pathPart.startsWith("///")) pathPart = pathPart.slice(2);
  else if (pathPart.startsWith("//")) pathPart = pathPart.slice(1);
  pathPart = decodeURIComponent(pathPart);
  if (process.platform === "win32" && /^\/[A-Za-z]:/.test(pathPart)) pathPart = pathPart.slice(1);
  if (/^[A-Za-z]:/.test(pathPart) || pathPart.startsWith("/")) return resolve(pathPart);
  return resolve(process.cwd(), pathPart);
}

export const API_HOST = process.env.API_HOST ?? "127.0.0.1";
export const API_PORT = Number(process.env.API_PORT ?? 4000);
export const TMDB_API_KEY = process.env.TMDB_API_KEY ?? "";
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

/** Local Ollama HTTP API — used when TMDb has no Persian overview but enrichment summary exists (English). */
export const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://127.0.0.1:11434";
/** Model must be pulled locally: `ollama pull llama3.2` (or your preferred multilingual instruct model). */
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3.2";

/** When true, library scan calls Ollama once per movie file to refine `{displayName,year}` from messy filenames (slow). */
export const OLLAMA_TITLE_PARSE = /^1|true|yes$/i.test(process.env.OLLAMA_TITLE_PARSE ?? "");
