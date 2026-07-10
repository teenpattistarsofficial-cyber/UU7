import { isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { authors, categories } from "@/lib/db/schema";
import { PostForm } from "../post-form";
import { createPost } from "@/lib/actions/posts";

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
