import type { FeaturedPost } from "@/lib/home/featured-content";
import { PostCard } from "@/components/home/post-card";
import { SectionHeading } from "@/components/home/section-heading";

export function FeaturedGuides({ posts }: { posts: FeaturedPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mb-20">
      <SectionHeading
        eyebrow="Hand-picked"
        title="Featured Guides"
        description="Our deepest, most-researched guides — start here if you're new to a game."
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, i) => (
          <PostCard key={post.id} post={post} priority={i === 0} />
        ))}
      </div>
    </section>
  );
}
