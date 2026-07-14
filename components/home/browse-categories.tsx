import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { SITE_CATEGORIES } from "@/lib/site-categories";
import { SectionHeading } from "@/components/home/section-heading";

type CategoryOverview = (typeof SITE_CATEGORIES)[number] & { count: number };

// Unlike Featured Guides / Popular Games above it on the homepage, this
// section needs no curated slug list and can't go stale the same way — it
// always shows all five site categories, so (unlike those two) it doesn't
// hide itself on an empty result; a category with 0 posts yet still shows
// as "Coming soon" rather than disappearing.
export function BrowseCategories({ categories }: { categories: CategoryOverview[] }) {
  return (
    <section className="mb-20">
      <SectionHeading eyebrow="Explore" title="Browse by Category" description="Every guide on the site, organized by what you're trying to do." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.slug}
              href={category.href}
              className="group flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_24px_-12px_rgba(0,0,0,0.12)]"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Icon className="size-5" />
              </span>
              <span className="flex items-start justify-between gap-2">
                <span className="font-heading text-base font-semibold leading-snug text-balance">{category.label}</span>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />
              </span>
              <span className="text-sm text-muted-foreground">{category.count > 0 ? `${category.count} guide${category.count === 1 ? "" : "s"}` : "Coming soon"}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
