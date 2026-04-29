"use client";

import { IconPlay } from "@/components/icons";
import { playLocal } from "@/lib/api";

const base =
  "inline-flex items-center justify-center gap-2 rounded-imdb bg-imdb-gold px-[14px] py-[6px] text-[12px] font-semibold text-black transition hover:brightness-95";

export function PlayLocalButton({
  movieId,
  children,
  className,
}: {
  movieId: string | number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button type="button" className={className ? `${base} ${className}` : base} onClick={() => void playLocal(String(movieId))}>
      <IconPlay size={18} />
      {children}
    </button>
  );
}
