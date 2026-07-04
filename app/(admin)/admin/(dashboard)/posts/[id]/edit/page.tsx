import { notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
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
    db.select().from(authors),
    db.select().from(categories),
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
