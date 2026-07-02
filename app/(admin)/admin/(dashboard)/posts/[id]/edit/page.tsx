import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, authors, categories } from "@/lib/db/schema";
import { PostForm } from "../../post-form";
import { updatePost } from "@/lib/actions/posts";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, authorRows, categoryRows] = await Promise.all([
    db.query.posts.findFirst({ where: eq(posts.id, id) }),
    db.select().from(authors),
    db.select().from(categories),
  ]);
  if (!post) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit post</h1>
      <PostForm action={updatePost.bind(null, id)} defaultValues={post} authors={authorRows} categories={categoryRows} />
    </div>
  );
}
