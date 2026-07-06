import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { categories, posts } from "@/lib/db/schema";
import { getPublishedPageBySlug } from "@/lib/pages/get-page";
import { buildMetadata } from "@/lib/seo/metadata";
import { CmsPageBody } from "@/components/site/cms-page";

// Safety-net ISR ceiling — lib/actions/posts.ts and lib/actions/categories.ts
// already revalidate this path on relevant mutations; this is the fallback.
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await db.query.categories.findFirst({ where: eq(categories.slug, slug) });
  if (category) return { title: category.name };

  // A category and a CMS page share this same single-segment URL space
  // (categories own the four hardcoded slugs — about/contact/
  // responsible-gaming/editorial-policy — via their own literal routes,
  // which Next resolves before ever reaching this dynamic one; this branch
  // only ever sees custom page slugs).
  const pageResult = await getPublishedPageBySlug(slug);
  if (pageResult) {
    return buildMetadata({ seo: pageResult.seo, fallbackTitle: pageResult.page.title, path: `/${slug}` });
  }

  return { title: "Not found" };
}

export default async function CategoryOrPageRoute({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = await db.query.categories.findFirst({ where: eq(categories.slug, slug) });

  if (!category) {
    const pageResult = await getPublishedPageBySlug(slug);
    if (!pageResult) notFound();
    return <CmsPageBody title={pageResult.page.title} content={pageResult.page.content} />;
  }

  const categoryPosts = await db.query.posts.findMany({
    where: and(eq(posts.categoryId, category.id), eq(posts.status, "published")),
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
