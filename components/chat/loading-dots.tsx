/**
 * 3-nokta yüklenme animasyonu.
 * Assistant cevap gelene kadar gösterilir.
 */
export function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-2">
      <span
        className="loading-dot inline-block h-2 w-2 rounded-full bg-muted-foreground/60"
        style={{ animationDelay: "0s" }}
      />
      <span
        className="loading-dot inline-block h-2 w-2 rounded-full bg-muted-foreground/60"
        style={{ animationDelay: "0.16s" }}
      />
      <span
        className="loading-dot inline-block h-2 w-2 rounded-full bg-muted-foreground/60"
        style={{ animationDelay: "0.32s" }}
      />
    </div>
  );
}
