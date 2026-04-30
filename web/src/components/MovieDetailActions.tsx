"use client";

import { IconHeart, IconSparkles } from "@/components/icons";
import { useLocale } from "@/lib/i18n/context";
import { patchMovie, postMovieEnrich } from "@/lib/api";
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
  const [enrichBusy, setEnrichBusy] = useState(false);
  const [enrichErr, setEnrichErr] = useState<string | null>(null);
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

  async function runEnrich() {
    setEnrichErr(null);
    setEnrichBusy(true);
    try {
      await postMovieEnrich(id);
      router.refresh();
    } catch (e) {
      setEnrichErr((e as Error).message);
    } finally {
      setEnrichBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={enrichBusy}
          title={t("movieDetailEnrichTitle")}
          onClick={() => void runEnrich()}
          className="inline-flex items-center gap-2 rounded-imdb border border-imdb-border bg-transparent px-[14px] py-[6px] text-[12px] font-semibold text-imdb-text transition hover:bg-imdb-hover disabled:opacity-50"
        >
          <IconSparkles size={16} />
          {t("movieDetailEnrichRefresh")}
        </button>
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
      </div>
      {enrichErr ? <p className="max-w-xl text-[12px] text-imdb-error">{enrichErr}</p> : null}
    </div>
  );
}
