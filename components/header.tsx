"use client";

import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { NewChatButton } from "./chat/new-chat-button";
import { useChatStore, useT } from "@/lib/store";

/**
 * Üst header.
 * Logo + isim solda, language/theme toggle + new chat butonu sağda.
 */
export function Header() {
  const t = useT();
  const adminToken = useChatStore((s) => s.adminToken);
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
          {adminToken && (
            <Link
              href="/admin"
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
              title={t.adminTitle}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.adminTitle}</span>
            </Link>
          )}
          <NewChatButton />
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
