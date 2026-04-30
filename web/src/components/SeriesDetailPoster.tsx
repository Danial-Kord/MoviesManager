"use client";

import { useState } from "react";
import { posterUrlForSeriesId } from "@/lib/api";

export function SeriesDetailPoster({ seriesId, title }: { seriesId: string; title: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-imdb-rail p-4 text-center text-[14px] text-imdb-muted">
        {title}
      </div>
    );
  }
  return (
    <img
      src={posterUrlForSeriesId(seriesId)}
      alt={title}
      className="h-full w-full object-cover"
      onError={() => setOk(false)}
    />
  );
}
