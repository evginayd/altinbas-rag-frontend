"use client";

import { useEffect } from "react";
import { useChatStore } from "@/lib/store";

/**
 * Store'daki dil değişikliğini <html lang="..."> attribute'una senkronize eder.
 * Erişilebilirlik (screen reader) ve SEO için önemli.
 * Görsel hiçbir şey render etmez.
 */
export function HtmlLangSync() {
  const language = useChatStore((s) => s.language);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  return null;
}
