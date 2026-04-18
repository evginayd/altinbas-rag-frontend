"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/store";

type InputBarProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
  /** Dış kontrolden değer set edebilmek için (öneri chip'lerinden) */
  externalValue?: string;
};

/**
 * Sayfanın altındaki sticky input bar.
 *
 * - Auto-resize textarea (max 5 satır)
 * - Enter: gönder
 * - Shift+Enter: yeni satır
 * - Send butonu disabled when empty/loading
 */
export function InputBar({
  onSend,
  disabled = false,
  externalValue,
}: InputBarProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const t = useT();

  // Dış kontrolden değer geldiğinde set et + focus
  useEffect(() => {
    if (externalValue !== undefined && externalValue !== "") {
      setValue(externalValue);
      textareaRef.current?.focus();
    }
  }, [externalValue]);

  // Auto-resize
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const maxHeight = 5 * 24; // ~5 lines
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, [value]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto max-w-3xl px-4 py-4">
        <div
          className={cn(
            "flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm",
            "focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20",
            "transition-all",
          )}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.inputPlaceholder}
            rows={1}
            disabled={disabled}
            className={cn(
              "flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-6",
              "placeholder:text-muted-foreground focus:outline-none",
              "disabled:opacity-50",
            )}
          />
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
            size="icon"
            className="h-9 w-9 shrink-0 rounded-xl"
            aria-label={t.sendLabel}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          {t.disclaimerText}
        </p>
      </div>
    </div>
  );
}
