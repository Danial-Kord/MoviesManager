import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Movie Manager",
  description: "Local movie library — dark IMDb-inspired catalog for your files",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-imdb">
        <Suspense fallback={<header className="h-[57px] border-b border-imdb-border bg-imdb-surface" />}>
          <SiteHeader />
        </Suspense>
        {children}
        <footer className="mt-16 border-t border-imdb-border/60 bg-imdb-footer py-10 text-center">
          <p className="text-[12px] text-imdb-subtle">Local API — for use on 127.0.0.1 only</p>
        </footer>
      </body>
    </html>
  );
}
