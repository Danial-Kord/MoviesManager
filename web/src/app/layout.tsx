import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { LocaleProvider } from "@/lib/i18n/context";
import { getMessages, type AppLocale } from "@/lib/i18n/messages";
import "./globals.css";

export const metadata: Metadata = {
  title: "Movie Manager",
  description: "Local movie library — dark IMDb-inspired catalog for your files",
};

async function resolveLocale(): Promise<AppLocale> {
  const jar = await cookies();
  return jar.get("movies_locale")?.value === "fa" ? "fa" : "en";
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await resolveLocale();
  const messages = getMessages(locale);

  return (
    <html lang={locale} dir={locale === "fa" ? "rtl" : "ltr"}>
      <body className="font-imdb">
        <LocaleProvider locale={locale} messages={messages}>
          <Suspense fallback={<header className="h-[57px] border-b border-imdb-border bg-imdb-surface" />}>
            <SiteHeader />
          </Suspense>
          {children}
        </LocaleProvider>
        <footer className="mt-16 border-t border-imdb-border/60 bg-imdb-footer py-10 text-center">
          <p className="text-[12px] text-imdb-subtle">{messages.footerNote}</p>
        </footer>
      </body>
    </html>
  );
}
