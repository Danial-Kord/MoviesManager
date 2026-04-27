"use client";

import { useState } from "react";
import { posterUrlForMovieId } from "@/lib/api";

export function MovieImage({ id, name }: { id: string; name: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 p-4 text-center text-sm text-gray-500">
        {name}
      </div>
    );
  }
  return (
    <img
      src={posterUrlForMovieId(id)}
      alt={name}
      className="h-full w-full object-cover"
      onError={() => setOk(false)}
    />
  );
}
