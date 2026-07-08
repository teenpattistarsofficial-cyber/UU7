import type { FeaturedPost } from "@/lib/home/featured-content";
import { PostCard } from "@/components/home/post-card";
import { SectionHeading } from "@/components/home/section-heading";

/** Most-recently-published posts, unlike FeaturedGuides above which is
 * pinned to a hand-curated pillar list — this is the section that actually
 * moves as new content ships, so it's what signals an active site to a
 * returning visitor. Reuses the same PostCard as Featured Guides: same
 * "post preview" concept, just a different query behind it, so a visual
 * split here would read as arbitrary rather than meaningful. */
export function LatestPosts({ posts }: { posts: FeaturedPost[] }) {
  return (
    <section className="mb-20">
      <SectionHeading eyebrow="Fresh off the press" title="Latest Posts" />
      {posts.length === 0 ? (
        <p className="text-muted-foreground">No published posts yet — check back soon.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}
