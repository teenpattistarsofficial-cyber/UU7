import Link from "next/link";
import type { FeaturedPost } from "@/lib/home/featured-content";

export function FeaturedGuides({ posts }: { posts: FeaturedPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="mb-4 text-xl font-semibold">Featured Guides</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.id} href={post.url} className="rounded-lg border p-4 transition-colors hover:bg-muted/50">
            <h3 className="font-medium">{post.title}</h3>
            {post.excerpt && <p className="mt-1 text-sm text-muted-foreground">{post.excerpt}</p>}
          </Link>
        ))}
      </div>
    </section>
  );
}
