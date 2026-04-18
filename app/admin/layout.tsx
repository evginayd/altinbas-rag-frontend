"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useChatStore } from "@/lib/store";
import { AdminNav } from "@/components/admin/admin-nav";

/**
 * Admin area layout. Auth guard + üst nav.
 *
 * - /admin/login hariç tüm /admin/* route'larında token kontrolü.
 * - Token yoksa → /admin/login'e redirect.
 * - Token varsa → nav + içerik göster.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const adminToken = useChatStore((s) => s.adminToken);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    // Login sayfasında auth kontrolüne gerek yok
    if (isLoginPage) return;
    if (!adminToken) {
      router.replace("/admin/login");
    }
  }, [adminToken, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  // Auth kontrol edilirken (ilk render) boş göster;
  // useEffect redirect atacak.
  if (!adminToken) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AdminNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
