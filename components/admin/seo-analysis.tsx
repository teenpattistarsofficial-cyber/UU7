import { CheckCircle2, XCircle } from "lucide-react";
import type { SeoCheck } from "@/lib/seo/score";
import { cn } from "@/lib/utils";

/** Full breakdown behind the single SEO score number — every check that
 * feeds into it, shown individually so an editor can see exactly what to
 * fix instead of just a percentage. */
export function SeoAnalysis({ checks }: { checks: SeoCheck[] }) {
  const passed = checks.filter((c) => c.passed).length;

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">SEO analysis</p>
        <span className="text-xs font-medium text-muted-foreground">
          {passed}/{checks.length} passed
        </span>
      </div>
      <ul className="space-y-1.5">
        {checks.map((check) => (
          <li
            key={check.key}
            className={cn("flex items-start gap-2 text-sm", check.passed ? "text-foreground" : "text-muted-foreground")}
          >
            {check.passed ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-500" />
            ) : (
              <XCircle className="mt-0.5 size-4 shrink-0 text-destructive/70" />
            )}
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
