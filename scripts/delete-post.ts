import { db } from "@/lib/db";
import { posts, seoMeta, postQuickAnswer, postAiSummary, postKeyTakeaways, postFaqs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// Throwaway helper: deletes a post + its dependent SEO/AEO rows by slug so a
// create-*.ts script's `existing` check doesn't skip re-applying edits.
// Usage: npx tsx --env-file=.env.local scripts/delete-post.ts <slug>

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.log("Usage: delete-post.ts <slug>");
    process.exit(1);
  }
  const post = await db.query.posts.findFirst({ where: eq(posts.slug, slug) });
  if (!post) {
    console.log("not found:", slug);
    process.exit(0);
  }
  await db.delete(seoMeta).where(and(eq(seoMeta.entityType, "post"), eq(seoMeta.entityId, post.id)));
  await db.delete(postQuickAnswer).where(eq(postQuickAnswer.postId, post.id));
  await db.delete(postAiSummary).where(eq(postAiSummary.postId, post.id));
  await db.delete(postKeyTakeaways).where(eq(postKeyTakeaways.postId, post.id));
  await db.delete(postFaqs).where(eq(postFaqs.postId, post.id));
  await db.delete(posts).where(eq(posts.id, post.id));
  console.log("deleted", slug, post.id);
  process.exit(0);
}
main();
