import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { posts, authors, seoMeta } from "@/lib/db/schema";
import { buildMetadata } from "@/lib/seo/metadata";
import { renderContentHtml } from "@/lib/editor/render";
import { toTiptapDoc } from "@/lib/editor/doc";

// Bare article render for Phase 1/2 — the full AEO/GEO template (Quick
// Answer, Key Takeaways, ToC, Stats Tables, FAQ, schema, etc.) is built in
// Phase 5. SEO fields (Module 1/4) already drive real <head> metadata below.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const post = await db.query.posts.findFirst({ where: eq(posts.slug, slug) });
  if (!post) return { title: "Post" };

  const seo = await db.query.seoMeta.findFirst({
    where: and(eq(seoMeta.entityType, "post"), eq(seoMeta.entityId, post.id)),
  });

  return buildMetadata({
    seo,
    fallbackTitle: post.title,
    fallbackDescription: post.excerpt,
    fallbackImage: post.featuredImageUrl,
    path: `/${category}/${slug}`,
  });
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

  const html = renderContentHtml(toTiptapDoc(post.content));

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
      <div
        className="prose prose-neutral max-w-none dark:prose-invert"
        // Safe: content is authored exclusively by authenticated admin/editor
        // roles through the Tiptap editor, never from public user input.
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
