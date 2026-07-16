import { db } from "@/lib/db";
import { posts, postCtas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const OFFICIAL_URL = "https://uu7stars.com/";

const CTAS: { slug: string; heading: string; description: string }[] = [
  { slug: "uu7game-slots-guide", heading: "Ready to Spin?", description: "Try UU7GAME's slots with RTP and volatility info already in hand." },
  { slug: "uu7game-casino-games-guide", heading: "Ready for the Tables?", description: "Play live roulette, blackjack, and baccarat on UU7GAME." },
  { slug: "uu7game-deposit-and-withdrawal-guide", heading: "Ready to Fund Your Account?", description: "Deposit via UPI and start playing on UU7GAME in minutes." },
  { slug: "uu7game-aviator-guide", heading: "Ready to Fly?", description: "Try UU7GAME's Aviator with the mechanics covered above in mind." },
  { slug: "uu7game-rummy-guide", heading: "Ready for Your First Table?", description: "Join a UU7GAME rummy table matched to your own bankroll." },
  { slug: "uu7game-vs-other-gaming-apps", heading: "Ready to See for Yourself?", description: "Compare UU7GAME's own interface and stated numbers directly." },
  { slug: "best-real-money-gaming-apps-in-india-2026", heading: "Ready to Apply This Framework?", description: "See how UU7GAME measures up against these five criteria firsthand." },
  { slug: "aviator-betting-strategy-and-risk-management", heading: "Set Your Budget Before You Fly", description: "Bring these risk-management rules with you to UU7GAME's Aviator." },
  { slug: "fastest-withdrawal-gaming-apps", heading: "Ready to Test Withdrawal Speed?", description: "See UU7GAME's stated 5–30 minute withdrawal window for yourself." },
  { slug: "uu7game-mobile-app", heading: "Ready to Try the App?", description: "Download and explore UU7GAME's full mobile interface." },
];

async function main() {
  const APPLY = process.argv.includes("--apply");
  for (const c of CTAS) {
    const post = await db.query.posts.findFirst({ where: eq(posts.slug, c.slug) });
    if (!post) {
      console.log(`SKIP (post not found): ${c.slug}`);
      continue;
    }
    const existing = await db.query.postCtas.findMany({ where: eq(postCtas.postId, post.id) });
    if (existing.length > 0) {
      console.log(`SKIP (already has CTA): ${c.slug}`);
      continue;
    }
    console.log(`INSERT CTA for ${c.slug}: "${c.heading}"`);
    if (APPLY) {
      await db.insert(postCtas).values({
        postId: post.id,
        heading: c.heading,
        description: c.description,
        buttonText: "Visit UU7GAME",
        buttonUrl: OFFICIAL_URL,
        position: 0,
      });
    }
  }
  console.log("---");
  console.log(APPLY ? "Applied." : "Dry run only — pass --apply to write.");
  process.exit(0);
}
main();
