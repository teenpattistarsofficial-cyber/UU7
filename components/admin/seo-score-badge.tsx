import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Large pill variant of the SEO score for the editor's top bar — the list
 * table uses the compact circular SeoScoreBadge in list-badges.tsx instead. */
export function SeoScorePill({ score }: { score: number }) {
  const tone =
    score >= 80
      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      : score >= 50
        ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
        : "bg-destructive/10 text-destructive border-destructive/20";
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold", tone)}>
      <BarChart3 className="size-4" />
      SEO Score: {score}/100
    </span>
  );
}
