import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, seoMeta } from "@/lib/db/schema";

// SEO metadata import for the five posts from the launch batch + Cluster A
// close-out that didn't have seo_meta rows yet. Titles are exactly 60
// characters and descriptions exactly 160 characters, matching the same
// discipline as scripts/seed-seo-metadata.ts. Keywords sourced from
// docs/seo-content-strategy-plan.md §4.1 (Cluster A) and §4.3 (Rummy).

type Entry = {
  slug: string;
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
};

const ENTRIES: Entry[] = [
  {
    slug: "online-rummy-guide",
    seoTitle: "Online Rummy Guide — Full Rules, Formats, & Winning Strategy",
    metaDescription:
      "How online rummy actually works — 13-card rules, Points vs. Pool vs. Deals formats, real winning strategy tips, and what to check before playing for real money.",
    focusKeyword: "online rummy",
  },
  {
    slug: "uu7game-login-guide",
    seoTitle: "UU7GAME Login Guide — Sign In Steps and Troubleshooting Tips",
    metaDescription:
      "Our step-by-step UU7GAME login guide: how to sign in fast, fix common OTP & password issues, plus keep your account fully secure on any shared or public device.",
    focusKeyword: "uu7game login",
  },
  {
    slug: "uu7game-apk-download-guide",
    seoTitle: "UU7GAME APK Download Guide: How to Download & Install Safely",
    metaDescription:
      "Here is how to safely download and install the UU7GAME APK on Android, and how to tell a genuine download from a modified or malicious one before installing it.",
    focusKeyword: "uu7game apk download",
  },
  {
    slug: "uu7game-registration-guide",
    seoTitle: "UU7GAME Registration Guide — Sign Up Steps and KYC Explained",
    metaDescription:
      "How to register a UU7GAME account, what age eligibility and KYC identity verification truly involves, and what documents to have ready before you start playing.",
    focusKeyword: "uu7game register",
  },
  {
    slug: "uu7game-review-2026",
    seoTitle: "UU7GAME Review 2026: Is It Legit? A Methodology-First Review",
    metaDescription:
      "Our honest, methodology-first look at UU7GAME — games on offer, bonuses, deposits, withdrawals, security & support, all checked against its own published terms.",
    focusKeyword: "uu7game review 2026",
  },
];

async function main() {
  for (const entry of ENTRIES) {
    if (entry.seoTitle.length !== 60 || entry.metaDescription.length !== 160) {
      throw new Error(
        `Length check failed for ${entry.slug}: title=${entry.seoTitle.length} desc=${entry.metaDescription.length}`,
      );
    }

    const row = await db.query.posts.findFirst({ where: eq(posts.slug, entry.slug) });
    if (!row) {
      console.warn(`SKIP — no post found for slug "${entry.slug}"`);
      continue;
    }

    await db
      .insert(seoMeta)
      .values({
        entityType: "post",
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

    console.log(`wrote post "${entry.slug}" (id=${row.id})`);
  }
  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
