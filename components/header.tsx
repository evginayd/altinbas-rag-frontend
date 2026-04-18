"use client";

import { Sparkles } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { NewChatButton } from "./chat/new-chat-button";
import { useT } from "@/lib/store";

/**
 * Üst header.
 * Logo + isim solda, language/theme toggle + new chat butonu sağda.
 */
export function Header() {
  const t = useT();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-foreground">
              {t.appName}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {t.appSubtitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <NewChatButton />
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
