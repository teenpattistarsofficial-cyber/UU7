import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, categories } from "@/lib/db/schema";
import { getFeaturedGuides, getPopularGames, getHomepageFaqs } from "@/lib/home/featured-content";
import { Hero } from "@/components/home/hero";
import { FeaturedGuides } from "@/components/home/featured-guides";
import { PopularGames } from "@/components/home/popular-games";
import { HomepageFaqs } from "@/components/home/homepage-faqs";

// This route has no params, so without `force-dynamic` Next would try to
// statically prerender it (including at `next build` time, requiring a
// live DATABASE_URL in the Docker build). lib/actions/posts.ts already
// revalidates "/" on every post publish/edit/delete for immediacy — this
// just ensures every other request reflects the DB directly too.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [latestPosts, featuredGuides, popularGames, homepageFaqs] = await Promise.all([
    db
      .select({ id: posts.id, title: posts.title, slug: posts.slug, categorySlug: categories.slug })
      .from(posts)
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .where(eq(posts.status, "published"))
      .orderBy(desc(posts.publishedAt))
      .limit(6),
    getFeaturedGuides(),
    getPopularGames(),
    getHomepageFaqs(),
  ]);

  return (
    <>
      <Hero />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <FeaturedGuides posts={featuredGuides} />
        <PopularGames games={popularGames} />

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

        <HomepageFaqs faqs={homepageFaqs} />

        {/* Trending Articles is deliberately not built — a real "trending"
            signal needs actual pageview data (Phase 7 Analytics, currently
            paused). See docs/seo-content-strategy-plan.md §8. */}
      </div>
    </>
  );
}
