"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Database,
  FileText,
  Globe,
  Layers,
  Link2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT, useChatStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import {
  AdminAuthError,
  AdminStats,
  getStats,
} from "@/lib/admin-api";

/**
 * Admin dashboard. 4 istatistik kartı + URL yönetim sayfasına hızlı link.
 */
export default function AdminDashboardPage() {
  const t = useT();
  const router = useRouter();
  const setAdminToken = useChatStore((s) => s.setAdminToken);
  const toast = useToast();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStats();
      setStats(data);
    } catch (err) {
      if (err instanceof AdminAuthError) {
        // Token expired/invalid → logout
        setAdminToken(null);
        router.replace("/admin/login");
        return;
      }
      toast.show({
        variant: "error",
        title: t.adminToastFailed,
        description: err instanceof Error ? err.message : "",
      });
    } finally {
      setLoading(false);
    }
  }, [router, setAdminToken, t, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const cards = [
    {
      label: t.adminStatsTotalChunks,
      value: stats?.total_chunks ?? 0,
      icon: Layers,
      color: "from-primary to-secondary",
      href: null,
    },
    {
      label: t.adminStatsTotalUrls,
      value: stats?.total_urls ?? 0,
      icon: Database,
      color: "from-emerald-500 to-teal-600",
      href: "/admin/urls",
    },
    {
      label: t.adminStatsWebUrls,
      value: stats?.web_urls ?? 0,
      icon: Globe,
      color: "from-blue-500 to-indigo-600",
      href: "/admin/urls?type=web",
    },
    {
      label: t.adminStatsPdfUrls,
      value: stats?.pdf_urls ?? 0,
      icon: FileText,
      color: "from-orange-500 to-red-600",
      href: "/admin/urls?type=pdf",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Başlık + yenile butonu */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {t.adminNavDashboard}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Qdrant vektör veritabanınızın anlık durumu.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={load}
          disabled={loading}
          className="gap-1.5"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          {t.adminStatsRefresh}
        </Button>
      </div>

      {/* 4'lü kart grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const cardContent = (
            <>
              <div
                className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${card.color} text-white shadow-sm`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {card.label}
              </p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">
                {loading ? (
                  <span className="inline-block h-8 w-20 animate-pulse rounded bg-muted" />
                ) : (
                  card.value.toLocaleString()
                )}
              </p>
            </>
          );

          return card.href ? (
            <Link
              key={card.label}
              href={card.href}
              className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              {cardContent}
              <p className="mt-2 text-[11px] font-medium text-muted-foreground transition-colors group-hover:text-primary">
                →
              </p>
            </Link>
          ) : (
            <div
              key={card.label}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              {cardContent}
            </div>
          );
        })}
      </div>

      {/* Hızlı link: URL yönetim sayfasına */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Link2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {t.adminUrlListTitle}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.adminUrlListDescription}
              </p>
            </div>
          </div>
          <Link
            href="/admin/urls"
            className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-80"
          >
            {t.adminNavUrls}
          </Link>
        </div>
      </div>
    </div>
  );
}
