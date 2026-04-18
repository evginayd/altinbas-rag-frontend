"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PaginationProps = {
  /** 1-based aktif sayfa numarası */
  page: number;
  /** Toplam sayfa sayısı */
  totalPages: number;
  /** Sayfa değiştiğinde çağrılır */
  onPageChange: (page: number) => void;
  /** İşlem yapılıyorsa butonlar disabled olur */
  disabled?: boolean;
};

/**
 * URL listesi için sayfa navigasyon butonları.
 *
 * Gösterim stratejisi: Aktif sayfanın etrafında 2 komşu + baş/son sayfa.
 * Arada boşluk varsa "..." koyar.
 *
 * Örn: 20 sayfada, aktif=10:
 *   [<]  1  ...  8  9  [10]  11  12  ...  20  [>]
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = computePages(page, totalPages);

  const goTo = (p: number) => {
    if (disabled) return;
    if (p < 1 || p > totalPages || p === page) return;
    onPageChange(p);
  };

  return (
    <nav
      className="flex items-center justify-center gap-1 py-2"
      aria-label="Pagination"
    >
      <button
        onClick={() => goTo(page - 1)}
        disabled={disabled || page <= 1}
        className={navBtnClass(false)}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span
            key={`ellipsis-${i}`}
            className="px-2 text-xs text-muted-foreground select-none"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p)}
            disabled={disabled}
            className={navBtnClass(p === page)}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => goTo(page + 1)}
        disabled={disabled || page >= totalPages}
        className={navBtnClass(false)}
        aria-label="Next page"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </nav>
  );
}

function navBtnClass(active: boolean): string {
  return cn(
    "inline-flex h-7 min-w-[28px] items-center justify-center rounded-md border px-2 text-xs font-medium transition-colors",
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-card text-foreground hover:bg-muted",
    "disabled:pointer-events-none disabled:opacity-40",
  );
}

/**
 * Aktif sayfanın etrafında gösterilecek sayfa numaralarını hesaplar.
 * "ellipsis" değeri boşluğu temsil eder.
 *
 * Kurallar:
 *   - 7 veya daha az sayfa → hepsi gösterilir (ellipsis yok)
 *   - Daha fazla → [1, ..., aktif-1, aktif, aktif+1, ..., son]
 */
function computePages(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const result: (number | "ellipsis")[] = [];
  const neighbors = 1; // aktif sayfanın yanında kaç tane göstersin

  const start = Math.max(2, current - neighbors);
  const end = Math.min(total - 1, current + neighbors);

  result.push(1);

  if (start > 2) {
    result.push("ellipsis");
  }

  for (let i = start; i <= end; i++) {
    result.push(i);
  }

  if (end < total - 1) {
    result.push("ellipsis");
  }

  result.push(total);
  return result;
}
