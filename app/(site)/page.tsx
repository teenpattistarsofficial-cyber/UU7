import { getFeaturedGuides, getPopularGames, getCategoryOverview, getHomepageFaqs, getLatestPosts } from "@/lib/home/featured-content";
import { Hero } from "@/components/home/hero";
import { FeaturedGuides } from "@/components/home/featured-guides";
import { PopularGames } from "@/components/home/popular-games";
import { BrowseCategories } from "@/components/home/browse-categories";
import { LatestPosts } from "@/components/home/latest-posts";
import { AboutSection } from "@/components/home/about-section";
import { HomepageFaqs } from "@/components/home/homepage-faqs";
import { SiteCta } from "@/components/home/site-cta";

// Back to force-dynamic — briefly tried switching this to a plain
// `revalidate = 3600` now that every function below is unstable_cache-
// wrapped, matching [category]/page.tsx and [category]/[slug]/page.tsx.
// Those two get away with it because their dynamic segment lets
// `generateStaticParams() { return [] }` tell Next "render zero paths at
// build time, cache real ones on first visit" — the escape hatch that
// avoids needing a live DATABASE_URL during the Docker build (see this
// Dockerfile's own comment on the builder stage). The homepage has no
// dynamic segment for that trick to attach to, so a bare `revalidate`
// export makes Next attempt to fully prerender "/" at build time instead
// — confirmed by an actual production build failure ("Error: DATABASE_URL
// is not set" during `next build`), not just a theoretical concern.
// Reverting to force-dynamic keeps this route safe for that build, same
// as before tonight's change. It still gets a real speed win from the
// unstable_cache wrapping in lib/home/featured-content.ts, though — those
// functions' own results are cached and reused across requests
// independently of whether this route itself is, so every request here
// still avoids a live DB round trip most of the time; it just can't be
// served straight from Cloudflare's edge without a page render at all,
// the way the category/post pages now can.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredGuides, popularGames, categoryOverview, latestPosts, homepageFaqs] = await Promise.all([
    getFeaturedGuides(),
    getPopularGames(),
    getCategoryOverview(),
    getLatestPosts(),
    getHomepageFaqs(),
  ]);

  return (
    <>
      <Hero />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <FeaturedGuides posts={featuredGuides} />
        <PopularGames games={popularGames} />
        <BrowseCategories categories={categoryOverview} />
        <LatestPosts posts={latestPosts} />
        <AboutSection />
        <HomepageFaqs faqs={homepageFaqs} />
        <SiteCta />

        {/* Trending Articles is deliberately not built yet — page views are
            tracked (lib/tracking/log-page-view.ts), but with no bot
            filtering, so the data is currently dominated by crawler
            traffic rather than real readers. See docs/seo-content-strategy-plan.md §8. */}
      </div>
    </>
  );
}
