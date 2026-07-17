import { db } from "@/lib/db";
import { posts, categories, authors, seoMeta, postQuickAnswer, postAiSummary, postKeyTakeaways, postFaqs, postCtas } from "@/lib/db/schema";
import { extractText } from "@/lib/editor/text";
import type { JSONContent } from "@tiptap/core";
import { slugify } from "@/lib/seo/slugify";
import { eq } from "drizzle-orm";

const TITLE = "UU7GAME Bonus Guide";
const SLUG = slugify(TITLE);
const CATEGORY_SLUG = "bonuses";
const AUTHOR_SLUG = "rohan-kapoor";
const IMAGE_URL = "https://images.pexels.com/photos/34972173/pexels-photo-34972173.jpeg?cs=srgb&dl=pexels-jessbaileydesign-34972173.jpg&fm=jpg";
const FOCUS_KEYWORD = "uu7game bonus";
const SEO_TITLE = "UU7GAME Bonus Guide: Deposit, VIP & Referral Rewards";
const META_DESCRIPTION = "Every UU7GAME bonus explained with the app's own numbers — first-deposit match, VIP tiers, the club/referral system, and how to read any offer's real terms.";
const OFFICIAL_URL = "https://uu7stars.com/";

const p = (text: string): JSONContent => ({ type: "paragraph", attrs: { textAlign: null }, content: [{ type: "text", text }] });
const h2 = (text: string): JSONContent => ({ type: "heading", attrs: { level: 2, textAlign: null }, content: [{ type: "text", text }] });
const bold = (text: string): JSONContent => ({ type: "text", text, marks: [{ type: "bold" }] });
const link = (text: string, href: string, external = false): JSONContent => ({
  type: "text",
  text,
  marks: [{ type: "link", attrs: { rel: "noopener noreferrer", href, class: null, title: null, target: external ? "_blank" : null } }],
});
function mixedPara(parts: (JSONContent | string)[]): JSONContent {
  return { type: "paragraph", attrs: { textAlign: null }, content: parts.map((part) => (typeof part === "string" ? { type: "text", text: part } : part)) };
}
function bulletItem(parts: (JSONContent | string)[]): JSONContent {
  return { type: "listItem", content: [mixedPara(parts)] };
}
function bulletList(items: JSONContent[]): JSONContent {
  return { type: "bulletList", content: items };
}

