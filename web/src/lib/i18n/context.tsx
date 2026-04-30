"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { AppLocale } from "./messages";
import type { MessageKey } from "./messages";

type Messages = Record<MessageKey, string>;

const LocaleContext = createContext<{ locale: AppLocale; t: (key: MessageKey) => string } | null>(null);

export function LocaleProvider({
  locale,
  messages,
  children,
}: {
  locale: AppLocale;
  messages: Messages;
  children: ReactNode;
}) {
  const t = useMemo(
    () =>
      function t(key: MessageKey): string {
        return messages[key] ?? key;
      },
    [messages]
  );
  return <LocaleContext.Provider value={{ locale, t }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
