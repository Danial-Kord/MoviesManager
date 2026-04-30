"use client";

import { IconHeart } from "@/components/icons";
import { useLocale } from "@/lib/i18n/context";
import { patchMovie } from "@/lib/api";
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
  const { t } = useLocale();
  const [fav, setFav] = useState(isFavorite);
  const [vis, setVis] = useState(show);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function patch(body: { isFavorite?: boolean; show?: boolean }) {
    setBusy(true);
    try {
      await patchMovie(id, body);
      if (body.isFavorite != null) setFav(body.isFavorite);
      if (body.show != null) setVis(body.show);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => patch({ isFavorite: !fav })}
        aria-label={fav ? t("favRemove") : t("favAdd")}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-imdb bg-imdb-panel text-imdb-text transition hover:bg-imdb-border/90 disabled:opacity-50"
      >
        <IconHeart size={20} filled={fav} className={fav ? "text-imdb-gold" : undefined} />
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => patch({ show: !vis })}
        className="rounded-imdb border border-imdb-border bg-transparent px-[14px] py-[6px] text-[12px] font-semibold text-imdb-text transition hover:bg-imdb-hover"
      >
        {vis ? t("hideBlacklist") : t("unhide")}
      </button>
    </>
  );
}
