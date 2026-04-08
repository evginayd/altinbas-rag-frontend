"use client";

import { useEffect, useState, useRef } from "react";

/**
 * Typewriter hook.
 *
 * Verilen tam metni kelime kelime ekrana yazar (sahte streaming efekti).
 * Backend tüm cevabı tek seferde döndürür, biz frontend'de bunu animate ederiz.
 *
 * @param fullText Backend'den gelen tam metin
 * @param wordsPerSecond Saniyede yazılacak kelime sayısı (default: 30)
 * @param enabled Animasyonu açıp/kapatma (default: true)
 * @returns Şu ana kadar yazılmış metin + animasyon biraz mı kaldı bilgisi
 */
export function useTypewriter(
  fullText: string,
  wordsPerSecond = 30,
  enabled = true,
) {
  const [displayedText, setDisplayedText] = useState(enabled ? "" : fullText);
  const [isComplete, setIsComplete] = useState(!enabled);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(fullText);
      setIsComplete(true);
      return;
    }

    setDisplayedText("");
    setIsComplete(false);

    const words = fullText.split(/(\s+)/); // boşlukları koru
    let index = 0;
    const intervalMs = 1000 / wordsPerSecond;

    intervalRef.current = setInterval(() => {
      if (index >= words.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsComplete(true);
        return;
      }
      // Her seferinde 1 token (kelime + sonraki boşluk) ekle
      const next = words.slice(0, index + 1).join("");
      setDisplayedText(next);
      index += 1;
    }, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fullText, wordsPerSecond, enabled]);

  return { displayedText, isComplete };
}
