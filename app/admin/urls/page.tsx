"use client";

import {
  FormEvent,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Globe,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore, useT } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import {
  AdminAuthError,
  AdminUrlItem,
  addUrl,
  deleteUrl,
  listUrls,
  reingestUrl,
} from "@/lib/admin-api";
import { DeleteUrlDialog } from "@/components/admin/delete-url-dialog";
import { Pagination } from "@/components/admin/pagination";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;

type TypeFilter = "all" | "web" | "pdf";

function parseTypeFilter(v: string | null): TypeFilter {
  return v === "web" || v === "pdf" ? v : "all";
}

/**
 * URL yönetim sayfası (paginated).
 *
 * Veri akışı:
 *  - URL'deki query params (page, type, q) tek source of truth
 *  - Kullanıcı sayfa/filtre değiştirdiğinde router.replace ile URL güncellenir
 *  - useEffect query params değişince backend'ten tek sayfa veri çeker
 *  - Bu sayede geri/ileri butonları, linkler, sayfa yenileme hepsi tutarlı
 *
 * Backend sadece aktif sayfayı döner (10 URL), 1000+ URL olsa bile hızlı.
 */
function AdminUrlsPageInner() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAdminToken = useChatStore((s) => s.setAdminToken);
  const toast = useToast();

  // URL'den okunan state
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const typeFilter = parseTypeFilter(searchParams.get("type"));
  const searchQuery = searchParams.get("q") ?? "";

  // Local search input (debounced)
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Yüklenmiş sayfa verisi
  const [items, setItems] = useState<AdminUrlItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Yeni URL ekleme state'i
  const [newUrl, setNewUrl] = useState("");
  const [addingUrl, setAddingUrl] = useState(false);

  // Per-row aksiyon state'i
  const [reingestingUrl, setReingestingUrl] = useState<string | null>(null);

  // Silme dialog
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ---------- URL state yardımcıları ----------

  const updateUrl = useCallback(
    (patch: { page?: number; type?: TypeFilter; q?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (patch.page !== undefined) {
        if (patch.page <= 1) params.delete("page");
        else params.set("page", String(patch.page));
      }
      if (patch.type !== undefined) {
        if (patch.type === "all") params.delete("type");
        else params.set("type", patch.type);
      }
      if (patch.q !== undefined) {
        if (!patch.q) params.delete("q");
        else params.set("q", patch.q);
      }
      const qs = params.toString();
      router.replace(qs ? `/admin/urls?${qs}` : "/admin/urls");
    },
    [router, searchParams],
  );

  // Auth hatası → logout + redirect
  const handleAuthError = useCallback(() => {
    setAdminToken(null);
    router.replace("/admin/login");
  }, [router, setAdminToken]);

  // ---------- Veri çekme ----------

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listUrls({
        offset: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
        type: typeFilter === "all" ? null : typeFilter,
        search: searchQuery || undefined,
      });
      setItems(data.urls);
      setTotal(data.total);

      // Aktif sayfa artık var olmayan sayfada ise (silme sonrası)
      // son geçerli sayfaya atla
      const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
      if (page > totalPages) {
        updateUrl({ page: totalPages });
      }
    } catch (err) {
      if (err instanceof AdminAuthError) {
        handleAuthError();
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
  }, [
    page,
    typeFilter,
    searchQuery,
    handleAuthError,
    t,
    toast,
    updateUrl,
  ]);

  useEffect(() => {
    load();
  }, [load]);

  // Search input değişince debounce ile URL'i güncelle
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    // Input tam searchQuery ile eşitse bir şey yapma (URL'den geldi)
    if (searchInput === searchQuery) return;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      updateUrl({ q: searchInput, page: 1 });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchInput, searchQuery, updateUrl]);

  // URL'den gelen search değiştiyse input'u sync et (browser back/forward)
  useEffect(() => {
    setSearchInput(searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total],
  );

  // ---------- Handlers ----------

  const handleAddUrl = async (e: FormEvent) => {
    e.preventDefault();
    const url = newUrl.trim();
    if (!url || addingUrl) return;

    setAddingUrl(true);
    try {
      const result = await addUrl(url);
      const titleMap = {
        inserted: t.adminToastInserted,
        updated: t.adminToastUpdated,
        skipped: t.adminToastSkipped,
        failed: t.adminToastFailed,
      };
      const variant =
        result.status === "failed"
          ? "error"
          : result.status === "skipped"
            ? "info"
            : "success";
      toast.show({
        variant,
        title: titleMap[result.status],
        description: result.message,
      });
      if (result.status !== "failed") {
        setNewUrl("");
        await load();
      }
    } catch (err) {
      if (err instanceof AdminAuthError) {
        handleAuthError();
        return;
      }
      toast.show({
        variant: "error",
        title: t.adminToastFailed,
        description: err instanceof Error ? err.message : "",
      });
    } finally {
      setAddingUrl(false);
    }
  };

  const handleReingest = async (url: string) => {
    if (reingestingUrl) return;
    setReingestingUrl(url);
    try {
      const result = await reingestUrl(url);
      const variant =
        result.status === "failed"
          ? "error"
          : result.status === "skipped"
            ? "info"
            : "success";
      toast.show({
        variant,
        title:
          result.status === "updated"
            ? t.adminToastUpdated
            : t.adminToastInserted,
        description: result.message,
      });
      await load();
    } catch (err) {
      if (err instanceof AdminAuthError) {
        handleAuthError();
        return;
      }
      toast.show({
        variant: "error",
        title: t.adminToastFailed,
        description: err instanceof Error ? err.message : "",
      });
    } finally {
      setReingestingUrl(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      const result = await deleteUrl(deleteTarget);
      toast.show({
        variant: "success",
        title: t.adminToastDeleted,
        description: `${result.deleted} chunk silindi.`,
      });
      setDeleteTarget(null);
      await load();
    } catch (err) {
      if (err instanceof AdminAuthError) {
        handleAuthError();
        return;
      }
      toast.show({
        variant: "error",
        title: t.adminToastFailed,
        description: err instanceof Error ? err.message : "",
      });
    } finally {
      setDeleting(false);
    }
  };

  // ---------- Render ----------

  const typeTabs: { value: TypeFilter; label: string; icon: typeof Layers }[] = [
    { value: "all", label: "All", icon: Layers },
    { value: "web", label: "Web", icon: Globe },
    { value: "pdf", label: "PDF", icon: FileText },
  ];

  const titleForType =
    typeFilter === "pdf"
      ? t.adminStatsPdfUrls
      : typeFilter === "web"
        ? t.adminStatsWebUrls
        : t.adminUrlListTitle;

  return (
    <div className="space-y-6">
      {/* Üst: başlık + açıklama + yenile */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {titleForType}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {t.adminUrlListDescription}
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

      {/* Yeni URL ekle kutusu */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Plus className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {t.adminAddUrlTitle}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t.adminAddUrlDescription}
            </p>
          </div>
        </div>
        <form onSubmit={handleAddUrl} className="flex flex-col gap-2 sm:flex-row">
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder={t.adminAddUrlPlaceholder}
            disabled={addingUrl}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
          <Button
            type="submit"
            size="lg"
            disabled={!newUrl.trim() || addingUrl}
            className="gap-1.5"
          >
            {addingUrl ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.adminAddUrlProcessing}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                {t.adminAddUrlButton}
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Type filter sekmeleri */}
      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-sm">
        {typeTabs.map((tab) => {
          const Icon = tab.icon;
          const active = typeFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => updateUrl({ type: tab.value, page: 1 })}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Arama kutusu */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={t.adminUrlSearchPlaceholder}
          className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* URL listesi */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {loading && items.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {total === 0 && !searchQuery ? t.adminUrlEmpty : t.adminUrlNoMatch}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Başlık satırı */}
            <div className="hidden bg-muted/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground md:grid md:grid-cols-[1fr_auto_auto_auto] md:gap-4">
              <div>{t.adminUrlTableUrl}</div>
              <div className="w-16 text-center">{t.adminUrlTableType}</div>
              <div className="w-16 text-right">{t.adminUrlTableChunks}</div>
              <div className="w-48 text-right">{t.adminUrlTableActions}</div>
            </div>

            {items.map((item) => {
              const isPdf = item.doc_type === "pdf";
              const isBusy = reingestingUrl === item.url;
              return (
                <div
                  key={item.url}
                  className={cn(
                    "px-4 py-3 transition-colors hover:bg-muted/20 md:grid md:grid-cols-[1fr_auto_auto_auto] md:items-center md:gap-4",
                    loading && "opacity-50",
                  )}
                >
                  {/* URL + title */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <div
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded",
                          isPdf
                            ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                        )}
                      >
                        {isPdf ? (
                          <FileText className="h-3 w-3" />
                        ) : (
                          <Globe className="h-3 w-3" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        {item.title && (
                          <p className="truncate text-sm font-medium text-foreground">
                            {item.title}
                          </p>
                        )}
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block truncate text-xs text-muted-foreground hover:text-primary hover:underline"
                          title={item.url}
                        >
                          {item.url}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Mobilde chunk/tip bilgisi */}
                  <div className="mt-2 flex items-center gap-2 md:hidden">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                        isPdf
                          ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                      )}
                    >
                      {isPdf ? "PDF" : "WEB"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.chunk_count} chunk
                    </span>
                  </div>

                  {/* Desktop: Tip */}
                  <div className="hidden w-16 text-center md:block">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                        isPdf
                          ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                      )}
                    >
                      {isPdf ? "PDF" : "WEB"}
                    </span>
                  </div>

                  {/* Desktop: Chunk sayısı */}
                  <div className="hidden w-16 text-right font-mono text-sm tabular-nums text-foreground md:block">
                    {item.chunk_count}
                  </div>

                  {/* Aksiyon butonları */}
                  <div className="mt-2 flex items-center justify-end gap-1.5 md:mt-0 md:w-48">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleReingest(item.url)}
                      disabled={isBusy || addingUrl}
                      title={t.adminReingestButton}
                    >
                      {isBusy ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                      <span className="hidden sm:inline">
                        {isBusy
                          ? t.adminReingestProcessing
                          : t.adminReingestButton}
                      </span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="xs"
                      onClick={() => setDeleteTarget(item.url)}
                      disabled={isBusy}
                      title={t.adminDeleteButton}
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="hidden sm:inline">
                        {t.adminDeleteButton}
                      </span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination + info */}
      {total > 0 && (
        <div className="flex flex-col items-center gap-2">
          <Pagination
            page={page}
            totalPages={totalPages}
            disabled={loading}
            onPageChange={(p) => updateUrl({ page: p })}
          />
          <p className="text-xs text-muted-foreground tabular-nums">
            {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, total)} / {total}
          </p>
        </div>
      )}

      {/* Silme dialog */}
      <DeleteUrlDialog
        open={deleteTarget !== null}
        url={deleteTarget}
        loading={deleting}
        onCancel={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

/**
 * useSearchParams() Suspense boundary gerektirir (Next.js 15+).
 */
export default function AdminUrlsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AdminUrlsPageInner />
    </Suspense>
  );
}
