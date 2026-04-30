import Link from "next/link";
import { cookies } from "next/headers";
import { IconChevronLeft, IconSettings } from "@/components/icons";
import { SettingsClient } from "@/components/SettingsClient";
import { getMessages, type AppLocale } from "@/lib/i18n/messages";

export default async function SettingsPage() {
  const jar = await cookies();
  const locale: AppLocale = jar.get("movies_locale")?.value === "fa" ? "fa" : "en";
  const m = getMessages(locale);

  return (
    <div className="min-h-screen bg-imdb-canvas px-4 py-8 font-imdb md:px-10 md:py-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 md:mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[13px] font-medium text-imdb-muted underline-offset-4 hover:text-imdb-text hover:underline"
          >
            <IconChevronLeft size={18} />
            {m.backToLibrary}
          </Link>
          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-imdb-card border border-imdb-border bg-imdb-elevated shadow-md shadow-black/25 ring-1 ring-white/5 md:h-16 md:w-16">
              <IconSettings className="text-imdb-gold" size={30} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-[1.85rem] font-bold tracking-tight text-imdb-text md:text-[2rem]" style={{ letterSpacing: "-1.2px" }}>
                {m.navSettings}
              </h1>
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-imdb-muted">{m.settingsIntroTabs}</p>
            </div>
          </div>
        </header>

        <SettingsClient />
      </div>
    </div>
  );
}
