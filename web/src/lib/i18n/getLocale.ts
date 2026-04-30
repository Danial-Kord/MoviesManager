import { cookies } from "next/headers";
import type { AppLocale } from "./messages";

export async function getLocale(): Promise<AppLocale> {
  const jar = await cookies();
  return jar.get("movies_locale")?.value === "fa" ? "fa" : "en";
}
