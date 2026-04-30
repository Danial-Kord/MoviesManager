/** Drop lossless TMDb snapshots from API payloads where responses must stay small (lists, grids). */
export function omitTmdbFetchSnapshots<T extends Record<string, unknown>>(
  row: T
): Omit<T, "tmdbSearchJson" | "tmdbDetailsJson" | "tmdbCreditsJson" | "posterBytes"> {
  const {
    tmdbSearchJson: _s,
    tmdbDetailsJson: _d,
    tmdbCreditsJson: _c,
    posterBytes: _pb,
    ...rest
  } = row;
  return rest as Omit<T, "tmdbSearchJson" | "tmdbDetailsJson" | "tmdbCreditsJson" | "posterBytes">;
}

/** Movie payloads that `include: { series: true }` must not leak nested `posterBytes`. */
export function stripMovieRowForApi(row: Record<string, unknown>): Record<string, unknown> {
  const lite = omitTmdbFetchSnapshots(row);
  const ser = lite.series;
  if (ser && typeof ser === "object" && ser !== null && !Array.isArray(ser)) {
    const { posterBytes: _b, ...srest } = ser as Record<string, unknown>;
    return { ...lite, series: srest };
  }
  return lite;
}
