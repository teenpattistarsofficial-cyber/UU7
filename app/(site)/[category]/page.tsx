import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { categories, posts } from "@/lib/db/schema";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await db.query.categories.findFirst({ where: eq(categories.slug, categorySlug) });
  return { title: category?.name ?? "Category" };
}

export default async function CategoryArchivePage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categorySlug } = await params;
  const category = await db.query.categories.findFirst({ where: eq(categories.slug, categorySlug) });
  if (!category) notFound();

  const categoryPosts = await db.query.posts.findMany({
    where: eq(posts.categoryId, category.id),
    orderBy: (p, { desc }) => desc(p.publishedAt),
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-semibold">{category.name}</h1>
      {category.description && <p className="mb-8 text-muted-foreground">{category.description}</p>}

      {categoryPosts.length === 0 ? (
        <p className="text-muted-foreground">No published posts in this category yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {categoryPosts.map((p) => (
            <Link key={p.id} href={`/${category.slug}/${p.slug}`} className="rounded-lg border p-4 hover:bg-muted/50">
              <h2 className="font-medium">{p.title}</h2>
              {p.excerpt && <p className="mt-1 text-sm text-muted-foreground">{p.excerpt}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
