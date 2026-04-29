/** Format a numeric score for display (2 decimal places). Returns null if empty. */
export function formatScore(value: string | null | undefined): string | null {
  if (value == null || String(value).trim() === "") return null;
  const n = parseFloat(String(value));
  if (Number.isNaN(n)) return String(value);
  return n.toFixed(2);
}
