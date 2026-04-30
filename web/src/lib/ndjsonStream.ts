/**
 * Reads newline-delimited JSON from a fetch Response body.
 * Throws if HTTP status is not OK (reads body as text for the error message).
 */
export async function readNdjsonResponse(
  response: Response,
  onLine: (obj: Record<string, unknown>) => void
): Promise<void> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      onLine(JSON.parse(trimmed) as Record<string, unknown>);
    }
  }
  const tail = buffer.trim();
  if (tail) {
    onLine(JSON.parse(tail) as Record<string, unknown>);
  }
}
