import { notFound, permanentRedirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Clock } from "lucide-react";
import { getPostPageData } from "@/lib/posts/get-post-page-data";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildFaqSchema, buildArticleSchema, buildBreadcrumbSchema, buildPersonSchema } from "@/lib/seo/jsonld";
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

// `featuredImageUrl`/`avatarUrl` are free-text fields (uploaded, pasted, or
// written by an external content source like the raw-content publish API),
// not validated as well-formed URLs at write time — `new URL()` throws a
// TypeError on anything malformed, which would otherwise take down the
// entire page for one bad stored value. Falls back to omitting the image
// from JSON-LD rather than crashing, matching this codebase's existing
// philosophy elsewhere (e.g. a trashed author's post renders without a
// byline instead of breaking).
function toAbsoluteUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url, SITE_URL).toString();
  } catch {
    return null;
  }
}

// Safety-net ISR ceiling — lib/actions/posts.ts already revalidates this
// exact path on publish/edit/delete; this is the fallback if one is missed.
export const revalidate = 3600;

// Required for this dynamic-segment route to be ISR-eligible at all —
// per Next's own docs, a dynamic segment with no generateStaticParams
// export is dynamically rendered unconditionally, regardless of the
// `revalidate` export above. Returning an empty array means "prerender
// nothing at build time" (no DATABASE_URL needed then), while
// `dynamicParams` defaults to true, so any real post is rendered — and
// cached — the first time it's actually visited.
export async function generateStaticParams() {
  return [];
}

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
  const data = await getPostPageData(slug);
  if (!data) {
    return { title: "Not found", robots: { index: false, follow: true } };
  }

  return buildMetadata({
    seo: data.seo,
    fallbackTitle: data.post.title,
    fallbackDescription: data.post.excerpt,
    fallbackImage: data.post.featuredImageUrl,
    path: `/${category}/${slug}`,
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category: categorySlug, slug } = await params;
  const data = await getPostPageData(slug);
  // `deletedAt` is a separate soft-delete flag from `status` (see the schema
  // comment on posts.deletedAt) — a trashed post keeps whatever `status` it
  // had before being trashed, so getPostPageData's own
  // `status !== "published" || deletedAt` check (mirrored here as "data is
  // null") is what actually keeps a trashed-but-still-"published" post off
  // its own URL.
  if (!data) notFound();
  const {
    post,
    author,
    category,
    faqRows,
    aiSummaryRow,
    keyTakeawayRows,
    quickAnswerRow,
    ctaRows,
    statsTableRows,
    approvedComments,
    featuredMedia,
    relatedPosts,
  } = data;

  // getPostPageData looks up the post by slug alone, ignoring the URL's own
  // category segment entirely — so a link to the wrong category (a typo, a
  // stale link, or an AI-authored link guessing a bad prefix like `/blog/`)
  // still resolves to a real post instead of 404ing. Canonicalize onto the
  // post's real category URL rather than silently rendering under whichever
  // segment was requested. Uncategorized posts (`category === null`) have no
  // "correct" segment to redirect to, so they're left rendering as before.
  if (category && category.slug !== categorySlug) {
    permanentRedirect(`/${category.slug}/${slug}`);
  }

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
    imageUrl: toAbsoluteUrl(post.featuredImageUrl),
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
        imageUrl: toAbsoluteUrl(author.avatarUrl),
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
              alt={featuredMedia?.alt || post.title}
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
