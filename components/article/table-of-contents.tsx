import type { TocHeading } from "@/lib/editor/toc";

const INDENT_BY_LEVEL: Record<number, string> = {
  2: "pl-0",
  3: "pl-4",
  4: "pl-8",
};

/** Rendered from headings derived live off the article content (see
 * lib/editor/toc.ts) — never stored, so it can't go stale. */
export function TableOfContents({ headings }: { headings: TocHeading[] }) {
  if (headings.length < 2) return null;

  return (
    <nav aria-label="Table of contents" className="mb-8 rounded-xl border border-border bg-muted/30 p-4">
      <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">On this page</p>
      <ul className="space-y-1 text-sm">
        {headings.map((h) => (
          <li key={h.id} className={INDENT_BY_LEVEL[h.level] ?? ""}>
            <a href={`#${h.id}`} className="text-foreground/80 hover:text-foreground hover:underline">
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
