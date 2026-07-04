import type { Citation } from "@/lib/editor/citations";

/** GEO signal — an explicit, scannable source list makes it easy for an AI
 * assistant (or a skeptical reader) to verify claims without re-parsing
 * the article body for links. */
export function SourceCitations({ citations }: { citations: Citation[] }) {
  if (citations.length === 0) return null;

  return (
    <section className="mt-10 border-t border-border pt-8">
      <h2 className="mb-4 text-xl font-semibold">Sources</h2>
      <ol className="list-decimal space-y-1.5 pl-5 text-sm">
        {citations.map((c) => (
          <li key={c.url}>
            <a href={c.url} target="_blank" rel="noopener noreferrer nofollow" className="text-foreground/80 hover:underline">
              {c.text}
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
