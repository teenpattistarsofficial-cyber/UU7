import { db } from "@/lib/db";
import { posts, categories, authors, seoMeta, postQuickAnswer, postAiSummary, postKeyTakeaways, postFaqs, postCtas } from "@/lib/db/schema";
import { extractText } from "@/lib/editor/text";
import type { JSONContent } from "@tiptap/core";
import { slugify } from "@/lib/seo/slugify";
import { eq } from "drizzle-orm";

const TITLE = "Bankroll Management Gaming Guide";
const SLUG = slugify(TITLE);
const CATEGORY_SLUG = "betting-guides";
const AUTHOR_SLUG = "rohan-kapoor";
const IMAGE_URL = "https://images.pexels.com/photos/6863252/pexels-photo-6863252.jpeg?cs=srgb&dl=pexels-n-voitkevich-6863252.jpg&fm=jpg";
const FOCUS_KEYWORD = "bankroll management gaming";
const SEO_TITLE = "Bankroll Management Gaming: Rules That Actually Work";
const META_DESCRIPTION = "Practical bankroll management for real-money gaming — session budgets, unit sizing across formats, and stop rules, applied to rummy, slots, casino, and Aviator.";
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
      "Bankroll management for real-money gaming is the one skill that applies identically across every format — rummy, slots, live casino, sports betting, or Aviator — regardless of which game's specific rules or odds you're playing against. Our ",
      link("Aviator Betting Strategy and Risk Management", "/betting-guides/aviator-betting-strategy-and-risk-management"),
      " guide covers this same discipline applied specifically to one crash-format game; this guide covers the general version, usable across every real-money format on any platform.",
    ]),

    h2("What Bankroll Management Actually Means"),
    p(
      "A bankroll is the total amount of money you've deliberately set aside for real-money gaming — separate from rent, bills, savings, or anything else — and genuinely accepted as money you could lose entirely. Bankroll management is the set of rules that determines how much of it you risk at any one time, so that ordinary variance (a losing streak that has nothing to do with playing badly) doesn't end your ability to keep playing within your own plan.",
    ),
    p(
      "This is a different question from which specific game to play or which specific bet to place — it's the layer above all of that, and it's the one part of real-money gaming that's entirely within your own control regardless of the format's underlying odds or fairness.",
    ),
    p(
      "A genuine bankroll management gaming habit is built from four decisions, all made before a session starts rather than during it: a total bankroll for a fixed period, a session budget split from that total, a unit size appropriate to the format being played, and a stop-loss/stop-win pair that decides when a session ends. Each is covered in turn below.",
    ),

    h2("Setting Your Total Bankroll"),
    p(
      "Start with a number you'd set aside for any other entertainment expense — a genuinely discretionary amount, not money earmarked for bills, savings, or anything time-sensitive. A useful test: if losing this entire amount would change your month in a way that matters, it's too large a bankroll regardless of how much you can technically afford on paper. Set it as a fixed amount for a fixed period (weekly or monthly works for most people) rather than an open-ended, unreviewed figure.",
    ),
    mixedPara([
      "The ",
      link("envelope budgeting method", "https://en.wikipedia.org/wiki/Envelope_system", true),
      " — physically or mentally setting aside a fixed amount for one purpose and stopping once it's gone — maps directly onto a gaming bankroll: once this period's amount is used, the period is over, regardless of how the sessions within it went. Treating the number as genuinely fixed, rather than a starting point you can add to mid-period, is what makes this work in practice rather than just in theory.",
    ]),

    h2("Session Budgets: Splitting the Bankroll Down"),
    p(
      "A total bankroll should be split into individual session budgets rather than treated as one pool available all at once — deciding before each session exactly how much of the period's bankroll you're using this time. This does two things: it prevents one bad session from consuming an entire period's bankroll in one sitting, and it gives you a natural, pre-decided stopping point rather than an open-ended session with no defined end.",
    ),
    p(
      "A simple way to size a session budget: divide the total period bankroll by the number of sessions you realistically expect to play in that period. If a monthly bankroll is meant to cover roughly eight sessions, each session budget is one-eighth of the total — adjustable if a specific session goes well or poorly, but starting from a deliberate number rather than guessing each time.",
    ),

    h2("A Worked Example With Numbers"),
    p(
      "Concrete figures make this easier to actually apply than the general rules alone, so here's a worked example — substitute your own comfortable amounts, since the ratios matter more than these specific numbers. Say a monthly bankroll is set at 4,000, meant to cover roughly eight sessions across the month. Dividing that gives a session budget of 500. Within that session, a unit size of 2-5% keeps a single bet, spin, or hand around 10-25 — small enough that a normal losing stretch doesn't end the session before variance has a real chance to even out.",
    ),
    p(
      "A stop-loss set at 50% of the session budget means closing the app once losses hit 250 for that session; a stop-win set at the same 50% means walking away once the session is up 250, banking that as a result rather than a new, larger amount to risk further. With all four numbers fixed before the session starts (bankroll, session budget, unit size, stop points), a bad month has a defined worst case — losing the full 4,000 across eight sessions, not more — and a good month has defined points where wins actually get banked rather than given back chasing a bigger result.",
    ),
    p(
      "Compare that to playing without any of these numbers decided in advance: bet sizes creep up after a win \"because it's working\" and shrink erratically after a loss \"to be safer,\" with no actual point at which any given session was always going to end. The specific numbers above are less important than the fact that all four were decided before a single bet was placed, when no session's result could bias the decision.",
    ),

    h2("Unit Sizing Across Different Formats"),
    p(
      "How much of a session budget any single bet, spin, or hand should represent varies by format, since the pace and stake structure of each format is genuinely different:",
    ),
    bulletList([
      bulletItem([bold("Rummy: "), "tables are organized by entry fee or per-point value, letting you match a table to your bankroll directly rather than committing to a stake you're unsure about. Our ", link("Rummy Guide", "/app-tutorials/uu7game-rummy-guide"), " covers how tables display stakes; the same principle applies regardless of platform — the highest-stake table available isn't automatically the one to sit down at."]),
      bulletItem([bold("Slots: "), "bet size is a function of coin value multiplied by active paylines, and slots run through spins considerably faster than table formats — keeping a single spin's bet to a small fraction of the session budget matters more here than in a slower format, since more bets per hour means faster exposure to variance either direction."]),
      bulletItem([bold("Live casino: "), "minimum stakes on live-dealer tables tend to run higher than slots, since a real dealer's time carries a real cost the platform accounts for — factor this into session planning specifically, rather than assuming the same budget that covers an hour of slots stretches as far across an hour of live blackjack or roulette."]),
      bulletItem([bold("Aviator and other crash games: "), "covered in full depth in our dedicated strategy guide — the short version is that running two independent bets per round (UU7GAME's dual betting panels) means treating each panel's stake as its own separate risk decision drawn from the same session budget, not a combined bet split in half."]),
    ]),
    p(
      "The specific unit size matters less than the discipline of picking one before you start and sticking to it regardless of how the last few rounds went — the same rule applies whether the format resolves in seconds (Aviator, slots) or minutes (a rummy hand, a live-casino round).",
    ),

    h2("Stop-Loss and Stop-Win Rules"),
    p(
      "Two numbers, decided before a session starts, matter more than any single bet: a stop-loss (the point where you close the app for this session regardless of how you feel about recovering losses) and a stop-win (the point where you also walk away after a good session, banking the result rather than treating it as a new, larger budget to risk further). Deciding both in advance is what makes them work — in-the-moment decisions after either a loss or a win tend to favor continuing rather than stopping, which is exactly the bias these two rules exist to counter.",
    ),
    p(
      "A common approach: set both as a percentage of the session budget (for example, stopping at a 50% loss or a 50% gain relative to the session's starting amount) rather than a fixed rupee figure that doesn't scale with different session sizes. Whichever hits first ends the session — there's no need to wait for both.",
    ),

    h2("Tracking Your Own Numbers"),
    p(
      "Keep a simple record of each session: date, format played, starting and ending amount, and whether your stop-loss or stop-win was what actually ended it. This costs nothing to maintain — a notes-app entry after each session is enough — and it's the only reliable way to know whether your bankroll rules are actually working over time, rather than relying on memory, which tends to overweight recent big wins or losses over the fuller pattern.",
    ),
    mixedPara([
      "Keeping this alongside your own deposit and withdrawal records (the same habit our ",
      link("Deposit and Withdrawal Guide", "/app-tutorials/uu7game-deposit-and-withdrawal-guide"),
      " recommends generally) gives you one consistent picture of your real-money gaming activity across an entire period, not just impressions from whichever sessions stood out most.",
    ]),

    h2("Common Bankroll Mistakes"),
    bulletList([
      bulletItem([bold("No separation between gaming money and other finances: "), "without a genuinely fixed, separate bankroll, every loss becomes a decision about money that has some other purpose attached to it, which makes stopping at a predefined point considerably harder in practice."]),
      bulletItem([bold("Increasing bet size to chase a loss: "), "raising a bet specifically to recover a previous loss increases what a single bet costs exactly when the bankroll is already down, without improving the odds on that bet at all — the same mistake covered in more depth in our Aviator strategy guide, and one that applies identically across every format."]),
      bulletItem([bold("Treating a stop-win as a new floor: "), "giving back an entire session's profit while chasing a bigger one is one of the most common ways a winning session turns into a losing one — the stop-win exists specifically to prevent this."]),
      bulletItem([bold("Picking stakes based on what's available rather than what fits the bankroll: "), "the highest-stake table, highest bet level, or largest available wager isn't automatically the right choice — matching stake size to your own bankroll is what determines how long a session lasts, not the format itself."]),
      bulletItem([bold("No record of past sessions: "), "without tracking, it's easy to remember the big wins clearly and underweight the accumulated smaller losses, leading to an inaccurate sense of whether your current bankroll rules are actually working."]),
    ]),

    h2("When Bankroll Rules Alone Aren't Enough"),
    p(
      "Bankroll management assumes gaming is being treated as a bounded entertainment expense with a defined budget — it isn't a solution for a deeper pattern of playing to recover losses across multiple periods, spending more time or money than planned on a regular basis, or being unable to stop at a point you set for yourself. Our ",
      link("Responsible Gaming", "/responsible-gaming"),
      " page covers these broader signs in more depth, including where to find independent support resources — worth reading alongside these bankroll rules, not as a separate, later concern.",
    ),

    h2("Common Questions"),
    mixedPara([bold("What is bankroll management in gaming?"), " The set of rules determining how much money you risk at any one time — a total bankroll, session budgets split from it, unit sizes appropriate to the format, and stop-loss/stop-win points — so that ordinary variance doesn't end your ability to play within your own plan."]),
    mixedPara([bold("How much of my bankroll should I bet per session?"), " A common approach is dividing your total period bankroll by the number of sessions you expect to play, giving each session a deliberate, pre-decided budget rather than guessing each time."]),
    mixedPara([bold("Does bankroll management change across different games?"), " The unit size and pace differ (rummy tables are stake-selected, slots run faster per bet, live casino tables carry higher minimums, Aviator runs two independent panels per round), but the core discipline — fixed budget, defined stop points, no chasing losses — is identical across every format."]),
    mixedPara([bold("What's a stop-loss and why does it matter?"), " A predefined point where you close the app for the session regardless of how you feel about recovering losses. Deciding it in advance matters because in-the-moment decisions after a loss tend to favor continuing rather than stopping."]),
    mixedPara([bold("Is increasing bet size after a loss ever good bankroll management?"), " No — raising a bet specifically to recover a previous loss increases what that single bet costs without improving its odds at all, and is one of the fastest ways to deplete a session budget."]),

    mixedPara([
      "For this same discipline applied specifically to Aviator, see our ",
      link("Aviator Betting Strategy and Risk Management", "/betting-guides/aviator-betting-strategy-and-risk-management"),
      " guide, and for a broader evaluation of gaming apps generally, our ",
      link("Best Real Money Gaming Apps in India", "/betting-guides/best-real-money-gaming-apps-in-india-2026"),
      " covers the wider picture. Whatever format you play, our ",
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
    heading: "Ready to Play With a Plan?",
    description: "Take these bankroll rules with you — start with a session budget you've already decided on UU7GAME.",
    buttonText: "Visit UU7GAME",
    buttonUrl: OFFICIAL_URL,
    position: 0,
  });

  await db.insert(postQuickAnswer).values({
    postId: post.id,
    text: "Bankroll management for real-money gaming means setting a total discretionary bankroll, splitting it into session budgets, sizing individual bets appropriately for the format (rummy, slots, live casino, or Aviator), and deciding stop-loss and stop-win points before each session starts — the same discipline applies across every format regardless of its specific odds.",
  });

  await db.insert(postAiSummary).values({
    postId: post.id,
    summary:
      "This guide covers general bankroll management for real-money gaming, applicable across every format on a platform like UU7GAME rather than one specific game. Core structure: set a total bankroll as genuinely discretionary money for a fixed period, split it into session budgets (dividing the total by expected number of sessions), and size individual bets/spins/hands appropriately for the specific format — rummy tables are selected by entry fee or per-point value, slots run faster per bet so unit size should be a smaller fraction of budget, live-casino minimums run higher than slots, and Aviator's dual betting panels should each draw from the same session budget rather than doubling exposure. Two decided-in-advance numbers matter most: a stop-loss (ending the session at a defined loss point) and a stop-win (ending it at a defined gain point rather than chasing a bigger one). Tracking session records (date, format, start/end amount, which stop rule ended it) is recommended alongside deposit/withdrawal records. Common mistakes covered: no separation between gaming and other finances, chasing losses with bigger bets, treating a stop-win as a new floor, and picking stakes based on availability rather than bankroll fit. Links to a dedicated Aviator-specific strategy guide and Responsible Gaming resources for deeper patterns bankroll rules alone don't address.",
  });

  await db.insert(postKeyTakeaways).values(
    [
      "Bankroll management is the one skill that applies identically across every real-money format, regardless of each game's specific odds.",
      "Set a total bankroll as genuinely discretionary money for a fixed period, then split it into individual session budgets rather than one open pool.",
      "Unit size varies by format — rummy tables are stake-selected, slots move faster per bet, live-casino minimums run higher, and Aviator's dual panels should share one session budget.",
      "Decide a stop-loss and a stop-win before each session starts — in-the-moment decisions after a loss or win tend to favor continuing rather than stopping.",
      "Increasing bet size to chase a loss raises what a single bet costs without improving its odds — a mistake that applies across every format identically.",
      "Bankroll rules assume gaming is a bounded entertainment expense — broader warning signs are covered separately in Responsible Gaming resources.",
    ].map((text, position) => ({ postId: post.id, text, position })),
  );

  await db.insert(postFaqs).values(
    [
      { question: "What is bankroll management in gaming?", answer: "The set of rules determining how much money you risk at any one time — a total bankroll, session budgets split from it, unit sizes appropriate to the format, and stop-loss/stop-win points — so that ordinary variance doesn't end your ability to play within your own plan." },
      { question: "How much of my bankroll should I bet per session?", answer: "A common approach is dividing your total period bankroll by the number of sessions you expect to play, giving each session a deliberate, pre-decided budget rather than guessing each time." },
      { question: "Does bankroll management change across different games?", answer: "The unit size and pace differ (rummy tables are stake-selected, slots run faster per bet, live casino tables carry higher minimums, Aviator runs two independent panels per round), but the core discipline — fixed budget, defined stop points, no chasing losses — is identical across every format." },
      { question: "What's a stop-loss and why does it matter?", answer: "A predefined point where you close the app for the session regardless of how you feel about recovering losses. Deciding it in advance matters because in-the-moment decisions after a loss tend to favor continuing rather than stopping." },
      { question: "Is increasing bet size after a loss ever good bankroll management?", answer: "No — raising a bet specifically to recover a previous loss increases what that single bet costs without improving its odds at all, and is one of the fastest ways to deplete a session budget." },
    ].map((f, position) => ({ postId: post.id, ...f, position })),
  );

  console.log("Created post:", post.id);
  process.exit(0);
}
main();
