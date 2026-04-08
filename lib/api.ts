import type { ChatResponse } from "./types";

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
 * @returns Cevap, kaynaklar ve metadata
 */
export async function chat(query: string): Promise<ChatResponse> {
  if (!API_URL) {
    throw new ApiError(
      "API URL tanımlı değil. NEXT_PUBLIC_API_URL ortam değişkenini ayarlayın.",
    );
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
  } catch (err) {
    throw new ApiError(
      "Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.",
    );
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
