"use client";

import { useState } from "react";
import { Bot, Check, Copy, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTypewriter } from "@/lib/typewriter";
import type { Message } from "@/lib/types";
import { SourcesAccordion } from "./sources-accordion";

type MessageBubbleProps = {
  message: Message;
  /** Yeni gelen mesajları typewriter ile animate et */
  animate?: boolean;
};

/**
 * Tek bir chat mesajı (user veya assistant).
 *
 * - User: sağa hizalı, primary background
 * - Assistant: sola hizalı, muted background, markdown render, sources, copy
 * - Yeni assistant mesajları typewriter efekti ile gösterilir
 */
export function MessageBubble({ message, animate = false }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isClarification = message.needsClarification === true;
  const [copied, setCopied] = useState(false);

  // Sadece animate=true ise typewriter çalışsın, eski mesajlar direkt görünsün
  const shouldAnimate = animate && !isUser;
  const { displayedText, isComplete } = useTypewriter(
    message.content,
    40,
    shouldAnimate,
  );

  const visibleText = shouldAnimate ? displayedText : message.content;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3 fade-in-up",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground",
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "flex max-w-[85%] flex-col gap-1",
          isUser ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : isClarification
                ? "bg-accent/40 text-foreground border border-accent rounded-tl-sm"
                : "bg-muted text-foreground rounded-tl-sm",
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{visibleText}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none [&>*]:my-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Tüm linkler yeni sekmede açılsın (kullanıcı isteği)
                  a: ({ href, children, ...props }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2 hover:opacity-80"
                      {...props}
                    >
                      {children}
                    </a>
                  ),
                  // Markdown table styling
                  table: ({ children }) => (
                    <div className="my-3 overflow-x-auto rounded-lg border border-border">
                      <table className="w-full text-xs">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border-b border-border bg-muted px-3 py-2 text-left font-semibold">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border-b border-border/50 px-3 py-2">
                      {children}
                    </td>
                  ),
                  code: ({ className, children, ...props }) => {
                    const isInline = !className?.includes("language-");
                    if (isInline) {
                      return (
                        <code
                          className="rounded bg-muted-foreground/10 px-1.5 py-0.5 font-mono text-[0.85em]"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code
                        className="block rounded-md bg-muted-foreground/10 p-3 font-mono text-xs overflow-x-auto"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  ul: ({ children }) => (
                    <ul className="list-disc pl-5 space-y-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-5 space-y-1">{children}</ol>
                  ),
                }}
              >
                {visibleText || " "}
              </ReactMarkdown>
              {shouldAnimate && !isComplete && (
                <span className="inline-block h-4 w-1 animate-pulse bg-foreground/50 align-middle ml-0.5" />
              )}
            </div>
          )}
        </div>

        {/* Action bar (sadece assistant + animasyon bittiyse) */}
        {!isUser && (!shouldAnimate || isComplete) && (
          <div className="flex items-center gap-1 px-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 mr-1" /> Kopyalandı
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" /> Kopyala
                </>
              )}
            </Button>
          </div>
        )}

        {/* Sources */}
        {!isUser && !isClarification && (!shouldAnimate || isComplete) && (
          <div className="w-full">
            <SourcesAccordion sources={message.sources ?? []} />
          </div>
        )}
      </div>
    </div>
  );
}
