import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Message } from "./types";

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

  addMessage: (msg: Omit<Message, "id" | "timestamp">) => Message;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
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
    }),
    {
      name: "altinbas-chat-store",
      storage: createJSONStorage(() => localStorage),
      // Sadece messages persist edilir, isLoading/error oturum bağımlı
      partialize: (state) => ({ messages: state.messages }),
    },
  ),
);
