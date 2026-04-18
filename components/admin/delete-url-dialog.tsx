"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/lib/store";

type DeleteUrlDialogProps = {
  open: boolean;
  url: string | null;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * URL silme onay dialog'u. Geri alınamaz olduğunu vurgular.
 */
export function DeleteUrlDialog({
  open,
  url,
  loading,
  onCancel,
  onConfirm,
}: DeleteUrlDialogProps) {
  const t = useT();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !loading && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <DialogTitle>{t.adminDeleteDialogTitle}</DialogTitle>
          <DialogDescription>{t.adminDeleteDialogDescription}</DialogDescription>
        </DialogHeader>

        {/* URL preview */}
        {url && (
          <div className="my-2 break-all rounded-md border border-border bg-muted/50 p-2 text-xs font-mono text-muted-foreground">
            {url}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {t.cancel}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {t.adminDeleteConfirmButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
