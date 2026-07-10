import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pages, categories, seoMeta } from "@/lib/db/schema";

// One-time import of SEO titles/descriptions for the static pages and
// category archives, sourced from the keyword brief in
// docs/seo-content-strategy-plan.md (§4's cluster/keyword mapping). Titles
// are exactly 60 characters and descriptions exactly 160 characters per the
// brief's requirement. Category-level keywords deliberately avoid reusing
// any single pillar post's own primary keyword (e.g. "online rummy" is
// Game Guides' own pillar post's target, not the category archive's) to
// avoid the keyword-cannibalization the plan's §6.3 explicitly warns against.

type Entry = {
  slug: string;
  kind: "page" | "category";
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
};

const ENTRIES: Entry[] = [
  {
    slug: "about",
    kind: "page",
    seoTitle: "About UU7 — Honest Gaming Guides and Reviews for India Today",
    metaDescription:
      "Learn about UU7's mission, editorial methodology, and our commitments to publishing honest, accurate gaming guides, and reviews for real-money players in India.",
    focusKeyword: "UU7",
  },
  {
    slug: "editorial-policy",
    kind: "page",
    seoTitle: "Editorial Policy — How UU7 Researches and Fact-Checks Guides",
    metaDescription:
      "Learn how UU7 researches, reviews, and fact-checks every gaming guide and review prior to publication, and how we clearly disclose any commercial relationships.",
    focusKeyword: "editorial policy",
  },
  {
    slug: "responsible-gaming",
    kind: "page",
    seoTitle: "Responsible Gaming — Safe Play Tips and Guidelines for India",
    metaDescription:
      "Practical responsible gaming guidelines: safe play tips, age restrictions, how to recognize risk, and where to get real help if gaming stops being fun in India.",
    focusKeyword: "responsible gaming",
  },
  {
    slug: "game-guides",
    kind: "category",
    seoTitle: "Game Guides: Rummy, Teen Patti, Slots, Aviator & Live Casino",
    metaDescription:
      "Clear, accurate rules and strategy guides for online rummy, teen patti, online slots, Aviator and live casino games — written to be genuinely beginner-friendly.",
    focusKeyword: "game guides",
  },
  {
    slug: "betting-guides",
    kind: "category",
    seoTitle: "Betting Guides — Real Money Gaming App Comparisons for India",
    metaDescription:
      "Compare the best real money gaming apps in India: real-money wagering guides, honest app comparisons and where-to-play recommendations for every serious player.",
    focusKeyword: "best real money gaming apps",
  },
  {
    slug: "bonuses",
    kind: "category",
    seoTitle: "UU7GAME Bonus Guide — Welcome, Reload, VIP & Referral Offers",
    metaDescription:
      "Our complete UU7GAME bonus guide covering welcome offers, daily reload bonuses, VIP perks & referral rewards, cash tournaments, and how to read the bonus terms.",
    focusKeyword: "uu7game bonus",
  },
  {
    slug: "app-tutorials",
    kind: "category",
    seoTitle: "UU7GAME App Tutorials — Download, Login & Registration Guide",
    metaDescription:
      "Step-by-step UU7GAME how-tos covering APK download, login, registration, security, deposits, & withdrawals, explained clearly for first-time users across India.",
    focusKeyword: "uu7game",
  },
  {
    slug: "statistics-reports",
    kind: "category",
    seoTitle: "Statistics & Reports — Payout Times, RTP & Bonus Comparisons",
    metaDescription:
      "Data-driven gaming reports, covering UU7GAME payout reviews, withdrawal time data, slot RTP comparisons, and real money gaming app comparison reports for India.",
    focusKeyword: "uu7game payout review",
  },
];

async function main() {
  for (const entry of ENTRIES) {
    if (entry.seoTitle.length !== 60 || entry.metaDescription.length !== 160) {
      throw new Error(
        `Length check failed for ${entry.slug}: title=${entry.seoTitle.length} desc=${entry.metaDescription.length}`,
      );
    }

    const row =
      entry.kind === "page"
        ? await db.query.pages.findFirst({ where: eq(pages.slug, entry.slug) })
        : await db.query.categories.findFirst({ where: eq(categories.slug, entry.slug) });

    if (!row) {
      console.warn(`SKIP — no ${entry.kind} found for slug "${entry.slug}"`);
      continue;
    }

    await db
      .insert(seoMeta)
      .values({
        entityType: entry.kind,
        entityId: row.id,
        seoTitle: entry.seoTitle,
        metaDescription: entry.metaDescription,
        focusKeyword: entry.focusKeyword,
      })
      .onConflictDoUpdate({
        target: [seoMeta.entityType, seoMeta.entityId],
        set: {
          seoTitle: entry.seoTitle,
          metaDescription: entry.metaDescription,
          focusKeyword: entry.focusKeyword,
        },
      });

    console.log(`wrote ${entry.kind} "${entry.slug}" (id=${row.id})`);
  }
  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
