import { notFound } from "next/navigation";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  posts,
  authors,
  categories,
  seoMeta,
  tags,
  postTags,
  postFaqs,
  postAiSummary,
  postKeyTakeaways,
  postRelated,
  postQuickAnswer,
  postCtas,
  postStatsTables,
} from "@/lib/db/schema";
import { PostForm } from "../../post-form";
import { updatePost } from "@/lib/actions/posts";

// Dynamic segments without generateStaticParams are normally safe from
// build-time prerendering by default, but every other implicit signal in
// this codebase turned out unreliable under this Next.js/Turbopack build
// (see the Dockerfile's comment on this failure mode) — being explicit here
// too rather than relying on that default.
export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [
    post,
    authorRows,
    categoryRows,
    seo,
    tagRows,
    faqRows,
    aiSummaryRow,
    keyTakeawayRows,
    relatedRows,
    quickAnswerRow,
    ctaRows,
    statsTableRows,
  ] = await Promise.all([
    db.query.posts.findFirst({ where: eq(posts.id, id) }),
    // Authors are deliberately NOT filtered here — unlike categories,
    // nothing blocks trashing an author that a live post still references
    // (see lib/actions/authors.ts), so this post's own current author could
    // legitimately be trashed; excluding it would drop it from this select
    // silently. Categories can't have that problem — lib/actions/categories.ts
    // blocks trashing one while any live post still points at it — so
    // excluding trashed categories here is safe.
    db.select().from(authors),
    db.select().from(categories).where(isNull(categories.deletedAt)),
    db.query.seoMeta.findFirst({ where: and(eq(seoMeta.entityType, "post"), eq(seoMeta.entityId, id)) }),
    db.select({ name: tags.name }).from(postTags).innerJoin(tags, eq(postTags.tagId, tags.id)).where(eq(postTags.postId, id)),
    db.query.postFaqs.findMany({ where: eq(postFaqs.postId, id), orderBy: (f, { asc }) => asc(f.position) }),
    db.query.postAiSummary.findFirst({ where: eq(postAiSummary.postId, id) }),
    db.query.postKeyTakeaways.findMany({ where: eq(postKeyTakeaways.postId, id), orderBy: (k, { asc }) => asc(k.position) }),
    db
      .select({ relatedPostId: postRelated.relatedPostId, title: posts.title })
      .from(postRelated)
      .innerJoin(posts, eq(postRelated.relatedPostId, posts.id))
      .where(eq(postRelated.postId, id))
      .orderBy(postRelated.position),
    db.query.postQuickAnswer.findFirst({ where: eq(postQuickAnswer.postId, id) }),
    db.query.postCtas.findMany({ where: eq(postCtas.postId, id), orderBy: (c, { asc }) => asc(c.position) }),
    db.query.postStatsTables.findMany({ where: eq(postStatsTables.postId, id), orderBy: (t, { asc }) => asc(t.position) }),
  ]);
  if (!post) notFound();

  return (
    <PostForm
      action={updatePost.bind(null, id)}
      defaultValues={{
        ...post,
        seo,
        tags: tagRows.map((t) => t.name),
        faqs: faqRows.map((f) => ({ question: f.question, answer: f.answer })),
        aiSummary: aiSummaryRow?.summary ?? "",
        keyTakeaways: keyTakeawayRows.map((k) => k.text),
        relatedPosts: relatedRows.map((r) => ({ id: r.relatedPostId, title: r.title })),
        quickAnswer: quickAnswerRow?.text ?? "",
        ctas: ctaRows.map((c) => ({
          heading: c.heading,
          description: c.description ?? "",
          buttonText: c.buttonText,
          buttonUrl: c.buttonUrl,
        })),
        statsTables: statsTableRows.map((t) => ({ title: t.title, columns: t.columns, rows: t.rows })),
      }}
      authors={authorRows}
      categories={categoryRows}
    />
  );
}
