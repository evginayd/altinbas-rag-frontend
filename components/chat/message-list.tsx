"use client";

import { useEffect, useRef } from "react";
import { Bot } from "lucide-react";
import { MessageBubble } from "./message-bubble";
import { LoadingDots } from "./loading-dots";
import type { Message } from "@/lib/types";

type MessageListProps = {
  messages: Message[];
  isLoading: boolean;
  /** Yeni gelen son mesajın id'si — typewriter buna göre çalışsın */
  latestMessageId?: string;
};

/**
 * Chat mesaj listesi.
 *
 * - Auto scroll-to-bottom yeni mesaj geldiğinde
 * - Loading sırasında boş bir assistant bubble + dots gösterir
 * - latestMessageId'li mesaj typewriter ile animate edilir
 */
export function MessageList({
  messages,
  isLoading,
  latestMessageId,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            animate={message.id === latestMessageId}
          />
        ))}

        {isLoading && (
          <div className="flex gap-3 fade-in-up">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3 shadow-sm">
              <LoadingDots />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
