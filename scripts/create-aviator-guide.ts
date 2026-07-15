import { db } from "@/lib/db";
import { posts, categories, authors, seoMeta, postQuickAnswer, postAiSummary, postKeyTakeaways, postFaqs } from "@/lib/db/schema";
import { extractText } from "@/lib/editor/text";
import type { JSONContent } from "@tiptap/core";
import { slugify } from "@/lib/seo/slugify";
import { eq } from "drizzle-orm";

const TITLE = "UU7GAME Aviator Guide";
const SLUG = slugify(TITLE);
const CATEGORY_SLUG = "app-tutorials";
const AUTHOR_SLUG = "rohan-kapoor";
const IMAGE_URL = "https://images.pexels.com/photos/5206079/pexels-photo-5206079.jpeg?cs=srgb&dl=pexels-arnaud24-5206079.jpg&fm=jpg";
const FOCUS_KEYWORD = "uu7game aviator";
const SEO_TITLE = "UU7GAME Aviator Guide: How to Play, Bet, and Cash Out";
const META_DESCRIPTION = "A real look at UU7GAME's Aviator — dual betting, auto cash-out, bet limits, and how a round actually plays out, based on the game's own interface.";

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
      "UU7GAME Aviator is a crash-format game — place a bet, watch a multiplier climb, and cash out before the round ends or lose the stake. Our ",
      link("Mobile App", "/app-tutorials/uu7game-mobile-app"),
      " guide covers it briefly as one of several crash-style titles in the Hot tab; this guide is the deep dive, based directly on the game's own lobby placement, rules screen, and live betting interface.",
    ]),
    h2("What Is Aviator?"),
    mixedPara([
      "Aviator belongs to the \"crash game\" genre: every round starts at a 1.00x multiplier that climbs for as long as the round runs, and the only decision is when to cash out before it inevitably crashes. Cash out before the crash and you win your stake times whatever multiplier you cashed out at; still in when it crashes and the stake is lost. UU7GAME's own in-game rules screen describes it as being \"built on a ",
      link("provably fair", "https://www.webopedia.com/crypto/learn/provably-fair/", true),
      " system, which is currently the only real guarantee of honesty in the gambling industry\" — a cryptographic verification method that lets a player confirm a round's outcome wasn't altered after the bet was placed, rather than just trusting the platform's word for it. A \"This game is Provably Fair\" badge sits at the bottom of the live betting screen as well.",
    ]),
    p(
      "The rising-multiplier, cash-out-before-it-crashes mechanic was popularized by the original Aviator (created by the studio Spribe) and has since been widely cloned and re-skinned across the online gaming industry under many different names and visual themes. No provider logo or studio name appears on UU7GAME's rules screen or gameplay UI specifically, so this guide describes the mechanics exactly as they appear in the app rather than assuming which underlying studio built it.",
    ),
    h2("Where Aviator Lives in the App"),
    p(
      "Aviator is placed prominently on the main lobby grid, tagged with a large \"99,999x\" callout on its tile — a maximum-multiplier figure the platform advertises, not a per-round guarantee. It's reachable from the \"ALL\" tab (the lobby's default view) and also sits under the dedicated \"GAMES\" category icon in the left-hand sidebar alongside Teen Patti and similar titles, rather than being filed under Slots or Live Casino specifically.",
    ),
    p(
      "That category placement is worth noting for anyone browsing by format: a player specifically looking for RNG slot titles or live-dealer tables could easily scroll past Aviator if they don't check the Games tab or the lobby's front page, since it isn't grouped alongside the platform's other crash-adjacent or slot content. The \"99,999x\" figure on the lobby tile is the same kind of headline number as a slot's advertised maximum win multiplier — a theoretical ceiling built into the underlying math, not a realistic expectation for any individual round.",
    ),
    p(
      "A separate \"Crash\" title also appears in the same Hot tab lobby shelf as Aviator — the two are distinct entries with their own tiles and artwork rather than the same game under two names, though both belong to the same broad crash-format genre described above.",
    ),
    h2("Placing a Bet: Dual Betting Panels"),
    p(
      "The live game screen runs two identical betting panels side by side, each with its own stake amount and its own Bet/Auto toggle — meaning you can run two separate bets on the same round at once, each with its own plan (for example, cashing one out early for a small guaranteed win while letting the second ride for a bigger multiplier). Each panel defaults to a stake of 10, adjustable with a plus/minus stepper or one of four quick-select amounts: 100.00, 200.00, 500.00, and 1000.00.",
    ),
    p(
      "Once a bet is placed, that panel's button switches to a Cash Out action showing the current live multiplier and payout in real time — tapping it locks in whatever multiplier is showing at that instant. Missing the window means the round crashes with that panel's stake lost, same as not cashing out at all.",
    ),
    p(
      "Running two panels also means two entirely independent outcomes on the same round — one panel cashing out successfully doesn't affect the other, and it's entirely possible (and common, based on the live all-bets feed) for a player to win on one panel and lose on the other within the same few seconds. Treat each panel as its own bet with its own bankroll allocation rather than one combined stake split in half.",
    ),
    p(
      "There's no requirement to use both panels every round either — placing a bet on only one and leaving the second empty is a normal way to play, and the dual-panel layout is best read as an option for running two strategies at once rather than a mandatory feature of every round.",
    ),
    h2("Auto Mode: Automated Betting and Cash-Out"),
    p(
      "Each of the two betting panels has its own \"Auto\" tab next to the standard \"Bet\" tab. Auto mode is the standard crash-game mechanism for setting a target multiplier in advance and having the panel cash out automatically the instant the round reaches it, removing the need to react manually every round — useful for a consistent, repeatable strategy or simply for stepping away without missing a cash-out window entirely.",
    ),
    p(
      "In most crash games built around this mechanic, Auto mode typically also supports repeating the same stake automatically for a set number of rounds or until a stop condition is hit (a balance threshold reached, or a certain number of losses in a row) — since the exact set of Auto options wasn't fully visible in the specific screens reviewed for this guide, treat the target-multiplier behavior described above as confirmed and check the panel's own Auto tab directly for the full list of options it currently offers.",
    ),
    p(
      "A lower auto-cashout target (say, 1.5x) hits far more often than a high one (say, 5x or above), simply because most rounds crash before reaching a high multiplier — the round-history example later in this guide shows that pattern directly. Setting Auto targets on both panels at different levels is one direct way to use the dual-panel layout: a low, frequent target on one panel and a higher, rarer target on the other, rather than running the same target twice.",
    ),
    h2("Bet Limits"),
    p(
      "The default bet on each panel is 10, adjustable up or down with the stepper alongside the 100/200/500/1000 quick-select amounts. No explicit maximum bet figure is displayed on screen, but the live \"All Bets\" ledger — which lists every player's stake for the current round in real time — regularly shows individual bets in the 2,000 range, giving a practical sense of typical stakes even without a stated cap.",
    ),
    p(
      "Since both panels run independently, the real per-round maximum you could stake is effectively double whatever single-panel limit exists, split across two separate bets rather than one combined one. Budgeting per-panel rather than assuming a single combined figure avoids under- or over-estimating how much a full round with both panels active actually risks — worth working out before your first real-money round rather than mid-session.",
    ),
    h2("Reading a Live Round"),
    p(
      "A strip of past results sits above the main multiplier display, showing a running history of how recent rounds crashed — a real observed sequence looked like: 67x, 1.85x, 3.05x, 1.63x, 1.34x, 3.98x, 1.09x, 4.02x, 1.00x, 1.40x, 2.17x, 2.62x, 1.36x, 5.15x. That spread illustrates the format's actual shape: most rounds crash at low multipliers (many under 2x, and one at exactly 1.00x — an instant crash with no time to cash out at all), with occasional much larger multipliers appearing rarely. No amount of pattern-reading across this history changes the odds of the next round — each one is an independent event, the same principle that applies to slots and other RNG-driven formats.",
    ),
    p(
      "When a round ends, the screen displays \"FLEW AWAY!\" alongside the final crash multiplier. The \"All Bets\" panel (with \"My Bets\" and \"Top\" tabs alongside it) lists every player's stake and cash-out multiplier for that round, plus a running count of total bets placed — real entries show players cashing out at multipliers like 1.22x or 1.45x for a modest profit, while others show a 0.00 result, meaning they were still in when the round crashed. A \"Previous hand\" control lets you review the round before the current one.",
    ),
    p(
      "The \"My Bets\" tab filters that same feed down to just your own current and recent rounds, useful for reviewing your own results without scrolling past every other player's entry, while \"Top\" surfaces the highest multipliers or biggest payouts recently recorded — closer to a highlights reel than a representative sample of typical results, since by definition it only shows the rare large outcomes rather than the much more common small ones visible in the round-history strip.",
    ),
    h2("Tips for New Aviator Players"),
    bulletList([
      bulletItem(["Use the two betting panels for two different plans rather than identical bets — for example, a smaller stake with a low auto-cashout target for a steadier, more frequent return, alongside a second stake left to run manually for a shot at a bigger multiplier."]),
      bulletItem(["Decide a cash-out target (or set it via Auto) before the round starts rather than reacting in the moment — crash games move fast, and hesitating to \"wait for a bit more\" is exactly how a round that was profitable ends in a loss."]),
      bulletItem(["Treat the multiplier history as a record, not a prediction — a run of low crashes doesn't make a big one \"due,\" and a recent big multiplier doesn't make the next round riskier."]),
      bulletItem(["Practice reading the interface (Bet vs. Auto tabs, the stepper, the Cash Out button's live position) with small stakes before committing larger amounts, given how fast a round can end."]),
      bulletItem(["Set a session budget before you start rather than deciding round by round — crash games run fast enough that it's easy to place far more rounds per hour than a slower format like live casino, the same reason our Deposit and Withdrawal Guide recommends deciding a stopping point in advance for any real-money format."]),
    ]),
    h2("How Aviator Compares to UU7GAME's Other Formats"),
    p(
      "Aviator's round length sits closer to a slot spin than a live-dealer hand — each round resolves in seconds, and the two-panel layout means a single round can already involve two independent decisions rather than one. That combination (fast rounds, two simultaneous bets) can add up to considerably more total wagers per hour than a single-panel slot session or a live blackjack table, which is worth factoring into a session budget specifically for Aviator rather than assuming the same pace as other formats covered in our Slots Guide or Casino Games Guide.",
    ),
    h2("Common Questions"),
    mixedPara([bold("What is UU7GAME Aviator?"), " A crash-format game where a multiplier climbs from 1.00x and you cash out before it crashes — win your stake times the multiplier you cashed out at, or lose it if the round crashes first."]),
    mixedPara([bold("Does UU7GAME Aviator support betting on two panels at once?"), " Yes — the live game screen runs two identical, independent betting panels side by side, each with its own stake and Bet/Auto controls."]),
    mixedPara([bold("Is there an auto cash-out feature?"), " Yes — each betting panel has its own Auto tab for setting a target multiplier in advance, cashing out automatically once the round reaches it."]),
    mixedPara([bold("What is the minimum bet in UU7GAME Aviator?"), " The default and minimum shown on each panel is 10, adjustable with a stepper or quick-select amounts of 100, 200, 500, and 1000."]),
    mixedPara([bold("Is UU7GAME Aviator provably fair?"), " The game's own rules screen states it runs on a provably fair system, and a \"Provably Fair\" badge appears on the live betting screen — a verification method that lets a result be independently checked rather than just trusted."]),
    mixedPara([bold("Can I see what other players are betting in real time?"), " Yes — the \"All Bets\" feed lists every player's stake and cash-out multiplier for the current round as it happens, with separate \"My Bets\" and \"Top\" tabs for your own history and the biggest recent results."]),
    mixedPara([
      "For the full picture of UU7GAME's other game categories, see our ",
      link("Games Overview", "/app-tutorials/uu7game-games-overview"),
      " and ",
      link("Mobile App", "/app-tutorials/uu7game-mobile-app"),
      " guide, and for the platform's live-dealer table games specifically, our ",
      link("Casino Games Guide", "/app-tutorials/uu7game-casino-games-guide"),
      " covers roulette, blackjack, and baccarat in the same depth this page covers Aviator. Whatever you play, our ",
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

  await db.insert(postQuickAnswer).values({
    postId: post.id,
    text: "UU7GAME Aviator is a crash-format game — a multiplier climbs from 1.00x and you cash out before it crashes. The live screen runs two independent betting panels (each with Bet and Auto tabs), a default/minimum bet of 10, and a real-time \"All Bets\" feed showing every player's stake and cash-out result.",
  });

  await db.insert(postAiSummary).values({
    postId: post.id,
    summary:
      "UU7GAME Aviator is a crash-format game placed prominently on the main lobby and filed under the app's GAMES category. Each round starts at a 1.00x multiplier that climbs until it crashes; players cash out beforehand to win their stake times the multiplier, or lose the stake if still in when it crashes. The live betting screen runs two independent side-by-side panels, each defaulting to a stake of 10 (adjustable via stepper or 100/200/500/1000 quick-select amounts) and each with its own Auto tab for setting a target cash-out multiplier in advance. No explicit maximum bet is stated, though the live all-bets feed regularly shows stakes around 2,000. The game's own rules screen states it runs on a provably fair system, with a corresponding badge on the live betting screen, and a visible round-history strip shows past crash multipliers ranging from near-instant 1.00x crashes to rare large multipliers.",
  });

  await db.insert(postKeyTakeaways).values(
    [
      "UU7GAME Aviator is a crash-format game: a multiplier climbs from 1.00x and you cash out before it crashes.",
      "The live screen runs two independent betting panels side by side, each with its own stake and Bet/Auto controls.",
      "Auto mode lets each panel cash out automatically once a pre-set target multiplier is reached.",
      "The default and minimum bet per panel is 10, with quick-select amounts of 100, 200, 500, and 1000.",
      "No stated maximum bet is shown, but the live all-bets feed regularly shows stakes around 2,000.",
      "The game states it runs on a provably fair system, with a corresponding badge shown on the live betting screen.",
    ].map((text, position) => ({ postId: post.id, text, position })),
  );

  await db.insert(postFaqs).values(
    [
      { question: "What is UU7GAME Aviator?", answer: "A crash-format game where a multiplier climbs from 1.00x and you cash out before it crashes — win your stake times the multiplier you cashed out at, or lose it if the round crashes first." },
      { question: "Does UU7GAME Aviator support betting on two panels at once?", answer: "Yes — the live game screen runs two identical, independent betting panels side by side, each with its own stake and Bet/Auto controls." },
      { question: "Is there an auto cash-out feature?", answer: "Yes — each betting panel has its own Auto tab for setting a target multiplier in advance, cashing out automatically once the round reaches it." },
      { question: "What is the minimum bet in UU7GAME Aviator?", answer: "The default and minimum shown on each panel is 10, adjustable with a stepper or quick-select amounts of 100, 200, 500, and 1000." },
      { question: "Is UU7GAME Aviator provably fair?", answer: "The game's own rules screen states it runs on a provably fair system, and a \"Provably Fair\" badge appears on the live betting screen." },
      { question: "Can I see what other players are betting in real time?", answer: "Yes — the \"All Bets\" feed lists every player's stake and cash-out multiplier for the current round as it happens, with separate \"My Bets\" and \"Top\" tabs for your own history and the biggest recent results." },
    ].map((f, position) => ({ postId: post.id, ...f, position })),
  );

  console.log("Created post:", post.id);
  process.exit(0);
}
main();
