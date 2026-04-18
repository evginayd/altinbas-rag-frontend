"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Basit toast notification sistemi.
 *
 * shadcn-ui veya sonner yerine küçük inline implementasyon:
 *   <ToastProvider> ile sarmalan → useToast hook'u ile .show() çağır.
 *
 * Toast'lar 4sn sonra otomatik kaybolur (success/info), error'lar
 * 6sn görünür. Kullanıcı X butonuyla erken kapatabilir.
 */

export type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  show: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const full = { ...toast, id };
      setToasts((prev) => [...prev, full]);
      const duration = toast.variant === "error" ? 6000 : 4000;
      setTimeout(() => remove(id), duration);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {/* Toast container: sağ alt, portal gerekmedi (z-index yeterli) */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const Icon =
    toast.variant === "success"
      ? CheckCircle2
      : toast.variant === "error"
        ? AlertCircle
        : Info;

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-lg border p-3 shadow-lg",
        "animate-in slide-in-from-right duration-200",
        "bg-card/95 backdrop-blur",
        toast.variant === "success" && "border-emerald-500/40",
        toast.variant === "error" && "border-destructive/50",
        toast.variant === "info" && "border-border",
      )}
      role="alert"
    >
      <Icon
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0",
          toast.variant === "success" && "text-emerald-500",
          toast.variant === "error" && "text-destructive",
          toast.variant === "info" && "text-muted-foreground",
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-3">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        className="shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Close"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within <ToastProvider>");
  }
  return ctx;
}
