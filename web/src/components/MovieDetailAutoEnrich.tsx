"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { enrichMovieById } from "@/lib/api";

/** When opening a movie/episode that is not fully enriched, try TMDb once and refresh on success. */
export function MovieDetailAutoEnrich({
  movieId,
  needsRename,
  enrichmentState,
}: {
  movieId: string;
  needsRename: boolean;
  enrichmentState: string;
}) {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    if (needsRename) return;
    if (enrichmentState !== "none" && enrichmentState !== "partial") return;
    ran.current = true;
    void enrichMovieById(movieId).then((ok) => {
      if (ok) router.refresh();
    });
  }, [movieId, needsRename, enrichmentState, router]);

  return null;
}
