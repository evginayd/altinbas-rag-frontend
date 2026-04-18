"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink, FileText, Globe } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { Source } from "@/lib/types";
import { useT } from "@/lib/store";

type SourcesAccordionProps = {
  sources: Source[];
};

/**
 * AI cevabının altında gösterilen "Kaynaklar" bölümü.
 * Default: kapalı. Tıklayınca açılır.
 * Tüm linkler yeni sekmede açılır (target="_blank").
 */
export function SourcesAccordion({ sources }: SourcesAccordionProps) {
  const [open, setOpen] = useState(false);
  const t = useT();

  if (!sources || sources.length === 0) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-3">
      <CollapsibleTrigger
        className={cn(
          "flex items-center gap-2 text-xs font-medium",
          "text-muted-foreground hover:text-foreground transition-colors",
          "px-2 py-1 rounded-md hover:bg-muted/60",
        )}
      >
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            open && "rotate-180",
          )}
        />
        <span>{t.sourcesLabel(sources.length)}</span>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2">
        <div className="space-y-2">
          {sources.map((source, index) => {
            const isPdf =
              source.url.toLowerCase().endsWith(".pdf") ||
              source.title?.toLowerCase().endsWith(".pdf");
            return (
              <a
                key={`${source.url}-${index}`}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group flex items-start gap-3 rounded-lg border border-border",
                  "bg-card hover:bg-accent/40 transition-colors p-3",
                )}
              >
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  {isPdf ? (
                    <FileText className="h-3.5 w-3.5" />
                  ) : (
                    <Globe className="h-3.5 w-3.5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {source.title || source.url}
                    </p>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                    {source.url}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/80">
                    {t.relevanceScore}: {(source.relevance_score * 100).toFixed(0)}%
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
