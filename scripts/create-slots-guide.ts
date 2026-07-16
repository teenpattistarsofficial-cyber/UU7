import { db } from "@/lib/db";
import { posts, categories, authors, seoMeta, postQuickAnswer, postAiSummary, postKeyTakeaways, postFaqs, postCtas } from "@/lib/db/schema";
import { extractText } from "@/lib/editor/text";
import type { JSONContent } from "@tiptap/core";
import { slugify } from "@/lib/seo/slugify";
import { eq } from "drizzle-orm";

const TITLE = "UU7GAME Slots Guide";
const SLUG = slugify(TITLE);
const CATEGORY_SLUG = "app-tutorials";
const AUTHOR_SLUG = "rohan-kapoor";
const IMAGE_URL = "https://images.pexels.com/photos/3021120/pexels-photo-3021120.jpeg?cs=srgb&dl=pexels-myatezhny39-3021120.jpg&fm=jpg";
const FOCUS_KEYWORD = "uu7game slots";
const SEO_TITLE = "UU7GAME Slots Guide: RTP, Volatility, and Paylines";
const META_DESCRIPTION = "How UU7GAME slots actually work — RTP, volatility, paylines, scatters, wilds, and progressive jackpots — explained for players new to online slots.";
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
      "UU7GAME slots run on a random number generator rather than a live dealer or physical reel, covering everything from simple three-reel formats to elaborate video slots and progressive jackpots. Our ",
      link("Games Overview", "/app-tutorials/uu7game-games-overview"),
      " covers slots briefly alongside the platform's seven other categories. This guide is the deep dive it points to: how RTP and volatility actually work, what paylines and scatters/wilds mean in practice, and how progressive jackpots differ from a fixed top prize — the same treatment our Casino Games Guide already gives to live-dealer formats.",
    ]),
    h2("How a Slot Actually Decides the Outcome"),
    p(
      "Every spin on a legitimate online slot is decided the instant you hit spin, by a random number generator (RNG) running continuously in the background — the reels spinning on screen are a visual animation of a result already determined, not a physical mechanism you're watching unfold in real time. This is the core structural difference from live casino: there's no physical wheel or card to verify, only the software's output, which is why RTP disclosure (below) matters so much more for slots than it does for a live dealer game you can watch happen.",
    ),
    p(
      "Because each spin is independent and random, no sequence of past spins changes the odds of the next one — a machine that hasn't paid out in a while is not \"due\" for a win, and one that just paid out isn't more likely to go cold. This is a common misconception worth stating plainly: RNG outcomes have no memory of previous rounds.",
    ),
    p(
      "Legitimate online slots have their RNG independently tested and certified by a third-party testing lab before the game goes live, and reputable platforms typically publish which lab certified a given title or their overall RNG system. That certification is what separates a legitimate slot from an unregulated one — it's worth checking that a platform discloses this rather than assuming every slot app is equally trustworthy by default.",
    ),
    h2("RTP and Volatility, Explained"),
    mixedPara([
      "Every legitimate online slot publishes a ",
      link("Return to Player", "https://en.wikipedia.org/wiki/Return_to_player", true),
      " (RTP) percentage — a theoretical long-run average of how much wagered money a slot pays back over millions of spins, not a guarantee for any single session. An RTP of 96%, for example, means that over a very large number of spins the game is designed to return 96% of total wagers as winnings — it says nothing about what happens across the 50 or 200 spins in a typical real session, where results swing well above or below that average in both directions.",
    ]),
    p(
      "Volatility (sometimes called variance) is the separate, equally important number: how big and how frequent the swings are around that average. A low-volatility slot pays smaller wins more often, keeping a session's balance relatively steady. A high-volatility slot pays rarely but bigger when it does, meaning long dry stretches are normal, not a sign anything is wrong. Two slots can share the same 96% RTP and feel completely different to play depending on volatility — RTP tells you the long-run average, volatility tells you the shape of the ride to get there.",
    ),
    p(
      "Matching volatility to your bankroll matters more than chasing the single highest RTP number available. A small bankroll on a high-volatility slot risks running out before a big win ever lands; the same bankroll on a low-volatility slot stretches across more spins with smaller, steadier swings. Neither is \"better\" in absolute terms — it's a question of what kind of session you want.",
    ),
    h2("Slot Types: Classic, Video, and High-Volatility Formats"),
    p(
      "Classic three-reel slots are the closest online equivalent to a physical fruit machine — few paylines, simple symbols, usually lower volatility, and a smaller maximum win multiplier. They suit players who want a fast, low-drama session rather than chasing a large jackpot.",
    ),
    p(
      "Video slots make up the bulk of most modern libraries: five reels, elaborate themes, and a wide spread of bonus mechanics layered on top of the base paylines or ways-to-win system. Within video slots there's still a wide volatility range from one title to the next, so the same \"video slot\" label covers everything from a fairly steady session to a genuinely streaky, high-variance one — the paytable, not the visual theme, is what actually tells you which kind you're playing.",
    ),
    p(
      "A newer category of high-volatility formats — often marketed around a specific mechanic like cascading/tumbling reels or cluster pays instead of traditional paylines — deliberately targets rare, very large multipliers at the cost of long dry stretches between meaningful wins. These suit players specifically looking for that kind of high-variance session; they're a poor fit for a small bankroll expecting steady, frequent smaller wins.",
    ),
    h2("Paylines, Reels, and Ways-to-Win"),
    p(
      "A classic three-reel slot has a small number of fixed paylines — specific patterns across the reels that pay out when matching symbols land on them. Modern video slots typically run five reels with anywhere from 20 to several hundred paylines, or increasingly use a \"ways to win\" or \"all ways\" system instead of fixed lines, where matching symbols pay if they appear on adjacent reels starting from the leftmost one, regardless of exact row position. More paylines or ways generally means more frequent smaller wins rather than a fundamentally different game — it changes the volatility profile as much as it changes the win frequency.",
    ),
    p(
      "Bet size on most slots is a function of your chosen coin value multiplied by the number of active paylines or ways — check exactly what a given bet level covers before assuming a low displayed \"bet\" number means every payline is covered, since an inactive payline can't pay out even if the matching symbols land on it.",
    ),
    h2("Scatters, Wilds, and Bonus Features"),
    p(
      "Wild symbols substitute for most other symbols to complete a winning combination, functioning similarly to a wild card in a card game — they don't usually substitute for scatter or bonus symbols specifically, which is worth checking in a slot's paytable rather than assuming a wild covers everything. Scatter symbols typically don't need to land on an active payline to pay out or trigger a feature — landing a set number anywhere on the reels is usually enough, most commonly triggering free spins.",
    ),
    p(
      "Free spins rounds usually run at the same bet level as the triggering spin but often add a multiplier or extra wild frequency, meaningfully changing the volatility of that stretch of play compared to the base game. Other common bonus mechanics include expanding wilds (a wild that grows to fill an entire reel), sticky wilds (a wild that stays in place across multiple spins during a bonus round), and pick-a-prize bonus screens with a fixed table of possible outcomes behind each pick — all published in the slot's paytable/rules screen rather than left to guesswork.",
    ),
    h2("Progressive Jackpots vs. Fixed Top Prizes"),
    p(
      "A fixed-jackpot slot's top prize is a set amount published in the paytable and doesn't change based on how much has been wagered. A progressive jackpot slot instead pools a small percentage of every wager across a network of players into a jackpot that grows continuously until someone hits the triggering combination or bonus round, at which point it resets to a seeded base amount and starts climbing again.",
    ),
    p(
      "Progressive jackpots carry a meaningfully lower RTP on the base game in exchange for that jackpot's contribution — the jackpot itself is what makes up the difference over a very long run, not a guarantee any individual player sees it. They also tend to run higher volatility than the same publisher's fixed-jackpot titles, since a meaningful share of the payout math is wrapped up in a rare, large jackpot hit rather than distributed across more frequent smaller wins.",
    ),
    p(
      "Some progressive slots also require a maximum bet to qualify for the jackpot at all — betting below that threshold can still trigger the base game's regular wins but locks you out of the jackpot itself, which is exactly the kind of rule the paytable screen below exists to clarify before you commit real money to chasing it.",
    ),
    h2("Reading a Slot's Paytable Before You Spin"),
    p(
      "Every legitimate slot has a paytable screen (usually an info or \"i\" icon near the reels) listing the RTP, volatility rating if disclosed, the value of each symbol at different match counts, and the exact rules for wilds, scatters, and any bonus round. Reading it before your first real-money spin on a new title takes under a minute and tells you far more about what kind of session to expect than the reels' visual theme does — two slots with an identical pirate or fruit-machine skin can have completely different RTP and volatility underneath.",
    ),
    bulletList([
      bulletItem(["Check the published RTP — most paytables disclose it directly, and it's the single most important number on the screen."]),
      bulletItem(["Check volatility, if disclosed, or infer it from the paytable's payout spread between common and rare symbols."]),
      bulletItem(["Confirm what wilds do and don't substitute for, and what triggers scatters/bonus rounds."]),
      bulletItem(["Note the maximum bet needed to qualify for a progressive jackpot, if the title has one — some require max bet to be eligible."]),
    ]),
    p(
      "It's also worth checking the maximum win multiplier a slot advertises, usually expressed as a multiple of the triggering bet (for example, up to 5,000x). This figure is closely tied to volatility: a high maximum multiplier is a strong signal that the game is built around rare, large payouts rather than frequent smaller ones, even before checking the volatility rating directly.",
    ),
    h2("Session and Bankroll Tips Specific to Slots"),
    p(
      "Because slots run faster per spin than any live-dealer format, it's easy to place far more bets per hour than table games allow — which makes deciding a stopping point (in time or in budget) before you start even more important here than for live casino, the same habit our Deposit and Withdrawal Guide recommends generally. Setting a per-session budget you're comfortable losing entirely, rather than a target you expect to win, keeps the fast pace of slot play from outrunning your original plan.",
    ),
    p(
      "Higher-volatility slots and progressive jackpots in particular can produce long stretches with no meaningful win — that's the expected shape of that kind of game, not a sign of a fault, and budgeting for it in advance avoids chasing losses into a bigger bet than originally planned.",
    ),
    p(
      "Matching bet size to your total bankroll rather than to what feels exciting in the moment is the single most controllable factor in how long a session lasts. A common rule of thumb some players use is keeping a single spin's bet to a small fraction of the total session bankroll — small enough that a losing streak doesn't end the session before volatility has a chance to even out — though the right fraction depends entirely on the specific slot's volatility and your own comfort with variance.",
    ),
    h2("Common Questions"),
    mixedPara([bold("What does RTP mean on a slot?"), " Return to Player — a theoretical long-run average of how much wagered money a slot returns as winnings over millions of spins, not a guarantee for any single session."]),
    mixedPara([bold("Is a slot 'due' for a win after a long losing streak?"), " No — each spin is decided independently by the RNG with no memory of prior spins, so past results don't change the odds of the next one."]),
    mixedPara([bold("What's the difference between a wild and a scatter symbol?"), " A wild substitutes for other symbols to help complete a winning combination; a scatter typically doesn't need to land on a payline and usually triggers a bonus feature like free spins instead."]),
    mixedPara([bold("Do progressive jackpot slots pay less on the base game?"), " Generally yes — a portion of every wager's expected return is redirected into the growing jackpot pool, which typically lowers the base game's own RTP compared to a fixed-jackpot version of a similar slot."]),
    mixedPara([bold("Where can I find a slot's RTP before playing?"), " On the slot's own info or paytable screen, usually reachable via an \"i\" icon near the reels — legitimate slots disclose it there rather than requiring you to look it up externally."]),
    mixedPara([
      "For the full picture of UU7GAME's other game categories, see our ",
      link("Games Overview", "/app-tutorials/uu7game-games-overview"),
      ", and for live human-dealer formats specifically, our ",
      link("Casino Games Guide", "/app-tutorials/uu7game-casino-games-guide"),
      " covers roulette, blackjack, baccarat, and poker in the same depth this page covers slots. Whatever you play, our ",
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
    heading: "Ready to Spin?",
    description: "Try UU7GAME's slots with RTP and volatility info already in hand.",
    buttonText: "Visit UU7GAME",
    buttonUrl: OFFICIAL_URL,
    position: 0,
  });

  await db.insert(postQuickAnswer).values({
    postId: post.id,
    text: "UU7GAME slots run on a random number generator, with outcomes governed by two published numbers: RTP (the long-run average percentage returned to players) and volatility (how big and frequent wins are around that average). Paylines/ways, wilds, scatters, and progressive jackpots are covered in detail below.",
  });

  await db.insert(postAiSummary).values({
    postId: post.id,
    summary:
      "UU7GAME slots are decided instantly by a random number generator when a spin is placed, with the visible reel animation representing an already-determined result rather than a physical mechanism. Two published numbers define how a slot plays: RTP (Return to Player, a theoretical long-run percentage of wagers returned as winnings) and volatility (how large and how frequent wins are around that average — low volatility pays small and often, high volatility pays rarely but bigger). Modern slots use paylines or a \"ways to win\" system across typically five reels, with wild symbols substituting for other symbols and scatter symbols usually triggering bonus features like free spins without needing to land on an active payline. Progressive jackpot slots pool a percentage of every wager across a network of players into a growing jackpot, typically at the cost of a lower base-game RTP than an equivalent fixed-jackpot slot. Every legitimate slot publishes its RTP and paytable rules in an in-game info screen before a player spins.",
  });

  await db.insert(postKeyTakeaways).values(
    [
      "Slots are decided by a random number generator the instant a spin is placed — the reel animation shows an already-determined result.",
      "RTP is a long-run average percentage returned to players over millions of spins, not a guarantee for any single session.",
      "Volatility describes how big and frequent wins are — low volatility pays small and often, high volatility pays rarely but bigger.",
      "Wild symbols substitute for other symbols; scatter symbols usually trigger bonus features like free spins without needing an active payline.",
      "Progressive jackpots pool a share of every wager into a growing prize, typically lowering the base game's own RTP versus a fixed-jackpot slot.",
      "A slot's paytable screen discloses RTP and exact wild/scatter/bonus rules before you spend real money on it.",
    ].map((text, position) => ({ postId: post.id, text, position })),
  );

  await db.insert(postFaqs).values(
    [
      { question: "What does RTP mean on a slot?", answer: "Return to Player — a theoretical long-run average of how much wagered money a slot returns as winnings over millions of spins, not a guarantee for any single session." },
      { question: "Is a slot 'due' for a win after a long losing streak?", answer: "No — each spin is decided independently by the RNG with no memory of prior spins, so past results don't change the odds of the next one." },
      { question: "What's the difference between a wild and a scatter symbol?", answer: "A wild substitutes for other symbols to help complete a winning combination; a scatter typically doesn't need to land on a payline and usually triggers a bonus feature like free spins instead." },
      { question: "Do progressive jackpot slots pay less on the base game?", answer: "Generally yes — a portion of every wager's expected return is redirected into the growing jackpot pool, which typically lowers the base game's own RTP compared to a fixed-jackpot version of a similar slot." },
      { question: "What's the difference between paylines and 'ways to win'?", answer: "Paylines are fixed patterns across the reels that must be matched exactly; a 'ways to win' system pays for matching symbols on adjacent reels starting from the leftmost reel, regardless of exact row position." },
      { question: "Where can I find a slot's RTP before playing?", answer: "On the slot's own info or paytable screen, usually reachable via an \"i\" icon near the reels — legitimate slots disclose it there rather than requiring an external lookup." },
    ].map((f, position) => ({ postId: post.id, ...f, position })),
  );

  console.log("Created post:", post.id);
  process.exit(0);
}
main();
