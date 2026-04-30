/**
 * Port of com.company.Sorting stringConditions + findName + getYear.
 */
import type { PrismaClient } from "@prisma/client";

const STRING_CONDITIONS: string[] = [
  "256",
  "264",
  "255",
  "480",
  "20",
  "19",
  "21",
  "22",
  "1080",
  "720",
  ".mkv",
  ".mp4",
  ".mpeg",
  ".mpeg2",
  "bluray",
  "hdrip",
  "hdcam",
  "hdtv",
  "4k",
  "web",
  ".avi",
];

function findCutIndex(name: string): number {
  let f = name.length;
  for (let i = 2; i < name.length; i++) {
    let flag = false;
    if (i > 0) {
      const temp = name.toLowerCase();
      for (const cond of STRING_CONDITIONS) {
        if (temp.substring(2, i).endsWith(cond)) {
          f = i - cond.length;
          flag = true;
          break;
        }
      }
    }
    if (flag) break;
  }
  return f;
}

export function getYearFromName(fileName: string): string {
  if (
    !fileName.includes("20") &&
    !fileName.includes("19") &&
    !fileName.includes("21") &&
    !fileName.includes("22")
  ) {
    return "";
  }
  const temp = fileName;
  for (let i = 2; i < fileName.length && i + 2 < fileName.length; i++) {
    const q = fileName[i - 1] + fileName[i];
    if (q === "20" || q === "19" || q === "21" || q === "22") {
      return q + fileName[i + 1] + fileName[i + 2];
    }
  }
  return "";
}

const VIDEO_EXTS = new Set([
  ".mkv",
  ".mp4",
  ".mpeg",
  ".mpeg2",
  ".avi",
  ".mpg",
  ".webm",
  ".m4v",
]);

/** Built-in path/filename hints for a dubbed release (also checks parent folders). User rules extend these. */
export const BUILTIN_DUBBED_REGEXES: readonly RegExp[] = [
  /\bdubbed\b/i,
  /\bdual[\s._-]*audio\b/i,
  /\bmulti[\s._-]*audio\b/i,
  /\b2[\s._-]*audio\b/i,
  /\b(hindi|telugu|tamil|malayalam|kannada|bengali|marathi|gujarati|urdu|chinese|mandarin|cantonese|spanish|french|german|italian|portuguese|russian|korean|japanese|vietnamese|thai|polish|turkish|arabic)[\s._-]*dub(?:bed)?\b/i,
  /\b(?:eng|english)[\s._-]*dub(?:bed)?\b/i,
  /[\s._-]dub[\s._-]/i,
  /\bdub\.(?:mp4|mkv|avi|webm)\b/i,
];

export type DubbedRuleMode = "contains" | "regex";

export type DubbedRuleDto = {
  pattern: string;
  mode: DubbedRuleMode;
  enabled?: boolean;
};

export const LIBRARY_SETTINGS_ROW_ID = "default";
const MAX_DUBBED_PATTERN_LENGTH = 200;

type CompiledUserRule = { kind: "contains"; needle: string } | { kind: "regex"; re: RegExp };

let userCompiledRules: CompiledUserRule[] = [];

export function normalizePathForDubbedMatch(filePath: string): string {
  return filePath.replace(/[/\\]+/g, "/").toLowerCase();
}

/** Test-only: clear user rules without touching DB. */
export function resetUserDubbedRulesForTests(): void {
  userCompiledRules = [];
}

