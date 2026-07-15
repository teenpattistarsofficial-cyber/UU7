import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SITE_CATEGORIES } from "@/lib/site-categories";
import { SectionHeading } from "@/components/home/section-heading";

type CategoryOverview = (typeof SITE_CATEGORIES)[number] & { count: number };

// Unlike Featured Guides / Popular Games above it on the homepage, this
// section needs no curated slug list and can't go stale the same way — it
// always shows all five site categories, so (unlike those two) it doesn't
// hide itself on an empty result; a category with 0 posts yet still shows
// as "Coming soon" rather than disappearing. And unlike those two, the
// count here is always exactly 5 (SITE_CATEGORIES never varies), so a
// `grid-cols-5` on desktop never leaves a reserved-but-empty column the
// way a variable-length list would.
export function BrowseCategories({ categories }: { categories: CategoryOverview[] }) {
  return (
    <section className="mb-20">
      <SectionHeading eyebrow="Explore" title="Browse by Category" description="Every guide on the site, organized by what you're trying to do." />
      {/* Compact horizontal row (icon + label + count inline), not the
         tall icon-on-top stack the first version used — that was three
         separate rows per card, so on mobile (necessarily 1-2 per row)
         the section ran to several screens of scrolling before you even
         reached the next section. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.slug}
              href={category.href}
              className="group flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_24px_-12px_rgba(0,0,0,0.12)]"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Icon className="size-4.5" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-semibold leading-snug">{category.label}</span>
                <span className="text-xs text-muted-foreground">{category.count > 0 ? `${category.count} guide${category.count === 1 ? "" : "s"}` : "Coming soon"}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
