"use client";

import type { ReactNode } from "react";
import { playLocal } from "@/lib/api";

export function PlayLocalButton({
  movieId,
  className,
  children,
}: {
  movieId: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        void playLocal(movieId).catch((e) => {
          window.alert((e as Error).message || "Could not open file");
        });
      }}
    >
      {children ?? "Play"}
    </button>
  );
}
