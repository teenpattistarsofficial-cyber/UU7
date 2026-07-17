import { db } from "@/lib/db";
import { posts, categories, authors, seoMeta, postQuickAnswer, postAiSummary, postKeyTakeaways, postFaqs, postCtas } from "@/lib/db/schema";
import { extractText } from "@/lib/editor/text";
import type { JSONContent } from "@tiptap/core";
import { slugify } from "@/lib/seo/slugify";
import { eq } from "drizzle-orm";

const TITLE = "UU7GAME VIP Program and Rebates Explained";
const SLUG = slugify(TITLE);
const CATEGORY_SLUG = "bonuses";
const AUTHOR_SLUG = "rohan-kapoor";
const IMAGE_URL = "https://images.pexels.com/photos/9821386/pexels-photo-9821386.jpeg?cs=srgb&dl=pexels-towfiqu-barbhuiya-3440682-9821386.jpg&fm=jpg";
const FOCUS_KEYWORD = "uu7game vip program";
const SEO_TITLE = "UU7GAME VIP Program: Tiers and Rebates Explained";
const META_DESCRIPTION = "How UU7GAME's VIP program actually works — tier progress, advertised rebates, and how it differs from the platform's separate referral system.";
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
      "UU7GAME runs two separate ongoing reward systems that are easy to confuse: a VIP tier program tracking your own account's activity, and a club/referral system tracking activity from players you've invited. Our ",
      link("UU7GAME Bonus Guide", "/bonuses/uu7game-bonus-guide"),
      " covers both alongside the first-deposit bonus; this guide is the dedicated deep dive on VIP specifically — how tiers progress, what they unlock, and how to think about whether chasing them is worth it.",
    ]),

    h2("How VIP Tier Progress Actually Works"),
    p(
      "The Mine (profile) tab shows a VIP progress card tracking tier advancement directly — a VIP0 account might show something like \"Upgrade to VIP1 with ₹100 left,\" indicating progress is tied to a cumulative deposit or turnover threshold rather than how long an account has existed. This is a meaningfully different mechanic from a time-based loyalty program: an account active for a single busy week can outpace one that's been open for months but deposited or wagered little, since the tier threshold responds to activity volume, not tenure.",
    ),
    p(
      "The exact threshold for each tier isn't published as a single fixed table in the interface reviewed for this guide — the progress card shows how much is left to the next tier from wherever your account currently sits, which is the practical number that actually matters day to day rather than a full schedule of every tier's exact requirement.",
    ),
    p(
      "Checking this screen after a deposit or a session, rather than only when curious, is the practical habit worth building: since the figure updates based on real activity, it's a genuine live readout of progress rather than a static number that only makes sense to check once. A player who deposits and plays regularly will typically see this figure move down toward the next tier steadily across sessions, without needing to track it manually elsewhere. A player whose activity is sporadic may see it move in irregular jumps instead — neither pattern indicates anything wrong with the account, since the figure simply reflects however activity has actually happened.",
    ),

    h2("What VIP Tiers Advertise"),
    p(
      "The app advertises VIP bonuses up to ₹57,777 across the tier system, with stated rebates of 0.1% plus 0.3% at higher tiers. Since tier thresholds and rebate percentages can shift between promotional periods, treat the account's own current VIP screen as the authoritative source for your specific numbers rather than a fixed figure that never changes.",
    ),
    p(
      "The practical mechanism is a rebate: a small percentage of qualifying activity paid back automatically as you progress through tiers, rather than a single lump-sum bonus claimed once. This is a fundamentally different shape from the first-deposit bonus (a one-time trigger with a wagering requirement attached) — VIP rebates accrue passively from continued play with no separate wagering condition described for the rebate itself.",
    ),
    mixedPara([
      "This absence of an additional wagering requirement on the rebate itself is worth noting specifically, since it's a genuine structural difference from the first-deposit bonus covered in our ",
      link("UU7GAME Welcome Bonus Guide", "/bonuses/uu7game-welcome-bonus-guide"),
      " — that bonus locks behind a 3x wagering multiple before converting to withdrawable balance, while a VIP rebate, once credited, doesn't appear to carry that same additional gate in the interface reviewed for this guide. Confirming this on your own account's VIP screen before assuming it applies identically is still worth doing, since terms can vary by account or promotional period.",
    ]),

    h2("Why VIP Rebates Are Passive Value"),
    p(
      "The genuine practical value of a rebate-based system is that it pays back a percentage of activity you were likely doing anyway, rather than requiring a distinct action to earn it. Unlike the first-deposit bonus (triggered once, by a specific deposit) or the club system (requiring you to actually refer other players), VIP progress moves simply from continuing to deposit and play — no extra step, no separate claim process described beyond what's shown on the tier card itself.",
    ),
    p(
      "That makes the VIP screen worth checking periodically even for a player with no specific interest in chasing tier upgrades: a rebate percentage already being earned through ordinary play is value sitting there regardless of intent, and not checking the screen doesn't stop it accruing — it just means not noticing it.",
    ),
    p(
      "A worked illustration of the scale involved: at a stated 0.3% rebate rate, ₹10,000 in qualifying turnover returns roughly ₹30 back as rebate value — a genuinely small figure in isolation, but one that accrues automatically across every session rather than requiring a separate claim each time. Across many sessions over an extended period, a passive rebate like this adds up in a way a single one-time bonus doesn't, which is the actual case for treating VIP progress as a background benefit of ordinary play rather than something to chase directly. At the lower stated 0.1% rate, the same ₹10,000 in turnover returns roughly ₹10 — the exact figure depends on which tier an account currently sits at, which is exactly why checking the live VIP screen for the current active rate matters more than assuming either published percentage applies universally.",
    ),

    h2("VIP vs. the Club/Referral System: Two Separate Tracks"),
    p(
      "These are commonly conflated since both appear in similar areas of the app, but they measure genuinely different things. VIP tier progress is tied to your own account's cumulative deposit/turnover activity — nothing about referring other players affects it. The separate club/agent system, covered in its own dedicated guide, tracks group activity: rewards there scale with how many people you've invited and how much they collectively wager, not your own personal deposit history.",
    ),
    p(
      "A single account can hold VIP tier progress from personal play and club rebates from referred players' activity at the same time, each tracked through its own screen — confusing which reward came from which system is a common source of new-player confusion, avoidable by checking the VIP progress card and the club/team panel separately rather than assuming one figure explains both.",
    ),
    p(
      "A useful mental model: VIP asks \"how much have I personally deposited and wagered,\" while the club system asks \"how much have the people I invited deposited and wagered.\" Both can run at zero, both can run simultaneously, and neither one's progress affects the other's threshold or rebate rate at all — they're genuinely independent systems that happen to share the same broad \"ongoing rewards\" category on the Bonus Guide's overview, which is likely why they get conflated in the first place despite measuring entirely different activity.",
    ),

    h2("Reading the VIP Screen Correctly"),
    p(
      "Beyond the headline progress figure, the VIP screen is worth reading for three specific things: the current tier's active rebate rate (since 0.1% and 0.3% apply at different points in the structure, not simultaneously), how much activity separates the account from the next tier, and whether any tier-specific bonus is currently available to claim versus simply accruing as rebate. Treating these as three separate data points, rather than one combined \"VIP status\" impression, gives a clearer picture of what tier progress is actually worth at any given moment.",
    ),
    p(
      "Since the specific numbers shown update with account activity, a screenshot or note taken once isn't a reliable long-term reference — checking the live screen periodically, particularly after a deposit or a longer session, is more accurate than relying on a remembered figure from a previous check-in, especially once a promotional period changes any of the underlying thresholds.",
    ),

    h2("Is Chasing VIP Tiers Worth It?"),
    mixedPara([
      "The honest answer depends entirely on whether tier progress changes your actual behavior. If you'd be depositing and playing at roughly the same volume regardless, VIP rebates are close to free value accumulating passively — worth checking on, not worth changing your plans for. If reaching the next tier would mean depositing more than you'd otherwise plan to, or extending a session specifically to hit a threshold, that's a meaningfully different and riskier decision — the rebate percentage on offer is real, but it's small relative to the deposit/wagering volume required to unlock it, and spending beyond your own planned budget to chase it works against the bankroll-management basics covered in our ",
      link("Bankroll Management Gaming Guide", "/betting-guides/bankroll-management-gaming-guide"),
      ".",
    ]),
    p(
      "A simple test before deliberately chasing a tier: would you be making this specific deposit or playing this specific session anyway, independent of the VIP threshold? If yes, the tier progress is a genuine bonus on top of a decision you'd already made. If the tier is the reason for the decision itself, treat that as a flag worth pausing on rather than following through automatically.",
    ),

    h2("How This Compares to a Typical VIP/Loyalty Structure"),
    mixedPara([
      "Tiered rebate programs tracking cumulative deposit or turnover activity are a standard ",
      link("loyalty program", "https://en.wikipedia.org/wiki/Loyalty_program", true),
      " structure across the real-money gaming category generally, not something unique to any single platform. What's worth comparing across platforms is whether tier progress is genuinely activity-based (as UU7GAME's own progress-card language suggests) or opaque and arbitrarily assigned, and whether the rebate percentages are disclosed plainly on the account's own screen rather than requiring a support request to find out.",
    ]),
    p(
      "A platform that shows exact progress toward the next tier, the way UU7GAME's profile screen does, is giving you a genuinely checkable figure rather than a vague \"loyalty rewards\" promise — worth using as a comparison point against any other platform's own VIP or loyalty system.",
    ),
    p(
      "It's also worth checking whether a platform's advertised maximum figure (UU7GAME states up to ₹57,777) reflects the realistic top of the tier structure or an aspirational number reachable only at an extreme, unrealistic activity level. Neither is necessarily dishonest — a genuine top-tier ceiling is expected to require substantial cumulative activity by design — but understanding that the advertised maximum and a typical player's realistic rebate value are two different figures avoids treating the headline number as a representative expectation. The same distinction is worth applying to any platform's advertised VIP ceiling, not just UU7GAME's specific figure.",
    ),

    h2("Common Mistakes Players Make With VIP Programs"),
    bulletList([
      bulletItem(["Confusing VIP rebates with the club/referral system's rebates — the two use similarly-sized percentages in places, but come from entirely different activity (personal play vs. referred players' activity) and are tracked on separate screens."]),
      bulletItem(["Depositing or extending a session specifically to cross a tier threshold, rather than letting tier progress move as a byproduct of activity already planned."]),
      bulletItem(["Assuming a single fixed rebate percentage applies at every tier — the stated 0.1% and 0.3% figures apply at different tier levels, not simultaneously or as a flat rate across the whole system."]),
      bulletItem(["Treating the advertised maximum bonus figure (up to ₹57,777) as a realistic expectation for typical play, rather than a ceiling reflecting the top of the tier structure."]),
      bulletItem(["Not checking the VIP screen at all, and therefore not noticing rebate value that's already accruing from ordinary activity regardless of whether it's actively tracked."]),
    ]),

    h2("Common Questions"),
    mixedPara([bold("How does the UU7GAME VIP program work?"), " Tier progress is tied to cumulative deposit/turnover activity (not time on the platform), tracked via a progress card on the Mine (profile) tab showing exactly how much activity remains to the next tier."]),
    mixedPara([bold("What do UU7GAME VIP tiers actually give you?"), " The app advertises bonuses up to ₹57,777 across the tier system, with stated rebates of 0.1% plus 0.3% at higher tiers, paid as a percentage of qualifying activity rather than a single lump sum."]),
    mixedPara([bold("Is the VIP program the same as the referral/club system?"), " No — VIP tracks your own account's deposit/turnover activity specifically; the separate club/agent system tracks activity from players you've referred. They run independently and are tracked on different screens."]),
    mixedPara([bold("Do I need to do anything extra to earn VIP rebates?"), " No — rebates accrue passively from continued deposit/play activity, unlike the first-deposit bonus (a one-time trigger) or the club system (which requires actually referring players)."]),
    mixedPara([bold("Should I deposit more just to reach the next VIP tier?"), " Only if you'd be making that deposit anyway regardless of the tier — depositing beyond your planned budget specifically to unlock a rebate percentage works against basic bankroll management, since the rebate is small relative to the activity required to earn it."]),

    mixedPara([
      "For the platform's other bonus mechanics, see our ",
      link("UU7GAME Bonus Guide", "/bonuses/uu7game-bonus-guide"),
      ", and for the deposit numbers underpinning tier progress, our ",
      link("Deposit and Withdrawal Guide", "/app-tutorials/uu7game-deposit-and-withdrawal-guide"),
      " covers the full mechanics. Whatever tier you're at, our ",
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
    heading: "Ready to Check Your VIP Progress?",
    description: "See your current tier and rebate rate directly on UU7GAME.",
    buttonText: "Visit UU7GAME",
    buttonUrl: OFFICIAL_URL,
    position: 0,
  });

  await db.insert(postQuickAnswer).values({
    postId: post.id,
    text: "UU7GAME's VIP program tracks cumulative deposit/turnover activity (not time on the platform) through a progress card on the Mine tab, advertising bonuses up to ₹57,777 and rebates of 0.1% plus 0.3% at higher tiers. It's a separate system from the club/referral program, which tracks referred players' activity instead of your own.",
  });

  await db.insert(postAiSummary).values({
    postId: post.id,
    summary:
      "UU7GAME's VIP program tracks cumulative deposit/turnover activity via a progress card on the Mine (profile) tab (e.g. 'Upgrade to VIP1 with ₹100 left'), not time spent on the platform. It advertises bonuses up to ₹57,777 with stated rebates of 0.1% plus 0.3% at higher tiers, paid as a passive percentage of qualifying activity rather than a one-time claim. This is explicitly distinct from the platform's separate club/agent referral system, which tracks group activity from referred players rather than the account holder's own deposit/turnover — the two run independently and are tracked on separate screens. The guide frames VIP rebates as close to free value when accrued from activity a player would engage in anyway, but cautions against deliberately depositing or wagering beyond a planned budget specifically to reach the next tier, since the rebate percentage is small relative to the volume required and works against basic bankroll management. It also positions UU7GAME's transparent progress-card display as a checkable signal worth comparing against other platforms' VIP/loyalty structures.",
  });

  await db.insert(postKeyTakeaways).values(
    [
      "UU7GAME's VIP tiers track cumulative deposit/turnover activity, not time on the platform — shown via a progress card on the Mine tab.",
      "VIP bonuses are advertised up to ₹57,777, with stated rebates of 0.1% plus 0.3% at higher tiers, paid passively as a percentage of activity.",
      "VIP is a separate system from the club/referral program — VIP tracks your own activity; club tracks activity from players you've invited.",
      "No extra action is needed to earn VIP rebates beyond normal deposit/play activity, unlike the first-deposit bonus or the club system.",
      "Depositing or wagering beyond your planned budget specifically to reach the next VIP tier works against basic bankroll management.",
      "A platform showing exact tier progress (like UU7GAME's profile screen) is a more checkable signal than a vague 'loyalty rewards' claim.",
    ].map((text, position) => ({ postId: post.id, text, position })),
  );

  await db.insert(postFaqs).values(
    [
      { question: "How does the UU7GAME VIP program work?", answer: "Tier progress is tied to cumulative deposit/turnover activity (not time on the platform), tracked via a progress card on the Mine (profile) tab showing exactly how much activity remains to the next tier." },
      { question: "What do UU7GAME VIP tiers actually give you?", answer: "The app advertises bonuses up to ₹57,777 across the tier system, with stated rebates of 0.1% plus 0.3% at higher tiers, paid as a percentage of qualifying activity rather than a single lump sum." },
      { question: "Is the VIP program the same as the referral/club system?", answer: "No — VIP tracks your own account's deposit/turnover activity specifically; the separate club/agent system tracks activity from players you've referred. They run independently and are tracked on different screens." },
      { question: "Do I need to do anything extra to earn VIP rebates?", answer: "No — rebates accrue passively from continued deposit/play activity, unlike the first-deposit bonus (a one-time trigger) or the club system (which requires actually referring players)." },
      { question: "Should I deposit more just to reach the next VIP tier?", answer: "Only if you'd be making that deposit anyway regardless of the tier — depositing beyond your planned budget specifically to unlock a rebate percentage works against basic bankroll management, since the rebate is small relative to the activity required to earn it." },
    ].map((f, position) => ({ postId: post.id, ...f, position })),
  );

  console.log("Created post:", post.id);
  process.exit(0);
}
main();
