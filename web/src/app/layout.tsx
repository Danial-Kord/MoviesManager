import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Movie Manager",
  description: "Local movie library — Netflix + IMDb style",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0d0d0d]/90 backdrop-blur">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="text-xl font-bold tracking-tight">
              <span className="text-[#E50914]">M</span>
              <span>ovie</span>
              <span className="ml-0.5 text-[#F5C518]">Manager</span>
            </Link>
            <nav className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <Link href="/settings" className="hover:text-white">
                Settings
              </Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="mt-20 border-t border-white/5 py-8 text-center text-xs text-gray-500">
          Local API — for use on 127.0.0.1 only
        </footer>
      </body>
    </html>
  );
}
