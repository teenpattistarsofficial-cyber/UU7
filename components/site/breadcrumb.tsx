import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Plain visible breadcrumb trail — distinct from the BreadcrumbList
 * JSON-LD already emitted per-page (lib/seo/jsonld.ts's
 * buildBreadcrumbSchema), which only affects rich results, not what a
 * human actually sees on the page. The article template and category
 * listing previously had the structured data but no visible trail at all.
 *
 * The last item (the current page — often a long post title, and the only
 * one with no `href`) is the one that has to give when space is tight,
 * hence `truncate` on it. That alone isn't enough inside a flex row,
 * though: flex items default to a min-width equal to their own content's
 * natural (unwrapped) size, so without `min-w-0` here the browser refuses
 * to shrink it below the full title's width no matter how little room is
 * left — forcing this nav, and the whole page along with it, wider than
 * the viewport on mobile instead of actually truncating. The earlier
 * items (Home, category) get `shrink-0` instead, since they're short and
 * should never be the ones that give. */
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 overflow-hidden text-sm text-muted-foreground">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className={cn("flex items-center gap-1.5", isLast ? "min-w-0" : "shrink-0")}>
            {i > 0 && <ChevronRight className="size-3.5 shrink-0" />}
            {item.href ? (
              <Link href={item.href} className="shrink-0 transition-colors hover:text-brand">
                {item.label}
              </Link>
            ) : (
              <span className="min-w-0 truncate text-foreground/80">{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
