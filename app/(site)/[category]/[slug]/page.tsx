import { eq, and, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Clock } from "lucide-react";
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
  comments,
} from "@/lib/db/schema";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildFaqSchema, buildArticleSchema, buildBreadcrumbSchema, buildPersonSchema } from "@/lib/seo/jsonld";
import { getPublishedPostCandidates } from "@/lib/seo/related-candidates";
import { scoreRelatedPosts } from "@/lib/seo/related";
import { getPostSummariesByIds } from "@/lib/posts/post-summary";
import { getCategoryMeta } from "@/lib/site-categories";
import { renderContentHtml } from "@/lib/editor/render";
import { toTiptapDoc } from "@/lib/editor/doc";
import { extractHeadings, injectHeadingIds } from "@/lib/editor/toc";
import { extractCitations } from "@/lib/editor/citations";
import { SITE_URL } from "@/lib/site";
import { AuthorAvatar } from "@/components/site/author-avatar";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { QuickAnswerBlock } from "@/components/article/quick-answer-block";
import { AiSummaryBlock } from "@/components/article/ai-summary-block";
import { TableOfContents } from "@/components/article/table-of-contents";
import { StatsTable } from "@/components/article/stats-table";
import { CtaBlock } from "@/components/article/cta-block";
import { FaqSection } from "@/components/article/faq-section";
import { RelatedPosts } from "@/components/article/related-posts";
import { AuthorBox } from "@/components/article/author-box";
import { SourceCitations } from "@/components/article/source-citations";
import { CommentsSection } from "@/components/article/comments-section";
import { JsonLd } from "@/components/article/json-ld";

