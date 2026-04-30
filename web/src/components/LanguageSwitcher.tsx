"use client";

import { useRouter } from "next/navigation";
import type { AppLocale } from "@/lib/i18n/messages";
import { useLocale } from "@/lib/i18n/context";

const COOKIE = "movies_locale";
const MAX_AGE = 60 * 60 * 24 * 365;

export function LanguageSwitcher() {
  const router = useRouter();
  const { locale, t } = useLocale();

  function setLang(next: AppLocale) {
    document.cookie = `${COOKIE}=${next};path=/;max-age=${MAX_AGE};SameSite=Lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1.5">
      <label htmlFor="lang-switch" className="sr-only">
        {t("language")}
      </label>
      <select
        id="lang-switch"
        value={locale}
        onChange={(e) => setLang(e.target.value as AppLocale)}
        className="max-w-[9rem] cursor-pointer rounded-imdb border border-imdb-border bg-imdb-elevated py-2 pl-2 pr-7 text-[13px] font-medium text-imdb-text outline-none focus:border-imdb-focus focus:ring-2 focus:ring-imdb-focus/25"
        aria-label={t("language")}
      >
        <option value="en">English</option>
        <option value="fa">فارسی</option>
      </select>
    </div>
  );
}
