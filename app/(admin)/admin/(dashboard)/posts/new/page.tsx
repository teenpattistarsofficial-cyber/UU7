import { db } from "@/lib/db";
import { authors, categories } from "@/lib/db/schema";
import { PostForm } from "../post-form";
import { createPost } from "@/lib/actions/posts";

export default async function NewPostPage() {
  const [authorRows, categoryRows] = await Promise.all([
    db.select().from(authors),
    db.select().from(categories),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New post</h1>
      <PostForm action={createPost} authors={authorRows} categories={categoryRows} />
    </div>
  );
}