export function validateAndNormalizeDubbedRules(raw: unknown): { ok: true; rules: DubbedRuleDto[] } | { ok: false; error: string } {
  if (!Array.isArray(raw)) return { ok: false, error: "dubbedRules must be an array" };
  const rules: DubbedRuleDto[] = [];
  for (let i = 0; i < raw.length; i++) {
    const row = raw[i];
    if (row === null || typeof row !== "object") return { ok: false, error: `Rule ${i + 1}: expected object` };
    const rec = row as Record<string, unknown>;
    const pattern = typeof rec.pattern === "string" ? rec.pattern : "";
    const mode = rec.mode === "regex" || rec.mode === "contains" ? rec.mode : null;
    const enabled = rec.enabled === undefined ? true : Boolean(rec.enabled);
    if (!mode) return { ok: false, error: `Rule ${i + 1}: mode must be "contains" or "regex"` };
    const trimmed = pattern.trim();
    if (enabled && trimmed.length === 0) return { ok: false, error: `Rule ${i + 1}: pattern cannot be empty when enabled` };
    if (trimmed.length > MAX_DUBBED_PATTERN_LENGTH) {
      return { ok: false, error: `Rule ${i + 1}: pattern exceeds ${MAX_DUBBED_PATTERN_LENGTH} characters` };
    }
    rules.push({ pattern: trimmed, mode, enabled });
  }
  return { ok: true, rules };
}

export function compileDubbedRulesToCache(rules: DubbedRuleDto[]): { ok: true } | { ok: false; error: string } {
  const next: CompiledUserRule[] = [];
  for (let i = 0; i < rules.length; i++) {
    const r = rules[i];
    if (r.enabled === false) continue;
    const p = r.pattern.trim();
    if (!p) continue;
    if (r.mode === "contains") {
      next.push({ kind: "contains", needle: normalizePathForDubbedMatch(p) });
      continue;
    }
    try {
      next.push({ kind: "regex", re: new RegExp(p, "i") });
    } catch {
      return { ok: false, error: `Rule ${i + 1}: invalid regular expression` };
    }
  }
  userCompiledRules = next;
  return { ok: true };
}

/** Load settings row from DB and refresh in-memory user dubbed rules. Safe if row missing (uses []). */
export async function refreshUserDubbedRules(prisma: PrismaClient): Promise<void> {
  const row = await prisma.librarySettings.findUnique({
    where: { id: LIBRARY_SETTINGS_ROW_ID },
    select: { dubbedRules: true },
  });
  const raw = row?.dubbedRules ?? [];
  const validated = validateAndNormalizeDubbedRules(raw);
  if (!validated.ok) {
    userCompiledRules = [];
    return;
  }
  const compiled = compileDubbedRulesToCache(validated.rules);
  if (!compiled.ok) userCompiledRules = [];
}

export function matchesUserDubbedRules(normPath: string): boolean {
  for (const rule of userCompiledRules) {
    if (rule.kind === "contains") {
      if (normPath.includes(rule.needle)) return true;
    } else if (rule.re.test(normPath)) {
      return true;
    }
  }
  return false;
}

export function isDubbedFromPath(filePath: string): boolean {
  if (!filePath) return false;
  const norm = normalizePathForDubbedMatch(filePath);
  if (BUILTIN_DUBBED_REGEXES.some((re) => re.test(norm))) return true;
  return matchesUserDubbedRules(norm);
}

export function isVideoFile(name: string): boolean {
  const lower = name.toLowerCase();
  for (const ext of VIDEO_EXTS) {
    if (lower.endsWith(ext)) return true;
  }
  return false;
}

export function findDisplayNameFromFileName(fileName: string): string | null {
  if (!isVideoFile(fileName)) return null;
  const nameOnly = fileName.replace(/.*[/\\]/, "");
  const cut = findCutIndex(nameOnly);
  const temp1 = nameOnly.substring(0, cut);
  let temp = "";
  for (let i = 0; i < temp1.length; i++) {
    if (i === temp1.length - 1) break;
    const c = temp1[i];
    if (c === "." || c === "-" || c === "_" || c === ")" || c === "(" || c === "*") {
      temp += " ";
    } else {
      temp += c;
    }
  }
  return temp.trim() || nameOnly;
}