const content: JSONContent = {
  type: "doc",
  content: [
    mixedPara([
      "A UU7GAME bonus isn't a single offer — the app runs at least four distinct, ongoing mechanics at once: a first-deposit match, a VIP tier system, a club/referral rebate structure, and rotating time-boxed promotions. This guide covers what each one actually is, using the app's own stated numbers rather than marketing copy, and how to read any bonus's real terms before opting in. Our ",
      link("Mobile App", "/app-tutorials/uu7game-mobile-app"),
      " guide covers where each of these lives in the actual interface; this page is the dedicated depth on the mechanics themselves.",
    ]),

    h2("First Deposit Bonus: The Headline Offer"),
    p(
      "UU7GAME's deposit screen shows a 100% match on a first deposit — every quick-select deposit amount displays a matching bonus tag (for example, a ₹1,000 deposit shows \"+1000\"), advertised up to ₹50,000. That bonus is credited to a separate \"Gullak\" wallet — a piggy-bank-style bonus balance distinct from your main withdrawable balance — carrying a stated 3x wagering requirement before it converts to withdrawable funds. The app explicitly states this bonus can be cancelled if you don't want it, rather than being forced onto every deposit regardless of preference.",
    ),
    p(
      "Deposits run a ₹100 minimum to a ₹50,000 maximum per transaction. The deposit screen also separates Total Balance from Withdrawable balance — Total Balance includes bonus credit still working through its wagering requirement, while Withdrawable is specifically what you could cash out right now. Watching both figures separately is the fastest way to tell whether a bonus has actually cleared.",
    ),

    h2("Understanding the 3x Wagering Requirement"),
    p(
      "A wagering (turnover) requirement means the bonus — or winnings sitting alongside it — has to be wagered a set number of times before it counts as withdrawable balance. On a 3x requirement, a ₹1,000 bonus needs ₹3,000 in total wagers placed across eligible games before it clears. This exists across the real-money gaming industry generally, not just on UU7GAME, specifically to prevent bonus credit from being claimed and cashed out immediately with no actual play in between.",
    ),
    mixedPara([
      "Our ",
      link("Deposit and Withdrawal Guide", "/app-tutorials/uu7game-deposit-and-withdrawal-guide"),
      " covers this mechanic in more depth. The wagering multiple is the number that actually determines how easily a bonus converts to real, withdrawable money — always worth checking before assuming a headline percentage is the whole story.",
    ]),
    p(
      "Worked example with the deposit-screen numbers above: deposit ₹2,000 and the matching first-deposit bonus credits ₹2,000 to the Gullak wallet. At a 3x wagering requirement, that ₹2,000 bonus needs ₹6,000 in total eligible wagers placed before it — or any winnings sitting alongside it in Total Balance — becomes part of your Withdrawable balance. Placing a single ₹6,000 bet doesn't automatically clear it either, unless the specific bonus terms count a single large wager the same as the equivalent total spread across many smaller ones; reading the actual terms shown at the point of opting in avoids assuming either interpretation applies by default.",
    ),
    p(
      "A practical habit: note the deposit amount and the stated multiplier the moment a bonus credits, then keep a running total of wagers placed until you're confident the requirement is cleared — checking Total Balance versus Withdrawable balance periodically is a faster way to confirm progress than reconstructing it from memory the first time a withdrawal attempt gets blocked.",
    ),

    h2("Gullak: Why a Separate Bonus Wallet Matters"),
    p(
      "Crediting a bonus to a separate wallet rather than the main balance is a meaningful structural choice, not just a cosmetic detail. It means your own deposited cash (assuming no bonus was applied, or once any attached bonus has cleared) stays withdrawable on its own timeline, unaffected by whatever wagering requirement the bonus portion is still working through. It's also what makes the bonus genuinely cancellable — declining or clearing out a Gullak balance doesn't touch the separate Withdrawable figure tracking your real cash.",
    ),
    p(
      "Compare this to a platform that credits a bonus directly onto the main balance with no separation: every rupee showing in the account balance becomes ambiguous about whether it's genuinely withdrawable or still tied to an unmet wagering condition, which is exactly the confusion the Total Balance/Withdrawable split (and the separate Gullak wallet) is designed to avoid.",
    ),

    h2("VIP Tier Program"),
    p(
      "The Mine (profile) tab shows a VIP progress card tracking tier advancement — for example, a VIP0 account might show \"Upgrade to VIP1 with ₹100 left,\" indicating tier progress is tied to a cumulative deposit or turnover threshold rather than time spent on the platform. The app advertises VIP bonuses up to ₹57,777, with stated rebates of 0.1% plus 0.3% at higher tiers.",
    ),
    mixedPara([
      "This is a fairly standard ",
      link("loyalty program", "https://en.wikipedia.org/wiki/Loyalty_program", true),
      " structure: rebates and bonus value scale with how much you've deposited or wagered over time, rewarding continued play rather than a single deposit. Since tier thresholds and rebate percentages can change between promotional periods, check the app's own VIP screen for your account's current numbers rather than treating any figure here as permanently fixed.",
    ]),
    p(
      "The practical value of a rebate-based VIP system is that it pays back a small percentage of activity you were already going to do, rather than requiring a separate action to earn it — unlike the first-deposit bonus (a one-time trigger) or the club system (requiring you to actually refer people), VIP rebates accrue passively just from continuing to play. That makes the VIP screen worth checking periodically even if you never intentionally chase tier upgrades, since a rebate percentage you're already qualifying for is effectively free value sitting unclaimed if it isn't being tracked.",
    ),

    h2("The Club/Referral Rebate System"),
    p(
      "Separately from VIP tiers, the Earn tab runs a \"club\" style referral system. A \"My Team Club\" panel tracks Club Stars, a club member count (shown as a fraction, e.g., 0/5 slots filled), and a club bet target (e.g., ₹0 of a ₹200,000 target) — the club member slot count and bet target together suggest this system rewards scale with group activity, not just your own individual play.",
    ),
    bulletList([
      bulletItem([bold("Invitation challenge: "), "a shareable referral code advertised as \"Get ₹200,\" described in-app as \"no limit\" — one-tap sharing to Telegram, WhatsApp, and Instagram is built directly into the Earn tab."]),
      bulletItem([bold("Bet rebate: "), "up to 0.3% on qualifying wagers, tracked alongside your club's collective bet target."]),
      bulletItem([bold("First-deposit rebate: "), "2% on a new referral's first deposit, credited to your own rewards balance."]),
      bulletItem([bold("Invite rewards: "), "advertised up to ₹6,000 across the full referral structure."]),
    ]),
    p(
      "Rewards from this system are split into a withdrawable balance (with its own Claim/Detail actions) and running Total Rewards / Today's Rewards figures — a genuinely separate track from the VIP tier system, which measures your own account's activity rather than your club's collective total.",
    ),

    h2("Other Ongoing Rewards"),
    p(
      "A rewards wheel sits in the bottom navigation for a daily spin — a recurring, low-effort reward mechanic distinct from the deposit-triggered bonuses above. Time-boxed leaderboard events also rotate through the Promo tab's Ranking section periodically (one observed example ran under the banner \"Rise to the Top 10, Claim Your Fortune\" across a specific two-week window) — treat any specific figure in a rotating campaign banner as tied to that campaign's own terms and dates, not a permanent platform feature.",
    ),

    h2("Comparing the Three Ongoing Programs"),
    bulletList([
      bulletItem([bold("First-deposit bonus: "), "one-time, triggered specifically by your first deposit — a 100% match up to ₹50,000 with a 3x wagering requirement, credited to the cancellable Gullak wallet."]),
      bulletItem([bold("VIP tier program: "), "ongoing, tracks your own account's cumulative deposit/turnover activity — advertised bonuses up to ₹57,777 with rebates of 0.1% plus 0.3% that scale as your tier rises."]),
      bulletItem([bold("Club/referral system: "), "ongoing, tracks group activity across everyone you've referred — a ₹200 invitation bonus, up to 0.3% bet rebate, 2% first-deposit rebate on referrals, and up to ₹6,000 in invite rewards."]),
    ]),
    p(
      "These three run independently and aren't mutually exclusive — a single account can hold first-deposit bonus credit still clearing its wagering requirement, VIP rebates accruing from personal play, and club rebates accruing from referred players' activity, all at the same time, each tracked through its own screen in the app. Confusing which balance a specific reward landed in is a common source of confusion for new players; checking each screen (Gullak, VIP progress, club rewards) individually rather than assuming one Total Balance figure explains everything avoids that confusion.",
    ),

    h2("How to Read Any Bonus Before Opting In"),
    bulletList([
      bulletItem(["Find the actual wagering multiple, not just the headline match percentage — a smaller match with a lower multiple can convert to withdrawable cash more easily than a larger match buried under a steeper requirement."]),
      bulletItem(["Check whether the bonus credits to a separate, cancellable wallet (like Gullak) or gets forced onto your main balance regardless of preference."]),
      bulletItem(["Check for an expiry window and which specific games count toward clearing the wagering requirement — not every game category necessarily contributes at the same rate."]),
      bulletItem(["Treat rotating campaign banners (leaderboard events, seasonal promotions) as temporary, time-boxed offers — the ongoing mechanics (first-deposit match, VIP, club rebates) are the more stable, always-available structure."]),
    ]),

    h2("A Red Flag Worth Knowing"),
    mixedPara([
      "An offer dramatically more generous than anything described in this guide or shown in the official app — a \"deposit and get 10x back\" style claim, for instance — is a common lure used by fake clone sites, not a real UU7GAME promotion. Our ",
      link("Official Site Guide", "/app-tutorials/uu7game-official-site-guide"),
      " covers how to verify you're actually on the legitimate platform before ever entering payment details in response to an unusually generous bonus claim.",
    ]),
    p(
      "A message that arrives unsolicited — by SMS, WhatsApp, or a social media DM claiming a special or exclusive bonus link — deserves the same scrutiny regardless of how convincing the offer looks. Legitimate bonus terms are visible directly inside the official app itself; a bonus you can only access by clicking a link sent to you first, rather than one you found inside the app's own Promo tab, is worth verifying independently before acting on it. The safest check costs nothing: close the message, open the official app directly, and look for the same offer in the Promo tab yourself rather than tapping through a link.",
    ),

    h2("Why This Approach Applies Beyond UU7GAME"),
    p(
      "Every real-money gaming platform runs some version of these same mechanics — a first-deposit incentive, an ongoing loyalty structure, and often a referral system — dressed up under different names and figures. The genuinely useful skill isn't memorizing any one platform's specific numbers; it's knowing which three or four questions to ask of any bonus before opting in: what's the actual wagering multiple, is it credited to a separate cancellable balance, what's the expiry window, and which games count toward clearing it. Those four answers tell you more about a bonus's real value than any headline percentage a promotions page leads with.",
    ),

    h2("Common Questions"),
    mixedPara([bold("What is UU7GAME's first deposit bonus?"), " A 100% match on a first deposit, advertised up to ₹50,000, credited to a separate cancellable \"Gullak\" wallet with a stated 3x wagering requirement before it converts to withdrawable balance."]),
    mixedPara([bold("How does the UU7GAME VIP program work?"), " VIP tier progress is tied to cumulative deposit/turnover activity (not time on the platform), with the app advertising bonuses up to ₹57,777 and rebates of 0.1% plus 0.3% at higher tiers."]),
    mixedPara([bold("What is the UU7GAME referral/club system?"), " A separate rewards track from VIP: a shareable invitation code (advertised \"Get ₹200,\" no limit), a bet rebate up to 0.3%, a 2% first-deposit rebate on referrals, and invite rewards advertised up to ₹6,000 — scaling with group activity rather than individual play alone."]),
    mixedPara([bold("Can I decline the first-deposit bonus?"), " Yes — the app explicitly states the first-deposit bonus can be cancelled if you don't want it, rather than being forced onto every deposit."]),
    mixedPara([bold("What matters more, the bonus percentage or the wagering requirement?"), " The wagering requirement multiple — it determines how much has to be wagered before a bonus converts to real, withdrawable money, and a smaller match with a lower multiple can be a genuinely better deal than a larger one with steeper terms."]),

    mixedPara([
      "For the deposit mechanics these bonuses attach to, see our ",
      link("Deposit and Withdrawal Guide", "/app-tutorials/uu7game-deposit-and-withdrawal-guide"),
      ", and for the full app walkthrough including where each bonus screen actually lives, our ",
      link("Mobile App", "/app-tutorials/uu7game-mobile-app"),
      " guide covers it in depth. Whatever bonus you use, our ",
      link("Responsible Gaming", "/responsible-gaming"),
      " guidelines are worth reading first.",
    ]),
  ],
};

