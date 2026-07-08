import type { PostSummary } from "@/lib/posts/post-summary";
import { PostCard } from "@/components/home/post-card";

/** Module 8's public surface — manual pins if the editor set any, otherwise
 * the same in-process scoring heuristic used by the Internal Linking
 * Assistant (see lib/seo/related.ts). The caller (the article page) does
 * the scoring/pin resolution and a second query for full card data
 * (lib/posts/post-summary.ts) — this component just renders the same
 * `PostCard` grid the homepage uses, instead of the plain title-only links
 * it used to be. */
export function RelatedPosts({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-10 border-t border-border pt-8">
      <h2 className="mb-4 text-xl font-semibold">Related Reading</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
