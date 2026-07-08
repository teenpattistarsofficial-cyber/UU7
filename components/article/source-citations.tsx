import type { Citation } from "@/lib/editor/citations";

/** GEO signal — an explicit, scannable source list makes it easy for an AI
 * assistant (or a skeptical reader) to verify claims without re-parsing
 * the article body for links. */
export function SourceCitations({ citations }: { citations: Citation[] }) {
  if (citations.length === 0) return null;

  return (
    <section className="mt-10 border-t border-border pt-8">
      <h2 className="mb-4 text-xl font-semibold">Sources</h2>
      <ol className="space-y-2 text-sm">
        {citations.map((c, i) => (
          <li key={c.url} className="flex gap-2.5">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-muted-foreground">
              {i + 1}
            </span>
            <a
              href={c.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-foreground/75 hover:text-brand hover:underline"
            >
              {c.text}
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
