/** Module 12 public render — a denser, factual callout distinct from the
 * article prose, with stable `data-ai-extract` hooks so an AI crawler (or
 * the site's own Ask-AI ingestion, once built) can grab exactly this block
 * without re-parsing the whole article. */
export function AiSummaryBlock({ summary, takeaways }: { summary: string; takeaways: string[] }) {
  if (!summary && takeaways.length === 0) return null;

  return (
    <aside
      data-ai-extract="summary"
      className="mb-8 rounded-xl border border-border bg-muted/50 p-5"
    >
      <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Quick Summary</p>
      {summary && <p data-ai-extract="summary-text" className="text-sm leading-relaxed">{summary}</p>}
      {takeaways.length > 0 && (
        <ul data-ai-extract="key-takeaways" className="mt-3 list-disc space-y-1 pl-5 text-sm">
          {takeaways.map((takeaway, i) => (
            <li key={i}>{takeaway}</li>
          ))}
        </ul>
      )}
    </aside>
  );
}
