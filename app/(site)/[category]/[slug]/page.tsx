import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { posts, authors } from "@/lib/db/schema";

// Bare article render for Phase 1 — the full AEO/GEO template (Quick Answer,
// Key Takeaways, ToC, Stats Tables, FAQ, schema, etc.) is built in Phase 5
// once Tiptap content and the SEO field set exist.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.query.posts.findFirst({ where: eq(posts.slug, slug) });
  return { title: post?.title ?? "Post" };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { slug } = await params;
  const post = await db.query.posts.findFirst({ where: eq(posts.slug, slug) });
  if (!post || post.status !== "published") notFound();

  const author = post.authorId
    ? await db.query.authors.findFirst({ where: eq(authors.id, post.authorId) })
    : null;

  const contentText = typeof post.content === "string" ? post.content : "";

  return (
    <article className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-semibold">{post.title}</h1>
      <div className="mb-8 text-sm text-muted-foreground">
        {author && <span>{author.displayName}</span>}
        {post.publishedAt && (
          <span> · {new Date(post.publishedAt).toLocaleDateString()}</span>
        )}
        {post.readingTimeMinutes && <span> · {post.readingTimeMinutes} min read</span>}
      </div>
      <div className="whitespace-pre-wrap leading-7">{contentText}</div>
    </article>
  );
}
