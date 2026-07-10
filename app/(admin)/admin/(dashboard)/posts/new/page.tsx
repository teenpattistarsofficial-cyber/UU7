import { isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { authors, categories } from "@/lib/db/schema";
import { PostForm } from "../post-form";
import { createPost } from "@/lib/actions/posts";

// No params/searchParams here for Next to infer dynamic rendering from, so
// without this, `next build` tries to statically prerender it — which runs
// live DB queries at build time with no DATABASE_URL available (see the
// Dockerfile's comment on this exact failure mode).
export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  // Trashed authors/categories are excluded from these dropdowns — a brand
  // new post has no existing selection to preserve, so there's no reason
  // to offer either as an option here.
  const [authorRows, categoryRows] = await Promise.all([
    db.select().from(authors).where(isNull(authors.deletedAt)),
    db.select().from(categories).where(isNull(categories.deletedAt)),
  ]);

  return <PostForm action={createPost} authors={authorRows} categories={categoryRows} />;
}
