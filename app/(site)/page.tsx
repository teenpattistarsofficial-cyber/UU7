import { getFeaturedGuides, getPopularGames, getHomepageFaqs, getLatestPosts } from "@/lib/home/featured-content";
import { Hero } from "@/components/home/hero";
import { FeaturedGuides } from "@/components/home/featured-guides";
import { PopularGames } from "@/components/home/popular-games";
import { LatestPosts } from "@/components/home/latest-posts";
import { AboutSection } from "@/components/home/about-section";
import { HomepageFaqs } from "@/components/home/homepage-faqs";
import { SiteCta } from "@/components/home/site-cta";

// This route has no params, so without `force-dynamic` Next would try to
// statically prerender it (including at `next build` time, requiring a
// live DATABASE_URL in the Docker build). lib/actions/posts.ts already
// revalidates "/" on every post publish/edit/delete for immediacy — this
// just ensures every other request reflects the DB directly too.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredGuides, popularGames, latestPosts, homepageFaqs] = await Promise.all([
    getFeaturedGuides(),
    getPopularGames(),
    getLatestPosts(),
    getHomepageFaqs(),
  ]);

  return (
    <>
      <Hero />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <FeaturedGuides posts={featuredGuides} />
        <PopularGames games={popularGames} />
        <LatestPosts posts={latestPosts} />
        <AboutSection />
        <HomepageFaqs faqs={homepageFaqs} />
        <SiteCta />

        {/* Trending Articles is deliberately not built — a real "trending"
            signal needs actual pageview data (Phase 7 Analytics, currently
            paused). See docs/seo-content-strategy-plan.md §8. */}
      </div>
    </>
  );
}
