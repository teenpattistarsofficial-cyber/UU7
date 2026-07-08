import { Sparkles } from "lucide-react";

/** Module 12 public render — a denser, factual callout distinct from the
 * article prose, with stable `data-ai-extract` hooks so an AI crawler (or
 * the site's own Ask-AI ingestion, once built) can grab exactly this block
 * without re-parsing the whole article. All three `data-ai-extract`
 * attributes stay on the exact same elements as before — only the visual
 * treatment around them changed. */
export function AiSummaryBlock({ summary, takeaways }: { summary: string; takeaways: string[] }) {
  if (!summary && takeaways.length === 0) return null;

  return (
    <aside
      data-ai-extract="summary"
      className="mb-8 rounded-xl border border-border/70 bg-gradient-to-br from-brand/[0.06] via-transparent to-transparent p-5"
    >
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-brand uppercase">
        <Sparkles className="size-3.5" />
        Quick Summary
      </p>
      {summary && (
        <p data-ai-extract="summary-text" className="text-sm leading-relaxed text-foreground/90">
          {summary}
        </p>
      )}
      {takeaways.length > 0 && (
        <ul data-ai-extract="key-takeaways" className="mt-3 space-y-1.5 text-sm">
          {takeaways.map((takeaway, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-brand" />
              {takeaway}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
