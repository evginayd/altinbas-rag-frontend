"use client";

import { Sparkles } from "lucide-react";

const SUGGESTIONS = [
  "Burs türleri nelerdir?",
  "Yatay geçiş başvuru tarihleri",
  "Yazılım Mühendisliği müfredatı",
  "İletişim bilgileri ve yerleşkeler",
];

type EmptyStateProps = {
  onSuggestionClick: (text: string) => void;
};

/**
 * Konuşma yokken gösterilen hoş geldin ekranı.
 * 4 öneri chip'i var, tıklayınca otomatik soru gönderilir.
 */
export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center fade-in-up">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
        <Sparkles className="h-8 w-8" />
      </div>

      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-foreground">
        Altınbaş AI Asistanına Hoş Geldin 👋
      </h1>
      <p className="mb-10 max-w-md text-base text-muted-foreground">
        Üniversite, fakülteler, müfredat, burslar, başvuru süreçleri ve daha
        fazlası hakkında her şeyi sorabilirsin.
      </p>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSuggestionClick(suggestion)}
            className="group rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:bg-accent/40 hover:shadow-sm"
          >
            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              {suggestion}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Sormak için tıkla →
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
