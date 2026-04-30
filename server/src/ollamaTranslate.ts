import { OLLAMA_MODEL, OLLAMA_URL } from "./config.js";

/**
 * Translate plot/overview text to Persian using a local Ollama model.
 * Requires Ollama running (`ollama serve`) with the configured model pulled.
 */
export async function translateOverviewToPersianViaOllama(text: string): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const base = OLLAMA_URL.replace(/\/$/, "");
  const prompt =
    `Translate the following movie or TV plot overview into fluent Persian (Farsi).\n` +
    `Rules: keep person and place names in their usual Latin spelling when common; do not add a title or preamble; output only the Persian text.\n\n` +
    trimmed;

  try {
    const res = await fetch(`${base}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.2 },
      }),
      signal: AbortSignal.timeout(180_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { response?: string };
    const out = data.response?.trim();
    return out && out.length > 0 ? out : null;
  } catch {
    return null;
  }
}
