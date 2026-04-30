/** Tiny FIFO cache for localized summaries (avoids repeated TMDb / Ollama calls). */
const MAX = 400;
const map = new Map<string, string>();

export function translateCacheGet(key: string): string | undefined {
  const v = map.get(key);
  if (v !== undefined) {
    map.delete(key);
    map.set(key, v);
  }
  return v;
}

export function translateCacheSet(key: string, value: string): void {
  if (map.has(key)) map.delete(key);
  map.set(key, value);
  while (map.size > MAX) {
    const first = map.keys().next().value as string | undefined;
    if (first === undefined) break;
    map.delete(first);
  }
}