// Safety-net ISR ceiling — lib/actions/posts.ts already revalidates this
// exact path on publish/edit/delete; this is the fallback if one is missed.
export const revalidate = 3600;

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
  if (!post || post.status !== "published" || post.deletedAt) {
    return { title: "Not found", robots: { index: false, follow: true } };
  }

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
  // `deletedAt` is a separate soft-delete flag from `status` (see the schema
  // comment on posts.deletedAt) — a trashed post keeps whatever `status` it
  // had before being trashed, so checking `status !== "published"` alone
  // isn't enough to keep a trashed-but-still-"published" post off its own
  // URL.
  if (!post || post.status !== "published" || post.deletedAt) notFound();

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
    approvedComments,
  ] = await Promise.all([
    // `deletedAt` is separate from a status field authors/categories don't
    // have — a trashed author just drops the byline (see the `author &&`
    // guards below) and a trashed category just drops the badge/breadcrumb
    // entry (see the `category ? ... : null` below), the same graceful
    // fallback already used when a post simply has no author/category set.
    post.authorId
      ? db.query.authors.findFirst({ where: and(eq(authors.id, post.authorId), isNull(authors.deletedAt)) })
      : Promise.resolve(null),
    post.categoryId
      ? db.query.categories.findFirst({ where: and(eq(categories.id, post.categoryId), isNull(categories.deletedAt)) })
      : Promise.resolve(null),
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
    db.query.comments.findMany({
      where: and(eq(comments.postId, post.id), eq(comments.status, "approved")),
      orderBy: (c, { asc }) => asc(c.createdAt),
    }),
  ]);

  // Manual pins if the editor set any; otherwise the same scoring
  // heuristic the Internal Linking Assistant uses, computed live off the
  // published set rather than a precomputed table. Only the ids are taken
  // from this pass — full card data (image/excerpt/reading time) for the
  // final short list comes from a second, cheap query below, so the
  // candidate-scoring query itself doesn't need to carry that payload for
  // every published post on the site.
  const candidates = await getPublishedPostCandidates(post.id);
  const relatedPostIds =
    relatedPins.length > 0
      ? relatedPins.map((pin) => pin.relatedPostId).filter((id) => candidates.some((c) => c.id === id))
      : scoreRelatedPosts(
          { id: post.id, title: post.title, categoryId: post.categoryId, tagNames: currentTagRows.map((t) => t.name) },
          candidates,
          4,
        ).map((c) => c.id);
  const relatedPosts = await getPostSummariesByIds(relatedPostIds);

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

  const category_ = category ? getCategoryMeta(category.slug, category.name) : null;
  const CategoryIcon = category_?.icon;

  return (
    <article>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-12">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            ...(category_ ? [{ label: category_.label, href: `/${category_.slug}` }] : []),
            { label: post.title },
          ]}
        />

        {category_ && (
          <Link
            href={`/${category_.slug}`}
            className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand"
          >
            {CategoryIcon && <CategoryIcon className="size-3.5" />}
            {category_.label}
          </Link>
        )}

        <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">{post.title}</h1>

        <div className="mt-4 mb-8 flex items-center gap-2.5 text-sm text-muted-foreground">
          {author && (
            <>
              <AuthorAvatar displayName={author.displayName} avatarUrl={author.avatarUrl} size="size-8" />
              <Link href={`/authors/${author.slug}`} className="font-medium text-foreground hover:text-brand">
                {author.displayName}
              </Link>
              <span aria-hidden>·</span>
            </>
          )}
          {post.publishedAt && <span>{new Date(post.publishedAt).toLocaleDateString()}</span>}
          {post.readingTimeMinutes && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              {post.readingTimeMinutes} min read
            </span>
          )}
        </div>

        {/* Sized to the reading column, not full-bleed — a full-viewport
           banner (edge to edge, above the breadcrumb/title) made the
           image render far larger than the text it's illustrating,
           especially with a portrait or otherwise unpredictable source
           photo (e.g. this dataset's placeholder image, cropped to a wide
           16:7 banner, exaggerating a close-up into something illegible).
           Posts without one skip this entirely, same as before. */}
        {post.featuredImageUrl && (
          <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-muted">
            <Image
              src={post.featuredImageUrl}
              alt=""
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        <QuickAnswerBlock text={quickAnswerRow?.text ?? ""} />
        <AiSummaryBlock summary={aiSummaryRow?.summary ?? ""} takeaways={keyTakeawayRows.map((k) => k.text)} />
        <TableOfContents headings={headings} />

        <div
          // `prose-img:w-full` because the Tiptap image extension emits a
          // bare `<img src alt>` with no width/height — Typography's own
          // default only caps images at the column width (`max-width:100%`),
          // it doesn't scale a *smaller* source image up to fill it, so an
          // upload narrower than the content column (a portrait photo, say)
          // renders at its native pixel width instead of spanning the
          // column like the cover image above it does. `aspect-video` +
          // `object-cover` pins that stretched width to a fixed 16:9 box
          // (cropping, not squashing) — width alone made a portrait source
          // grow proportionally *taller* as it stretched wider, since
          // nothing was constraining the other dimension.
          className="prose prose-neutral max-w-none prose-headings:font-heading prose-a:text-brand prose-a:no-underline prose-a:hover:underline prose-img:aspect-video prose-img:w-full prose-img:rounded-xl prose-img:object-cover dark:prose-invert"
          // Safe: content is authored exclusively by authenticated admin/editor
          // roles through the Tiptap editor, never from public user input.
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {statsTableRows.map((t) => (
          <StatsTable key={t.id} title={t.title} columns={t.columns} rows={t.rows} />
        ))}

        {ctaRows.map((c) => (
          <CtaBlock
            key={c.id}
            id={c.id}
            heading={c.heading}
            description={c.description}
            buttonText={c.buttonText}
            buttonUrl={c.buttonUrl}
          />
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
        <CommentsSection postId={post.id} comments={approvedComments} />
        <JsonLd blocks={[articleSchema, breadcrumbSchema, personSchema, buildFaqSchema(faqs)]} />
      </div>
    </article>
  );
}
