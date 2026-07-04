import { notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, authors, categories, seoMeta, tags, postTags } from "@/lib/db/schema";
import { PostForm } from "../../post-form";
import { updatePost } from "@/lib/actions/posts";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, authorRows, categoryRows, seo, tagRows] = await Promise.all([
    db.query.posts.findFirst({ where: eq(posts.id, id) }),
    db.select().from(authors),
    db.select().from(categories),
    db.query.seoMeta.findFirst({ where: and(eq(seoMeta.entityType, "post"), eq(seoMeta.entityId, id)) }),
    db.select({ name: tags.name }).from(postTags).innerJoin(tags, eq(postTags.tagId, tags.id)).where(eq(postTags.postId, id)),
  ]);
  if (!post) notFound();

  return (
    <PostForm
      action={updatePost.bind(null, id)}
      defaultValues={{ ...post, seo, tags: tagRows.map((t) => t.name) }}
      authors={authorRows}
      categories={categoryRows}
    />
  );
}
