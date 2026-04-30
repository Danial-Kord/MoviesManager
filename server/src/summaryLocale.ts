import { createHash } from "crypto";
import type { Request } from "express";
import { translateOverviewToPersianViaOllama } from "./ollamaTranslate.js";
import { fetchTmdbOverviewLocalized } from "./tmdbLocalizedOverview.js";
import { translateCacheGet, translateCacheSet } from "./translateCache.js";

export type UiLocale = "en" | "fa";

export function parseLocaleFromRequest(req: Request): UiLocale {
  const q = String(req.query.locale ?? req.query.lang ?? "").toLowerCase();
  if (q === "fa" || q === "fa-ir" || q === "per") return "fa";
  const al = req.headers["accept-language"];
  const first = typeof al === "string" ? al.split(",")[0]?.trim().toLowerCase() ?? "" : "";
  if (first.startsWith("fa")) return "fa";
  return "en";
}

function digest(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 20);
}

export async function resolveSummaryForLocale(opts: {
  locale: UiLocale;
  summary: string | null;
  tmdbId: number | null;
  tmdbKind: "movie" | "tv";
}): Promise<string | null> {
  const { locale, summary, tmdbId, tmdbKind } = opts;
  if (locale !== "fa") return summary;

  const base = summary ?? "";
  const cacheKey = `fa:${tmdbKind}:${tmdbId ?? "none"}:${digest(base)}`;
  const hit = translateCacheGet(cacheKey);
  if (hit !== undefined) return hit;

  if (tmdbId != null) {
    const fromTmdb = await fetchTmdbOverviewLocalized(tmdbKind, tmdbId, "fa-IR");
    if (fromTmdb) {
      translateCacheSet(cacheKey, fromTmdb);
      return fromTmdb;
    }
  }

  if (base.trim()) {
    const viaOllama = await translateOverviewToPersianViaOllama(base);
    if (viaOllama) {
      translateCacheSet(cacheKey, viaOllama);
      return viaOllama;
    }
  }

  translateCacheSet(cacheKey, summary ?? "");
  return summary;
}
