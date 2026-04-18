"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/lib/store";

/**
 * TR / EN dil değiştirici.
 * Tek buton, içinde aktif olmayan dil yazar (EN veya TR). Tıklayınca toggle.
 * Zustand store'da persist edildiği için sayfa yenilense de korunur.
 */
export function LanguageToggle() {
  const language = useChatStore((s) => s.language);
  const setLanguage = useChatStore((s) => s.setLanguage);

  const toggle = () => setLanguage(language === "tr" ? "en" : "tr");
  const otherLabel = language === "tr" ? "EN" : "TR";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="h-9 gap-1.5 rounded-full px-2.5 text-xs font-semibold"
      aria-label={`Switch to ${otherLabel}`}
      title={`Switch to ${otherLabel}`}
    >
      <Languages className="h-4 w-4" />
      <span>{otherLabel}</span>
    </Button>
  );
}