async function main() {
  const text = extractText(content);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  console.log("Word count:", wordCount);
  console.log("Slug:", SLUG, "| contains FK:", SLUG.includes(slugify(FOCUS_KEYWORD)));
  console.log("SEO Title:", SEO_TITLE, `(${SEO_TITLE.length} chars)`, "| contains FK:", SEO_TITLE.toLowerCase().includes(FOCUS_KEYWORD));
  console.log("Meta Description:", META_DESCRIPTION.length, "chars");
  console.log("Contains FK in content:", text.toLowerCase().includes(FOCUS_KEYWORD));

  const APPLY = process.argv.includes("--apply");
  if (!APPLY) {
    console.log("Dry run only — pass --apply to write.");
    process.exit(0);
  }

  const existing = await db.query.posts.findFirst({ where: eq(posts.slug, SLUG) });
  if (existing) {
    console.log(`Already exists (id ${existing.id}) — skipping creation.`);
    process.exit(0);
  }

  const category = await db.query.categories.findFirst({ where: eq(categories.slug, CATEGORY_SLUG) });
  if (!category) {
    console.log(`Category not found: ${CATEGORY_SLUG}`);
    process.exit(1);
  }
  const author = await db.query.authors.findFirst({ where: eq(authors.slug, AUTHOR_SLUG) });
  if (!author) {
    console.log(`Author not found: ${AUTHOR_SLUG}`);
    process.exit(1);
  }

  const [post] = await db
    .insert(posts)
    .values({
      title: TITLE,
      slug: SLUG,
      content,
      status: "published",
      categoryId: category.id,
      authorId: author.id,
      featuredImageUrl: IMAGE_URL,
      excerpt: META_DESCRIPTION,
      readingTimeMinutes: Math.ceil(wordCount / 200),
      publishedAt: new Date(),
    })
    .returning({ id: posts.id });

  await db.insert(seoMeta).values({
    entityType: "post",
    entityId: post.id,
    seoTitle: SEO_TITLE,
    metaDescription: META_DESCRIPTION,
    focusKeyword: FOCUS_KEYWORD,
    robotsIndex: true,
    robotsFollow: true,
  });

  await db.insert(postCtas).values({
    postId: post.id,
    heading: "Ready to Claim Your First Deposit Bonus?",
    description: "See the current first-deposit match and VIP terms directly on UU7GAME.",
    buttonText: "Visit UU7GAME",
    buttonUrl: OFFICIAL_URL,
    position: 0,
  });

  await db.insert(postQuickAnswer).values({
    postId: post.id,
    text: "UU7GAME runs four bonus mechanics: a 100% first-deposit match (up to ₹50,000, 3x wagering, cancellable 'Gullak' wallet), a VIP tier program (up to ₹57,777, 0.1%+0.3% rebates, tied to cumulative deposit/turnover), a club/referral system (₹200 invitation bonus, up to 0.3% bet rebate, 2% first-deposit rebate, up to ₹6,000 invite rewards), and rotating time-boxed promotions like leaderboard events.",
  });

  await db.insert(postAiSummary).values({
    postId: post.id,
    summary:
      "UU7GAME's bonus ecosystem has four distinct, ongoing mechanics. First-deposit bonus: 100% match up to ₹50,000, credited to a separate cancellable 'Gullak' wallet with a 3x wagering requirement; deposits run ₹100–₹50,000 per transaction. VIP tier program: progress tied to cumulative deposit/turnover (not time), advertised bonuses up to ₹57,777 with rebates of 0.1% plus 0.3% at higher tiers. Club/referral system: a shareable 'Get ₹200' invitation code (no limit), a bet rebate up to 0.3%, a 2% first-deposit rebate on referrals, and invite rewards up to ₹6,000 — tracked via club member slots and a collective bet target, rewarding group activity separately from individual VIP progress. Other rewards: a daily spin wheel and rotating time-boxed leaderboard events. General guidance: the wagering multiple matters more than the headline match percentage, check whether a bonus is credited to a cancellable separate wallet, and treat unusually generous bonus claims (10x-style offers) as a common fake-site red flag rather than a real promotion.",
  });

  await db.insert(postKeyTakeaways).values(
    [
      "UU7GAME's first-deposit bonus is a 100% match up to ₹50,000, credited to a cancellable 'Gullak' wallet with a 3x wagering requirement.",
      "The VIP tier program tracks cumulative deposit/turnover activity, advertising bonuses up to ₹57,777 and rebates of 0.1% plus 0.3%.",
      "A separate club/referral system offers a ₹200 invitation bonus (no limit), a 0.3% bet rebate, a 2% first-deposit rebate, and up to ₹6,000 in invite rewards.",
      "The wagering requirement multiple determines how easily a bonus converts to withdrawable cash — more important than the headline match percentage.",
      "A daily spin wheel and rotating leaderboard events add smaller, time-boxed rewards on top of the three ongoing programs.",
      "An unusually generous bonus offer (well beyond what's described here) is a common red flag for a fake clone site, not a real UU7GAME promotion.",
    ].map((text, position) => ({ postId: post.id, text, position })),
  );

  await db.insert(postFaqs).values(
    [
      { question: "What is UU7GAME's first deposit bonus?", answer: "A 100% match on a first deposit, advertised up to ₹50,000, credited to a separate cancellable \"Gullak\" wallet with a stated 3x wagering requirement before it converts to withdrawable balance." },
      { question: "How does the UU7GAME VIP program work?", answer: "VIP tier progress is tied to cumulative deposit/turnover activity (not time on the platform), with the app advertising bonuses up to ₹57,777 and rebates of 0.1% plus 0.3% at higher tiers." },
      { question: "What is the UU7GAME referral/club system?", answer: "A separate rewards track from VIP: a shareable invitation code (advertised \"Get ₹200,\" no limit), a bet rebate up to 0.3%, a 2% first-deposit rebate on referrals, and invite rewards advertised up to ₹6,000 — scaling with group activity rather than individual play alone." },
      { question: "Can I decline the first-deposit bonus?", answer: "Yes — the app explicitly states the first-deposit bonus can be cancelled if you don't want it, rather than being forced onto every deposit." },
      { question: "What matters more, the bonus percentage or the wagering requirement?", answer: "The wagering requirement multiple — it determines how much has to be wagered before a bonus converts to real, withdrawable money, and a smaller match with a lower multiple can be a genuinely better deal than a larger one with steeper terms." },
    ].map((f, position) => ({ postId: post.id, ...f, position })),
  );

  console.log("Created post:", post.id);
  process.exit(0);
}
main();
