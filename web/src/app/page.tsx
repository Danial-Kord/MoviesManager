import { Suspense } from "react";
import { HomeClient } from "@/components/HomeClient";

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] animate-pulse bg-imdb-canvas" aria-hidden />}>
      <HomeClient />
    </Suspense>
  );
}
