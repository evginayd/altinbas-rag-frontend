import type { ChatResponse, Message } from "./types";
import { translations, type Language } from "./i18n";

/**
 * Store React hook'u burada kullanılamaz (api.ts komponent değil). Hata
 * mesajlarını lokalize etmek için localStorage'daki persist verisinden
 * dil tercihini okuruz. Hata olursa varsayılan "tr".
 */
function getLang(): Language {
  if (typeof window === "undefined") return "tr";
  try {
    const raw = localStorage.getItem("altinbas-chat-store");
    if (!raw) return "tr";
    const parsed = JSON.parse(raw);
    const lang = parsed?.state?.language;
    return lang === "en" ? "en" : "tr";
  } catch {
    return "tr";
  }
}

/**
 * Backend API client.
 *
 * NEXT_PUBLIC_API_URL ortam değişkeninden Railway URL'ini okur.
 * Local geliştirmede .env.local içinde tanımlı olmalı.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL && typeof window !== "undefined") {
  // Client-side warning, throw etmiyoruz çünkü build time'da gelmemiş olabilir
  console.warn(
    "NEXT_PUBLIC_API_URL tanımlı değil. .env.local dosyanızı kontrol edin.",
  );
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Backend'e bir chat sorgusu gönderir.
 *
 * @param query Kullanıcının sorusu
 * @param history Önceki konuşma (en eskiden en yeniye). "devamı",
 *                "başka ne var" gibi takip sorularında backend bağlamı
 *                kullanabilsin diye gönderilir.
 * @returns Cevap, kaynaklar ve metadata
 */
export async function chat(
  query: string,
  history: Message[] = [],
): Promise<ChatResponse> {
  const t = translations[getLang()];
  if (!API_URL) {
    throw new ApiError(t.errorApiUrl);
  }

  // Son 6 mesajla sınırla (3 turn). Token maliyeti için bu yeterli,
  // daha eski mesajlara referans gerektiren sorular zaten nadir.
  const recentHistory = history.slice(-6).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  let response: Response;
  try {
    response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, history: recentHistory }),
    });
  } catch (err) {
    throw new ApiError(t.errorConnection);
  }

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body?.detail ?? "";
    } catch {
      /* ignore */
    }
    throw new ApiError(
      `Sunucu hatası (${response.status})${detail ? `: ${detail}` : ""}`,
      response.status,
    );
  }

  return response.json();
}
