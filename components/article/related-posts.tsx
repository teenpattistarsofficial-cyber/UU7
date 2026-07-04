import Link from "next/link";

/** Module 8's public surface — manual pins if the editor set any, otherwise
 * the same in-process scoring heuristic used by the Internal Linking
 * Assistant (see lib/seo/related.ts), computed by the caller either way. */
export function RelatedPosts({ posts }: { posts: { title: string; url: string }[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-10 border-t border-border pt-8">
      <h2 className="mb-4 text-xl font-semibold">Related Reading</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {posts.map((post) => (
          <li key={post.url}>
            <Link
              href={post.url}
              className="block rounded-lg border border-border p-3 text-sm font-medium hover:border-foreground/30 hover:bg-muted/50"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
