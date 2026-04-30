/** Drop lossless TMDb snapshots from API payloads where responses must stay small (lists, grids). */
export function omitTmdbFetchSnapshots<T extends Record<string, unknown>>(
  row: T
): Omit<T, "tmdbSearchJson" | "tmdbDetailsJson" | "tmdbCreditsJson"> {
  const {
    tmdbSearchJson: _s,
    tmdbDetailsJson: _d,
    tmdbCreditsJson: _c,
    ...rest
  } = row;
  return rest as Omit<T, "tmdbSearchJson" | "tmdbDetailsJson" | "tmdbCreditsJson">;
}
