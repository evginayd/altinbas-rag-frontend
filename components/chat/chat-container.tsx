"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { MessageList } from "./message-list";
import { InputBar } from "./input-bar";
import { EmptyState } from "./empty-state";
import { useChatStore } from "@/lib/store";
import { chat as chatApi, ApiError } from "@/lib/api";

/**
 * Ana chat sayfası container'ı.
 *
 * Akış:
 *  1. Kullanıcı mesaj gönderir → store'a user message eklenir
 *  2. setLoading(true), backend /chat çağrılır
 *  3. Backend cevabı gelir → store'a assistant message eklenir
 *     - latestMessageId set edilir, MessageList typewriter ile gösterir
 *  4. Hata olursa error message bubble olarak gösterilir
 */
export function ChatContainer() {
  const messages = useChatStore((s) => s.messages);
  const isLoading = useChatStore((s) => s.isLoading);
  const error = useChatStore((s) => s.error);
  const addMessage = useChatStore((s) => s.addMessage);
  const setLoading = useChatStore((s) => s.setLoading);
  const setError = useChatStore((s) => s.setError);

  // Yeni eklenen son mesajın id'si — typewriter buna göre çalışır
  const [latestId, setLatestId] = useState<string | undefined>();

  // Suggestion chip'lerinden gelen değer (input'a yazılır)
  const [externalInputValue, setExternalInputValue] = useState<string>("");

  const handleSend = async (text: string) => {
    if (isLoading) return;

    // 1. User mesajını ekle
    addMessage({ role: "user", content: text });
    setLoading(true);
    setError(null);

    try {
      // 2. Backend'e istek
      const response = await chatApi(text);

      // 3. Assistant mesajını ekle (animate flag için id'sini sakla)
      const newMsg = addMessage({
        role: "assistant",
        content: response.answer,
        sources: response.sources,
        needsClarification: response.needs_clarification,
      });
      setLatestId(newMsg.id);
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.";

      const newMsg = addMessage({
        role: "assistant",
        content: `⚠️ ${errorMessage}`,
        needsClarification: true, // sources gösterme
      });
      setLatestId(newMsg.id);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (text: string) => {
    handleSend(text);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />

      {messages.length === 0 ? (
        <EmptyState onSuggestionClick={handleSuggestionClick} />
      ) : (
        <MessageList
          messages={messages}
          isLoading={isLoading}
          latestMessageId={latestId}
        />
      )}

      <InputBar
        onSend={handleSend}
        disabled={isLoading}
        externalValue={externalInputValue}
      />
    </div>
  );
}
