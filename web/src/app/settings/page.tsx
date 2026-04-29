import { SettingsClient } from "@/components/SettingsClient";

export default function SettingsPage() {
  return (
    <div className="min-h-[70vh] bg-imdb-canvas px-4 py-8 font-imdb md:px-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-[1.75rem] font-bold tracking-tight text-imdb-text" style={{ letterSpacing: "-1.2px" }}>
          Settings
        </h1>
        <SettingsClient />
      </div>
    </div>
  );
}
