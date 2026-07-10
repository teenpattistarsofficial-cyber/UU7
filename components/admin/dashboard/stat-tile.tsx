import { cn } from "@/lib/utils";

const TOP_BORDER: Record<string, string> = {
  indigo: "before:bg-indigo-500",
  emerald: "before:bg-emerald-500",
  violet: "before:bg-violet-500",
  brand: "before:bg-brand",
  blue: "before:bg-blue-500",
  amber: "before:bg-amber-500",
};

const ICON_TINT: Record<string, string> = {
  indigo: "bg-indigo-500/10 text-indigo-600",
  emerald: "bg-emerald-500/10 text-emerald-600",
  violet: "bg-violet-500/10 text-violet-600",
  brand: "bg-brand/10 text-brand",
  blue: "bg-blue-500/10 text-blue-600",
  amber: "bg-amber-500/10 text-amber-600",
};

export function StatTile({
  icon: Icon,
  color = "brand",
  value,
  label,
  caption,
  accentBorder = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  color?: keyof typeof ICON_TINT;
  value: string | number;
  label: string;
  caption?: string;
  accentBorder?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card p-4",
        accentBorder && "before:absolute before:inset-x-0 before:top-0 before:h-1",
        accentBorder && TOP_BORDER[color],
      )}
    >
      <div className={cn("mb-3 flex size-9 items-center justify-center rounded-full", ICON_TINT[color])}>
        <Icon className="size-4" />
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      <p className="mt-0.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
      {caption && <p className="mt-1 text-xs text-muted-foreground">{caption}</p>}
    </div>
  );
}
