"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore, useT } from "@/lib/store";
import { AdminAuthError, AdminNotConfiguredError, verifyToken } from "@/lib/admin-api";

/**
 * Admin girişi: kullanıcı token yapıştırır, /admin/stats ile doğrularız,
 * başarılı ise store'a kaydedip /admin dashboard'a yönlendirir.
 */
export default function AdminLoginPage() {
  const t = useT();
  const router = useRouter();
  const setAdminToken = useChatStore((s) => s.setAdminToken);
  const existingToken = useChatStore((s) => s.adminToken);

  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Zaten giriş yapmışsa dashboard'a yönlendir
  useEffect(() => {
    if (existingToken) router.replace("/admin");
  }, [existingToken, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      // Token'ı sunucuya soralım; geçerliyse store'a kaydet + redirect
      await verifyToken(token.trim());
      setAdminToken(token.trim());
      router.replace("/admin");
    } catch (err) {
      if (err instanceof AdminAuthError) {
        setError(t.adminLoginError);
      } else if (err instanceof AdminNotConfiguredError) {
        setError(t.adminLoginError);
      } else {
        setError(err instanceof Error ? err.message : t.adminLoginError);
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Back to chat link */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t.adminBackToChat}
        </Link>

        {/* Login card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              {t.adminLoginTitle}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.adminLoginDescription}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-token"
                className="mb-1.5 block text-xs font-medium text-foreground"
              >
                {t.adminTokenLabel}
              </label>
              <input
                id="admin-token"
                type="password"
                autoComplete="off"
                autoFocus
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder={t.adminTokenPlaceholder}
                disabled={loading}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground placeholder:font-sans focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
            </div>

            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={!token.trim() || loading}
              size="lg"
              className="w-full"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? t.adminAddUrlProcessing : t.adminLoginButton}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
