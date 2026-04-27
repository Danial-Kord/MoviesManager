"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MovieDetailActions({
  id,
  isFavorite,
  show,
}: {
  id: string;
  isFavorite: boolean;
  show: boolean;
}) {
  const [fav, setFav] = useState(isFavorite);
  const [vis, setVis] = useState(show);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function patch(body: { isFavorite?: boolean; show?: boolean }) {
    setBusy(true);
    const r = await fetch(`/api/movies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (r.ok) {
      if (body.isFavorite != null) setFav(body.isFavorite);
      if (body.show != null) setVis(body.show);
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => patch({ isFavorite: !fav })}
        className="rounded border border-white/20 bg-transparent px-4 py-2 text-sm text-white hover:bg-white/5"
      >
        {fav ? "Unfavorite" : "Favorite"}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => patch({ show: !vis })}
        className="rounded border border-white/20 bg-transparent px-4 py-2 text-sm text-white hover:bg-white/5"
      >
        {vis ? "Hide (blacklist)" : "Unhide"}
      </button>
    </>
  );
}
