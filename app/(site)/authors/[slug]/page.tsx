import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { authors, posts, categories } from "@/lib/db/schema";
import { buildPersonSchema } from "@/lib/seo/jsonld";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/article/json-ld";

// Safety-net ISR ceiling — lib/actions/authors.ts already revalidates this
// exact path on mutations; this is the fallback if one is missed.
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = await db.query.authors.findFirst({ where: eq(authors.slug, slug) });
  return { title: author?.displayName ?? "Author", description: author?.bio ?? undefined };
}

export default async function AuthorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const author = await db.query.authors.findFirst({ where: eq(authors.slug, slug) });
  if (!author) notFound();

  const [authoredPosts, allCategories] = await Promise.all([
    db.query.posts.findMany({
      where: and(eq(posts.authorId, author.id), eq(posts.status, "published")),
      orderBy: (p, { desc }) => desc(p.publishedAt),
    }),
    db.select().from(categories),
  ]);
  const categorySlugById = new Map(allCategories.map((c) => [c.id, c.slug]));

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
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center gap-4">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-muted">
          {author.avatarUrl ? (
            <Image src={author.avatarUrl} alt={author.displayName} fill unoptimized className="object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-xl font-semibold text-muted-foreground">
              {author.displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-semibold">{author.displayName}</h1>
          {author.roleTitle && <p className="mt-1 text-muted-foreground">{author.roleTitle}</p>}
        </div>
      </div>

      {author.bio && <p className="mt-6">{author.bio}</p>}

      {author.expertiseTags && author.expertiseTags.length > 0 && (
        <p className="mt-3 text-sm text-muted-foreground">Expertise: {author.expertiseTags.join(", ")}</p>
      )}

      {links.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-4">
          {links.map(([key, url]) => (
            <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline">
              {key}
            </a>
          ))}
        </div>
      )}

      <h2 className="mt-10 mb-4 text-xl font-semibold">Articles</h2>
      {authoredPosts.length === 0 ? (
        <p className="text-muted-foreground">No published articles yet.</p>
      ) : (
        <ul className="space-y-2">
          {authoredPosts
            .filter((p) => p.categoryId && categorySlugById.has(p.categoryId))
            .map((p) => (
              <li key={p.id}>
                <Link href={`/${categorySlugById.get(p.categoryId!)}/${p.slug}`} className="font-medium hover:underline">
                  {p.title}
                </Link>
              </li>
            ))}
        </ul>
      )}

      <JsonLd blocks={[personSchema]} />
    </div>
  );
}
