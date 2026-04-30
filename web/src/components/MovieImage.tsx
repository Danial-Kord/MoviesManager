"use client";

import { useState } from "react";
import { posterUrlForMovieId, posterUrlForSeriesId } from "@/lib/api";

/** Episodes use the parent series poster so the show has one artwork, not one image per file/season. */
export function MovieImage({
  id,
  name,
  seriesId,
}: {
  id: string;
  name: string;
  /** When set, poster comes from the TV series (shared across seasons/episodes). */
  seriesId?: string | null;
}) {
  const [ok, setOk] = useState(true);
  const posterSrc = seriesId ? posterUrlForSeriesId(seriesId) : posterUrlForMovieId(id);

  if (!ok) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-imdb-rail p-4 text-center text-[14px] text-imdb-muted">
        {name}
      </div>
    );
  }
  return (
    <img
      src={posterSrc}
      alt={name}
      className="h-full w-full object-cover"
      onError={() => setOk(false)}
    />
  );
}
