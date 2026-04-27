import Link from "next/link";
import { notFound } from "next/navigation";
import { StreamPlayer } from "@/components/StreamPlayer";

async function checkMovie(id: string) {
  const { INTERNAL_API } = await import("@/lib/server-api");
  const r = await fetch(`${INTERNAL_API}/api/movies/${id}`, { cache: "no-store" });
  if (r.status === 404) return null;
  if (!r.ok) return null;
  return (await r.json()) as { name: string };
}

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = await checkMovie(id);
  if (!m) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-3 flex items-center justify-between">
        <Link href={"/movie/" + id} className="text-sm text-gray-400 hover:text-white">
          ← {m.name}
        </Link>
      </div>
      <div className="overflow-hidden rounded-lg border border-white/10 bg-black">
        <StreamPlayer id={id} name={m.name} />
      </div>
    </div>
  );
}
