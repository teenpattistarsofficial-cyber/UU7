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
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover/post-card:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand/15 via-brand/5 to-transparent">
              <Dices className="size-10 text-brand/40" />
            </div>
          )}
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
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
