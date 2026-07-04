import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import {
  posts,
  authors,
  categories,
  seoMeta,
  postFaqs,
  postAiSummary,
  postKeyTakeaways,
  postRelated,
  postQuickAnswer,
  postCtas,
  postStatsTables,
  tags,
  postTags,
} from "@/lib/db/schema";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildFaqSchema, buildArticleSchema, buildBreadcrumbSchema, buildPersonSchema } from "@/lib/seo/jsonld";
import { getPublishedPostCandidates } from "@/lib/seo/related-candidates";
import { scoreRelatedPosts } from "@/lib/seo/related";
import { renderContentHtml } from "@/lib/editor/render";
import { toTiptapDoc } from "@/lib/editor/doc";
import { extractHeadings, injectHeadingIds } from "@/lib/editor/toc";
import { extractCitations } from "@/lib/editor/citations";
import { SITE_URL } from "@/lib/site";
import { QuickAnswerBlock } from "@/components/article/quick-answer-block";
import { AiSummaryBlock } from "@/components/article/ai-summary-block";
import { TableOfContents } from "@/components/article/table-of-contents";
import { StatsTable } from "@/components/article/stats-table";
import { CtaBlock } from "@/components/article/cta-block";
import { FaqSection } from "@/components/article/faq-section";
import { RelatedPosts } from "@/components/article/related-posts";
import { AuthorBox } from "@/components/article/author-box";
import { SourceCitations } from "@/components/article/source-citations";
import { JsonLd } from "@/components/article/json-ld";

// Full AEO/GEO article template (Phase 5): Quick Answer, AI Summary, ToC,
// body content, Stats Tables, CTAs, FAQ, Author box, Related Posts, Source
// Citations, and the combined JSON-LD graph. Everything except the manually
// authored blocks (Quick Answer, AI Summary, FAQ, CTAs, Stats Tables) is
// derived live from the post's own content/relations rather than stored
// separately — ToC and Source Citations in particular are never persisted,
// only computed at render time from the same Tiptap doc.
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
  const { category: categorySlug, slug } = await params;
  const post = await db.query.posts.findFirst({ where: eq(posts.slug, slug) });
  if (!post || post.status !== "published") notFound();

  const [
    author,
    category,
    faqRows,
    aiSummaryRow,
    keyTakeawayRows,
    relatedPins,
    currentTagRows,
    quickAnswerRow,
    ctaRows,
    statsTableRows,
  ] = await Promise.all([
    post.authorId ? db.query.authors.findFirst({ where: eq(authors.id, post.authorId) }) : Promise.resolve(null),
    post.categoryId ? db.query.categories.findFirst({ where: eq(categories.id, post.categoryId) }) : Promise.resolve(null),
    db.query.postFaqs.findMany({ where: eq(postFaqs.postId, post.id), orderBy: (f, { asc }) => asc(f.position) }),
    db.query.postAiSummary.findFirst({ where: eq(postAiSummary.postId, post.id) }),
    db.query.postKeyTakeaways.findMany({
      where: eq(postKeyTakeaways.postId, post.id),
      orderBy: (k, { asc }) => asc(k.position),
    }),
    db
      .select({ relatedPostId: postRelated.relatedPostId })
      .from(postRelated)
      .where(eq(postRelated.postId, post.id))
      .orderBy(postRelated.position),
    db.select({ name: tags.name }).from(postTags).innerJoin(tags, eq(postTags.tagId, tags.id)).where(eq(postTags.postId, post.id)),
    db.query.postQuickAnswer.findFirst({ where: eq(postQuickAnswer.postId, post.id) }),
    db.query.postCtas.findMany({ where: eq(postCtas.postId, post.id), orderBy: (c, { asc }) => asc(c.position) }),
    db.query.postStatsTables.findMany({ where: eq(postStatsTables.postId, post.id), orderBy: (t, { asc }) => asc(t.position) }),
  ]);

  // Manual pins if the editor set any; otherwise the same scoring
  // heuristic the Internal Linking Assistant uses, computed live off the
  // published set rather than a precomputed table.
  const candidates = await getPublishedPostCandidates(post.id);
  const relatedPosts =
    relatedPins.length > 0
      ? relatedPins
          .map((pin) => candidates.find((c) => c.id === pin.relatedPostId))
          .filter((c): c is NonNullable<typeof c> => Boolean(c))
          .map((c) => ({ title: c.title, url: `/${c.categorySlug}/${c.slug}` }))
      : scoreRelatedPosts(
          { id: post.id, title: post.title, categoryId: post.categoryId, tagNames: currentTagRows.map((t) => t.name) },
          candidates,
          3,
        ).map((c) => ({ title: c.title, url: `/${c.categorySlug}/${c.slug}` }));

  const faqs = faqRows.map((f) => ({ question: f.question, answer: f.answer }));
  const postDoc = toTiptapDoc(post.content);
  const headings = extractHeadings(postDoc);
  const html = injectHeadingIds(renderContentHtml(postDoc), headings);
  const citations = extractCitations(postDoc, new URL(SITE_URL).host);

  const articleUrl = `${SITE_URL}/${categorySlug}/${slug}`;
  const authorUrl = author ? `${SITE_URL}/authors/${author.slug}` : null;
  const articleSchema = buildArticleSchema({
    headline: post.title,
    description: post.excerpt,
    url: articleUrl,
    imageUrl: post.featuredImageUrl ? new URL(post.featuredImageUrl, SITE_URL).toString() : null,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    authorName: author?.displayName,
    authorUrl,
  });
  const personSchema = author
    ? buildPersonSchema({
        name: author.displayName,
        url: authorUrl!,
        jobTitle: author.roleTitle,
        description: author.bio,
        imageUrl: author.avatarUrl ? new URL(author.avatarUrl, SITE_URL).toString() : null,
        sameAs: Object.values(author.socialLinks ?? {}),
      })
    : null;
  const breadcrumbSchema = buildBreadcrumbSchema(
    category
      ? [
          { name: "Home", url: SITE_URL },
          { name: category.name, url: `${SITE_URL}/${category.slug}` },
          { name: post.title, url: articleUrl },
        ]
      : [{ name: "Home", url: SITE_URL }, { name: post.title, url: articleUrl }],
  );

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

      <QuickAnswerBlock text={quickAnswerRow?.text ?? ""} />
      <AiSummaryBlock summary={aiSummaryRow?.summary ?? ""} takeaways={keyTakeawayRows.map((k) => k.text)} />
      <TableOfContents headings={headings} />

      <div
        className="prose prose-neutral max-w-none dark:prose-invert"
        // Safe: content is authored exclusively by authenticated admin/editor
        // roles through the Tiptap editor, never from public user input.
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {statsTableRows.map((t) => (
        <StatsTable key={t.id} title={t.title} columns={t.columns} rows={t.rows} />
      ))}

      {ctaRows.map((c) => (
        <CtaBlock key={c.id} heading={c.heading} description={c.description} buttonText={c.buttonText} buttonUrl={c.buttonUrl} />
      ))}

      <FaqSection faqs={faqs} />
      {author && (
        <AuthorBox
          displayName={author.displayName}
          slug={author.slug}
          avatarUrl={author.avatarUrl}
          roleTitle={author.roleTitle}
          bio={author.bio}
          expertiseTags={author.expertiseTags}
          socialLinks={author.socialLinks}
        />
      )}
      <RelatedPosts posts={relatedPosts} />
      <SourceCitations citations={citations} />
      <JsonLd blocks={[articleSchema, breadcrumbSchema, personSchema, buildFaqSchema(faqs)]} />
    </article>
  );
}
