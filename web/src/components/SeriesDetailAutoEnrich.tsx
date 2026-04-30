"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { enrichSeriesById } from "@/lib/api";

export function SeriesDetailAutoEnrich({
  seriesId,
  needsRename,
  enrichmentState,
}: {
  seriesId: string;
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
    void enrichSeriesById(seriesId).then((ok) => {
      if (ok) router.refresh();
    });
  }, [seriesId, needsRename, enrichmentState, router]);

  return null;
}