export type ParsedVideoMovie = { kind: "movie"; displayName: string; year: string; dubbed: boolean };
export type ParsedVideoEpisode = {
  kind: "episode";
  seriesTitle: string;
  year: string;
  season: number;
  episode: number;
  episodeTitle: string | null;
  displayNameForRow: string;
  dubbed: boolean;
};
export type ParsedVideoFile = ParsedVideoMovie | ParsedVideoEpisode;

function normalizeDotsUnderscores(s: string): string {
  return s
    .replace(/[._*]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTrailingYear(title: string, year: string): string {
  if (!year || !/^\d{4}$/.test(year)) return title;
  const re = new RegExp(`[\\s.(\\[]${year}[\\s.)\\]]*$`, "i");
  return title.replace(re, "").trim();
}

/** Stable key for TvSeries upsert: normalized title only (year omitted).
 * Different folders/releases often infer different years per file; including year split one show into several rows. */
export function normalizeSeriesKey(seriesTitle: string, _year: string): string {
  const t = normalizeDotsUnderscores(seriesTitle)
    .toLowerCase()
    .replace(/[^\w\s\-'.]/g, "")
    .slice(0, 240);
  return t;
}

/** Group standalone movies that likely refer to the same title (year distinguishes remakes). */
export function normalizeMovieDuplicateKey(name: string, year: string | null | undefined): string {
  const y = (year ?? "").trim();
  const t = normalizeDotsUnderscores(name)
    .toLowerCase()
    .replace(/[^\w\s\-'.]/g, "")
    .slice(0, 240);
  return `${t}||${y}`;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Try common TV release patterns (episode detection runs before movie title parsing). */
const EPISODE_PATTERNS: RegExp[] = [
  /\b[Ss](\d{1,2})[Ee](\d{1,4})\b/,
  /\.[Ss](\d{1,2})[Ee](\d{1,4})\./,
  /\b(\d{1,2})[xX](\d{1,4})\b/,
  /[Ss]eason\s*0*(\d{1,2})\s*[\s._-]*[Ee]p(?:isode)?\s*0*(\d{1,4})\b/i,
];

export function parseVideoFile(filePath: string): ParsedVideoFile | null {
  if (!isVideoFile(filePath)) return null;
  const nameOnly = filePath.replace(/.*[/\\]/, "");
  const base = nameOnly.replace(/\.[^.]+$/i, "");
  const dubbed = isDubbedFromPath(filePath);

  for (const re of EPISODE_PATTERNS) {
    const m = base.match(re);
    if (!m) continue;
    const season = parseInt(m[1], 10);
    const episode = parseInt(m[2], 10);
    if (season < 0 || season > 99 || episode < 0 || episode > 9999) continue;

    const idx = m.index ?? 0;
    let before = base.slice(0, idx).trim();
    let after = base.slice(idx + m[0].length).trim();
    after = after.replace(/^[\s.\-_–—]+/, "").trim();

    let episodeTitle: string | null = null;
    if (after.length > 1) {
      const cleaned = normalizeDotsUnderscores(after);
      episodeTitle = cleaned || null;
    }

    let seriesRaw = before.replace(/[\s.\-_]+$/g, "").trim().replace(/^[\s.\-_]+/, "").trim();
    let seriesTitle = normalizeDotsUnderscores(seriesRaw);
    if (!seriesTitle) seriesTitle = "Unknown Series";

    let year = getYearFromName(nameOnly) || getYearFromName(seriesTitle);
    seriesTitle = stripTrailingYear(seriesTitle, year).trim();

    const displayNameForRow = `${seriesTitle} S${pad2(season)}E${pad2(episode)}${episodeTitle ? ` — ${episodeTitle}` : ""}`;

    return {
      kind: "episode",
      seriesTitle,
      year,
      season,
      episode,
      episodeTitle,
      displayNameForRow,
      dubbed,
    };
  }

  const displayName = findDisplayNameFromFileName(filePath);
  if (!displayName) return null;
  const year = getYearFromName(nameOnly);
  return { kind: "movie", displayName, year, dubbed };
}
