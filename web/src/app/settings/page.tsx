import { SettingsClient } from "@/components/SettingsClient";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      <SettingsClient />
    </div>
  );
}
