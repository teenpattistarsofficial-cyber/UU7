import { getFeaturedGuides, getPopularGames, getCategoryOverview, getHomepageFaqs, getLatestPosts } from "@/lib/home/featured-content";
import { Hero } from "@/components/home/hero";
import { FeaturedGuides } from "@/components/home/featured-guides";
import { PopularGames } from "@/components/home/popular-games";
import { BrowseCategories } from "@/components/home/browse-categories";
import { LatestPosts } from "@/components/home/latest-posts";
import { AboutSection } from "@/components/home/about-section";
import { HomepageFaqs } from "@/components/home/homepage-faqs";
import { SiteCta } from "@/components/home/site-cta";

// Safety-net ISR ceiling — lib/actions/posts.ts and categories.ts already
// revalidate "/" on every relevant mutation for immediacy; this is the
// fallback if one is missed. Only takes effect because every function this
// page calls (lib/home/featured-content.ts) is wrapped in unstable_cache —
// a bare `revalidate` export does nothing for direct, unwrapped DB calls
// (see that file's own comment). Previously `force-dynamic`, which this
// route needed back when its data came from unwrapped queries directly;
// no longer necessary now that they're all cached.
export const revalidate = 3600;

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
