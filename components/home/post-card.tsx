import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Dices } from "lucide-react";
import type { FeaturedPost } from "@/lib/home/featured-content";
import { getCategoryMeta } from "@/lib/site-categories";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Shared card used by both the Featured Guides and Latest Posts sections —
 * same visual language (image, category badge, title, excerpt, reading
 * time, "Read guide" arrow) since they're both "here's a post" grids, just
 * fed by different queries (curated pillars vs. most-recently-published).
 * Overrides Card's own padding/gap defaults (`p-0 gap-0`) rather than
 * relying on its built-in "img is the first child" special-casing, since
 * the image here is wrapped in an aspect-ratio div, not a bare `<img>`. */
export function PostCard({ post, priority = false }: { post: FeaturedPost; priority?: boolean }) {
  const category = getCategoryMeta(post.categorySlug, post.categoryName);
  const CategoryIcon = category.icon;

  return (
    <Link href={post.url} className="group/post-card block h-full">
      <Card className="h-full gap-0 overflow-hidden p-0 ring-foreground/8 transition-all duration-300 group-hover/post-card:-translate-y-1 group-hover/post-card:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-16px_rgba(0,0,0,0.18)] group-hover/post-card:ring-brand/30">
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-muted">
          {post.featuredImageUrl ? (
            <Image
              src={post.featuredImageUrl}
              alt=""
              fill
              // Next 16 deprecated `priority` — it no longer sets
              // `fetchpriority` on its own, so the boolean has to fan out
              // into `loading`/`fetchPriority` explicitly here instead of
              // just forwarding a single prop.
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : undefined}
              // Tightened to the actual grid math (max-w-6xl container,
              // px-4 page padding, gap-6 between cards, 1/2/3 columns below
              // sm/lg) instead of a generic 100vw/50vw/33vw — the untethered
              // 33vw was requesting a candidate roughly 2x wider than the
              // card ever renders at once the 3-column grid's container
              // hits its max-width, per PageSpeed's oversized-image audit.
              sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc(50vw - 28px), 380px"
              className="object-cover transition-transform duration-500 group-hover/post-card:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand/15 via-brand/5 to-transparent">
              <Dices className="size-10 text-brand/40" />
            </div>
          )}
          {/* No backdrop-blur here on purpose — this card renders in grids of
             10-20+ (category/search pages), and each `backdrop-filter`
             instance is its own per-frame GPU compositing cost during
             scroll (see header.tsx's notes on the same trade-off for a
             single instance). The badge's bg-background/90 is already
             near-opaque, so blur added negligible visual effect for a cost
             that multiplies badly here. */}
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm">
            {CategoryIcon && <CategoryIcon className="size-3.5 text-brand" />}
            {category.label}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-heading text-base leading-snug font-semibold text-balance transition-colors group-hover/post-card:text-brand">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
          )}

          <div
            className={cn(
              "mt-auto flex items-center justify-between border-t border-border/70 pt-3 text-xs font-medium text-muted-foreground",
              !post.excerpt && "mt-3",
            )}
          >
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              {post.readingTimeMinutes ? `${post.readingTimeMinutes} min read` : "Guide"}
            </span>
            <span className="inline-flex items-center gap-1 text-foreground">
              Read guide
              <ArrowRight className="size-3.5 transition-transform group-hover/post-card:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
