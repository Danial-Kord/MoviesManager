import { OLLAMA_MODEL, OLLAMA_TITLE_PARSE, OLLAMA_URL } from "./config.js";
import type { ParsedVideoFile } from "./parseFilename.js";

/**
 * Ask local Ollama for canonical movie title + year from a messy filename stem (slow; opt-in via OLLAMA_TITLE_PARSE).
 */
export async function extractCanonicalMovieTitleViaOllama(filenameStem: string): Promise<{ title: string; year: string } | null> {
  if (!OLLAMA_TITLE_PARSE) return null;
  const stem = filenameStem.trim();
  if (!stem || stem.length > 500) return null;

  const base = OLLAMA_URL.replace(/\/$/, "");
  const prompt =
    `You normalize video filenames into a clean movie title and release year.\n` +
    `Rules:\n` +
    `- Output ONLY one JSON object, no markdown: {"title":"...","year":"YYYY"}\n` +
    `- Use empty string for year if unknown or not in the filename.\n` +
    `- Title: human display name only — no quality tags (720p, BR-Rip), no site names, no brackets.\n` +
    `- Keep subtitle parts when clearly part of the title (e.g. "Mini Movie - Puppy").\n` +
    `- Prefer Latin script as in the filename unless clearly non-Latin.\n\n` +
    `Filename (no extension):\n${JSON.stringify(stem)}`;

  try {
    const res = await fetch(`${base}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.05 },
      }),
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { response?: string };
    const raw = data.response?.trim();
    if (!raw) return null;
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const j = JSON.parse(jsonMatch[0]) as { title?: unknown; year?: unknown };
    const title = typeof j.title === "string" ? j.title.trim() : "";
    if (!title) return null;
    let year = typeof j.year === "string" ? j.year.trim() : "";
    if (year && !/^\d{4}$/.test(year)) year = "";
    const yNum = year ? parseInt(year, 10) : NaN;
    if (year && (yNum < 1900 || yNum > 2099)) year = "";
    return { title, year };
  } catch {
    return null;
  }
}

export async function maybeRefineParsedMovieFromFilename(
  filePath: string,
  parsed: ParsedVideoFile
): Promise<ParsedVideoFile> {
  if (parsed.kind !== "movie") return parsed;
  if (!OLLAMA_TITLE_PARSE) return parsed;

  const nameOnly = filePath.replace(/.*[/\\]/, "");
  const stem = nameOnly.replace(/\.[^.]+$/i, "");
  const refined = await extractCanonicalMovieTitleViaOllama(stem);
  if (!refined) return parsed;

  return {
    ...parsed,
    displayName: refined.title,
    year: refined.year || parsed.year,
  };
}
