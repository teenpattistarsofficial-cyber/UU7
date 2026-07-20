import { eq, and, desc, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Globe, Link2 } from "lucide-react";
import { db } from "@/lib/db";
import { authors, posts, categories, media } from "@/lib/db/schema";
import { buildPersonSchema } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/article/json-ld";
import { AuthorAvatar } from "@/components/site/author-avatar";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { AuthorArticles } from "@/components/site/author-articles";

const SOCIAL_LABELS: Record<string, string> = {
  twitter: "Twitter/X",
  x: "Twitter/X",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  telegram: "Telegram",
  website: "Website",
};

// Safety-net ISR ceiling — lib/actions/authors.ts already revalidates this
// exact path on mutations; this is the fallback if one is missed.
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // `deletedAt` is separate from a status field authors don't have — a
  // trashed author must be excluded explicitly so this correctly 404s.
  const author = await db.query.authors.findFirst({
    where: and(eq(authors.slug, slug), isNull(authors.deletedAt)),
  });
  if (!author) return { title: "Not found", robots: { index: false, follow: true } };

  // No manual SEO panel for authors (unlike posts/pages/categories) — a
  // bio page is more of an E-E-A-T/trust signal than something worth
  // hand-tuning a meta title for, so this is auto-generated from the
  // fields the admin already has: bio as the description, avatar as the
  // social preview image (`seo: null` since there's no seo_meta row to
  // read — buildMetadata falls back to these entirely).
  return buildMetadata({
    seo: null,
    fallbackTitle: author.displayName,
    fallbackDescription: author.bio,
    fallbackImage: author.avatarUrl,
    path: `/authors/${slug}`,
  });
}

export default async function AuthorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // `deletedAt` is separate from a status field authors don't have — a
  // trashed author must be excluded explicitly so this correctly 404s.
  const author = await db.query.authors.findFirst({
    where: and(eq(authors.slug, slug), isNull(authors.deletedAt)),
  });
  if (!author) notFound();

  const [authoredPosts, allCategories] = await Promise.all([
    db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        categoryId: posts.categoryId,
        featuredImageUrl: posts.featuredImageUrl,
        featuredImageAlt: media.alt,
        readingTimeMinutes: posts.readingTimeMinutes,
      })
      .from(posts)
      .leftJoin(media, eq(media.url, posts.featuredImageUrl))
      // `deletedAt` is separate from `status` — a trashed post keeps its
      // prior status, so it must be excluded explicitly here too.
      .where(and(eq(posts.authorId, author.id), eq(posts.status, "published"), isNull(posts.deletedAt)))
      .orderBy(desc(posts.publishedAt)),
    db.select().from(categories).where(isNull(categories.deletedAt)),
  ]);
  const categoryById = new Map(allCategories.map((c) => [c.id, c]));
  const cards = authoredPosts
    .map((p) => {
      const category = p.categoryId ? categoryById.get(p.categoryId) : null;
      if (!category) return null;
      return {
        id: p.id,
        title: p.title,
        excerpt: p.excerpt,
        url: `/${category.slug}/${p.slug}`,
        categorySlug: category.slug,
        categoryName: category.name,
        featuredImageUrl: p.featuredImageUrl,
        featuredImageAlt: p.featuredImageAlt,
        readingTimeMinutes: p.readingTimeMinutes,
      };
    })
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const links = Object.entries(author.socialLinks ?? {}).filter(([, url]) => url);
  const authorUrl = `${SITE_URL}/authors/${author.slug}`;
  const personSchema = buildPersonSchema({
    name: author.displayName,
    url: authorUrl,
    jobTitle: author.roleTitle,
    description: author.bio,
    imageUrl: author.avatarUrl ? new URL(author.avatarUrl, SITE_URL).toString() : null,
    sameAs: links.map(([, url]) => url),
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Authors", href: "/authors" }, { label: author.displayName }]} />

      <div className="flex items-center gap-5">
        <AuthorAvatar displayName={author.displayName} avatarUrl={author.avatarUrl} size="size-20 text-2xl" />
        <div>
          <p className="mb-1 text-xs font-semibold tracking-[0.2em] text-brand uppercase">Written by</p>
          <h1 className="font-heading text-3xl font-bold tracking-tight">{author.displayName}</h1>
          {author.roleTitle && <p className="mt-1 text-muted-foreground">{author.roleTitle}</p>}
        </div>
      </div>

      {author.bio && <p className="mt-6 max-w-2xl leading-relaxed">{author.bio}</p>}

      {author.expertiseTags && author.expertiseTags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {author.expertiseTags.map((tag) => (
            <Badge key={tag} variant="outline" className="font-normal text-muted-foreground">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {links.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {links.map(([key, url]) => {
            const Icon = key.toLowerCase() === "website" ? Globe : Link2;
            return (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-brand/40 hover:text-brand"
              >
                <Icon className="size-3.5" />
                {SOCIAL_LABELS[key.toLowerCase()] ?? key}
              </a>
            );
          })}
        </div>
      )}

      <h2 className="mt-12 mb-5 font-heading text-xl font-bold">Articles</h2>
      {cards.length === 0 ? (
        <p className="text-muted-foreground">No published articles yet.</p>
      ) : (
        <AuthorArticles posts={cards} />
      )}

      <JsonLd blocks={[personSchema]} />
    </div>
  );
}
