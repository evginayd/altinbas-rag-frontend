"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, LayoutDashboard, Link2, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useChatStore, useT } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Admin area için üst navigation.
 * Logo + admin rozeti + nav linkleri + logout + theme/language toggle.
 */
export function AdminNav() {
  const t = useT();
  const pathname = usePathname();
  const router = useRouter();
  const setAdminToken = useChatStore((s) => s.setAdminToken);

  const navItems = [
    { href: "/admin", label: t.adminNavDashboard, icon: LayoutDashboard },
    { href: "/admin/urls", label: t.adminNavUrls, icon: Link2 },
  ];

  const handleLogout = () => {
    setAdminToken(null);
    router.replace("/admin/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        {/* Sol: Logo + admin rozeti */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-sm">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-foreground">
                {t.appName}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                {t.adminTitle}
              </span>
            </div>
          </Link>
        </div>

        {/* Orta: Nav linkleri (desktop) */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sağ: Back to chat + logout + toggles */}
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className="hidden items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t.adminBackToChat}
          </Link>
          <LanguageToggle />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-1.5"
            title={t.adminNavLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t.adminNavLogout}</span>
          </Button>
        </div>
      </div>

      {/* Mobil nav */}
      <nav className="flex items-center gap-1 border-t border-border px-4 py-1.5 md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
