import { ListTree } from "lucide-react";
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
    <nav aria-label="Table of contents" className="mb-8 rounded-xl border border-border/70 bg-card p-4 sm:p-5">
      <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        <ListTree className="size-3.5 text-brand" />
        On this page
      </p>
      <ul className="space-y-1.5 text-sm">
        {headings.map((h) => (
          <li key={h.id} className={INDENT_BY_LEVEL[h.level] ?? ""}>
            <a
              href={`#${h.id}`}
              className="text-foreground/75 transition-colors hover:text-brand hover:underline"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
