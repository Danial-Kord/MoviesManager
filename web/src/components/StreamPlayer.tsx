"use client";

import { useRef } from "react";
import { streamUrlForMovieId } from "@/lib/api";

export function StreamPlayer({ id, name }: { id: string; name: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  return (
    <video
      ref={ref}
      src={streamUrlForMovieId(id)}
      className="aspect-video w-full max-h-[80vh] bg-black"
      controls
      controlsList="nodownload"
      playsInline
      onError={() => {
        console.error("Playback may require a supported codec. Path is read from the local file.");
      }}
    >
      {name} — your browser will stream via the local API.
    </video>
  );
}
