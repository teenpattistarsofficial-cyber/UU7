import { cn } from "@/lib/utils";

export function SeoScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 80
      ? "bg-emerald-500/10 text-emerald-600"
      : score >= 50
        ? "bg-amber-500/10 text-amber-600"
        : "bg-destructive/10 text-destructive";
  return (
    <div className={cn("flex size-9 items-center justify-center rounded-full text-sm font-semibold", tone)}>
      {score}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    published: { label: "Published", className: "bg-emerald-500/10 text-emerald-600" },
    draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
    scheduled: { label: "Scheduled", className: "bg-blue-500/10 text-blue-600" },
    archived: { label: "Archived", className: "bg-muted text-muted-foreground" },
  };
  const { label, className } = config[status] ?? { label: status, className: "bg-muted text-muted-foreground" };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", className)}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
