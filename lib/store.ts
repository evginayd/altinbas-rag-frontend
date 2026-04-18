import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Message } from "./types";
import type { Language } from "./i18n";
import { translations } from "./i18n";

/**
 * Chat store.
 *
 * - localStorage'da persist edilir (key: altinbas-chat-store)
 * - Kullanıcı sayfayı yenilese bile (F5) konuşma kaybolmaz
 * - Sadece "Yeni Sohbet" butonu mesajları siler
 */

type ChatStore = {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  language: Language;
  // Admin panel token. Null ise kullanıcı giriş yapmamış.
  // localStorage'da saklanır, sayfa yenilense de kalır.
  adminToken: string | null;

  addMessage: (msg: Omit<Message, "id" | "timestamp">) => Message;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
  setLanguage: (lang: Language) => void;
  setAdminToken: (token: string | null) => void;
};

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      messages: [],
      isLoading: false,
      error: null,
      language: "tr" as Language,
      adminToken: null,

      addMessage: (msg) => {
        const fullMessage: Message = {
          ...msg,
          id: createId(),
          timestamp: Date.now(),
        };
        set((state) => ({ messages: [...state.messages, fullMessage] }));
        return fullMessage;
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      clearMessages: () => set({ messages: [], error: null, isLoading: false }),
      setLanguage: (lang) => set({ language: lang }),
      setAdminToken: (token) => set({ adminToken: token }),
    }),
    {
      name: "altinbas-chat-store",
      storage: createJSONStorage(() => localStorage),
      // messages + language + adminToken persist edilir; isLoading/error oturum bağımlı
      partialize: (state) => ({
        messages: state.messages,
        language: state.language,
        adminToken: state.adminToken,
      }),
    },
  ),
);

/**
 * UI string'leri için kolay erişim hook'u.
 * Kullanım: const t = useT(); t.welcomeGreeting
 */
export const useT = () => {
  const language = useChatStore((s) => s.language);
  return translations[language];
};
