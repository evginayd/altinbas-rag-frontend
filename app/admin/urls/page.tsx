"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Globe,
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
import { cn } from "@/lib/utils";

/**
 * URL yönetim sayfası.
 *
 * Özellikler:
 *  - Qdrant'taki tüm URL'leri listele (chunk sayısı, tip ile birlikte)
 *  - Arama: URL veya title içinde case-insensitive filtre
 *  - Yeni URL ekle: inline form, ingest sırasında spinner
 *  - Satır başı aksiyonlar: reingest (force), delete (confirm dialog)
 *  - Toast ile başarı/hata bildirimi
 *  - 401/403 durumunda otomatik logout
 */
export default function AdminUrlsPage() {
  const t = useT();
  const router = useRouter();
  const setAdminToken = useChatStore((s) => s.setAdminToken);
  const toast = useToast();

  const [items, setItems] = useState<AdminUrlItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState("");

  // Yeni URL ekleme state'i
  const [newUrl, setNewUrl] = useState("");
  const [addingUrl, setAddingUrl] = useState(false);

  // Per-row aksiyon state'leri (hangi URL üzerinde işlem sürüyor?)
  const [reingestingUrl, setReingestingUrl] = useState<string | null>(null);

  // Silme dialog state'i
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Auth hatası → logout + redirect
  const handleAuthError = useCallback(() => {
    setAdminToken(null);
    router.replace("/admin/login");
  }, [router, setAdminToken]);

  const load = useCallback(async () => {
    setLoadingList(true);
    try {
      const data = await listUrls();
      setItems(data.urls);
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
      setLoadingList(false);
    }
  }, [handleAuthError, t, toast]);

  useEffect(() => {
    load();
  }, [load]);

  // Filtrelenmiş liste — search her değiştiğinde yeniden hesaplanır
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.url.toLowerCase().includes(q) ||
        it.title.toLowerCase().includes(q),
    );
  }, [items, search]);

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

  return (
    <div className="space-y-6">
      {/* Üst: başlık + açıklama + yenile */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {t.adminUrlListTitle}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {t.adminUrlListDescription}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={load}
          disabled={loadingList}
          className="gap-1.5"
        >
          {loadingList ? (
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

      {/* Arama kutusu */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.adminUrlSearchPlaceholder}
          className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* URL listesi */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {loadingList && items.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {items.length === 0 ? t.adminUrlEmpty : t.adminUrlNoMatch}
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

            {filtered.map((item) => {
              const isPdf = item.doc_type === "pdf";
              const isBusy = reingestingUrl === item.url;
              return (
                <div
                  key={item.url}
                  className="px-4 py-3 transition-colors hover:bg-muted/20 md:grid md:grid-cols-[1fr_auto_auto_auto] md:items-center md:gap-4"
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

                  {/* Mobilde chunk/tip bilgisi satır altında */}
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

                  {/* Desktop: Tip rozeti */}
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

      {/* Liste sonu info */}
      {!loadingList && filtered.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          {filtered.length} / {items.length}
        </p>
      )}

      {/* Silme onay dialog */}
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
