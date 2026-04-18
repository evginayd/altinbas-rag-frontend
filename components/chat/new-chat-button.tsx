"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useChatStore, useT } from "@/lib/store";

/**
 * "Yeni Sohbet" butonu.
 *
 * Mevcut konuşma varsa confirm dialog gösterir.
 * Dialog programatik olarak (open state) yönetilir; trigger'ı kullanmıyoruz
 * çünkü shadcn'in yeni Base UI versiyonunda asChild prop yok.
 */
export function NewChatButton() {
  const [open, setOpen] = useState(false);
  const messages = useChatStore((s) => s.messages);
  const clearMessages = useChatStore((s) => s.clearMessages);
  const t = useT();

  const hasMessages = messages.length > 0;

  const handleClick = () => {
    if (!hasMessages) return;
    setOpen(true);
  };

  const handleClear = () => {
    clearMessages();
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={!hasMessages}
        onClick={handleClick}
        className="rounded-full gap-1.5"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">{t.newChat}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.newChatDialogTitle}</DialogTitle>
            <DialogDescription>
              {t.newChatDialogDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleClear}>{t.confirmNewChat}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
