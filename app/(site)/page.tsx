import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, categories } from "@/lib/db/schema";
import { Input } from "@/components/ui/input";

export default async function HomePage() {
  const latestPosts = await db
    .select({ id: posts.id, title: posts.title, slug: posts.slug, categorySlug: categories.slug })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.publishedAt))
    .limit(6);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <section className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-semibold tracking-tight">
          Gaming guides you can actually trust
        </h1>
        <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
          Game guides, betting guides, bonus breakdowns, tutorials, and gaming statistics —
          researched and reviewed.
        </p>
        <form action="/search" className="mx-auto flex max-w-md gap-2">
          <Input name="q" placeholder="Search guides…" />
        </form>
      </section>

      <section className="mb-16">
        <h2 className="mb-4 text-xl font-semibold">Latest posts</h2>
        {latestPosts.length === 0 ? (
          <p className="text-muted-foreground">No published posts yet — check back soon.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((p) => (
              <Link
                key={p.id}
                href={`/${p.categorySlug ?? "posts"}/${p.slug}`}
                className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <h3 className="font-medium">{p.title}</h3>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured guides, trending articles, popular games, and FAQs land in
          Phase 5 once there is enough published content and the full
          article/AEO template to power them. */}
    </div>
  );
}
