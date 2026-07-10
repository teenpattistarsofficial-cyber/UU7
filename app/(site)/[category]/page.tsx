import { and, desc, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { categories, posts, seoMeta } from "@/lib/db/schema";
import { getPublishedPageBySlug } from "@/lib/pages/get-page";
import { buildMetadata } from "@/lib/seo/metadata";
import { getCategoryMeta } from "@/lib/site-categories";
import { CmsPageBody } from "@/components/site/cms-page";
import { CategoryGuideSearch } from "@/components/site/category-guide-search";
import { Breadcrumb } from "@/components/site/breadcrumb";

// Safety-net ISR ceiling — lib/actions/posts.ts and lib/actions/categories.ts
// already revalidate this path on relevant mutations; this is the fallback.
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  // `deletedAt` is separate from a status field categories don't have — a
  // trashed category must be excluded explicitly so this falls through to
  // notFound() the same way a trashed page/post already does.
  const category = await db.query.categories.findFirst({
    where: and(eq(categories.slug, slug), isNull(categories.deletedAt)),
  });
  if (category) {
    const seo = await db.query.seoMeta.findFirst({
      where: and(eq(seoMeta.entityType, "category"), eq(seoMeta.entityId, category.id)),
    });
    return buildMetadata({
      seo,
      fallbackTitle: category.name,
      fallbackDescription: category.description,
      path: `/${slug}`,
    });
  }

  // A category and a CMS page share this same single-segment URL space
  // (categories own the four hardcoded slugs — about/contact/
  // responsible-gaming/editorial-policy — via their own literal routes,
  // which Next resolves before ever reaching this dynamic one; this branch
  // only ever sees custom page slugs).
  const pageResult = await getPublishedPageBySlug(slug);
  if (pageResult) {
    return buildMetadata({ seo: pageResult.seo, fallbackTitle: pageResult.page.title, path: `/${slug}` });
  }

  return { title: "Not found", robots: { index: false, follow: true } };
}

export default async function CategoryOrPageRoute({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  // `deletedAt` is separate from a status field categories don't have — a
  // trashed category must be excluded explicitly so this falls through to
  // notFound() the same way a trashed page/post already does.
  const category = await db.query.categories.findFirst({
    where: and(eq(categories.slug, slug), isNull(categories.deletedAt)),
  });

  if (!category) {
    const pageResult = await getPublishedPageBySlug(slug);
    if (!pageResult) notFound();
    return <CmsPageBody title={pageResult.page.title} content={pageResult.page.content} />;
  }

  const categoryPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      featuredImageUrl: posts.featuredImageUrl,
      readingTimeMinutes: posts.readingTimeMinutes,
    })
    .from(posts)
    // `deletedAt` is separate from `status` — a trashed post keeps its
    // prior status, so it must be excluded explicitly here too.
    .where(and(eq(posts.categoryId, category.id), eq(posts.status, "published"), isNull(posts.deletedAt)))
    .orderBy(desc(posts.publishedAt));

  // The whole listing is one category, so every card can reuse its
  // name/slug directly rather than joining `categories` back in per row
  // the way the homepage's cross-category sections have to.
  const meta = getCategoryMeta(category.slug, category.name);
  const Icon = meta.icon;
  const cards = categoryPosts.map((p) => ({
    id: p.id,
    title: p.title,
    excerpt: p.excerpt,
    url: `/${category.slug}/${p.slug}`,
    categorySlug: category.slug,
    categoryName: category.name,
    featuredImageUrl: p.featuredImageUrl,
    readingTimeMinutes: p.readingTimeMinutes,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: category.name }]} />

      <div className="mb-10 flex items-start gap-4">
        {Icon && (
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <Icon className="size-6" />
          </span>
        )}
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">{category.name}</h1>
          {category.description && <p className="mt-2 max-w-2xl text-muted-foreground">{category.description}</p>}
        </div>
      </div>

      {cards.length === 0 ? (
        <p className="text-muted-foreground">No published posts in this category yet.</p>
      ) : (
        <CategoryGuideSearch posts={cards} />
      )}
    </div>
  );
}
