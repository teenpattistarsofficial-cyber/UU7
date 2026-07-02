import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { authors, posts } from "@/lib/db/schema";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = await db.query.authors.findFirst({ where: eq(authors.slug, slug) });
  return { title: author?.displayName ?? "Author" };
}

export default async function AuthorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const author = await db.query.authors.findFirst({ where: eq(authors.slug, slug) });
  if (!author) notFound();

  const authoredPosts = await db.query.posts.findMany({
    where: eq(posts.authorId, author.id),
    orderBy: (p, { desc }) => desc(p.publishedAt),
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">{author.displayName}</h1>
      {author.roleTitle && <p className="mt-1 text-muted-foreground">{author.roleTitle}</p>}
      {author.bio && <p className="mt-4">{author.bio}</p>}

      <h2 className="mt-10 mb-4 text-xl font-semibold">Articles</h2>
      {authoredPosts.length === 0 ? (
        <p className="text-muted-foreground">No published articles yet.</p>
      ) : (
        <ul className="space-y-2">
          {authoredPosts.map((p) => (
            <li key={p.id}>{p.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
