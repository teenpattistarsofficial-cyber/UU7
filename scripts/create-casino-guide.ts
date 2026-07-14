import { db } from "@/lib/db";
import { posts, categories, authors, seoMeta, postQuickAnswer, postAiSummary, postKeyTakeaways, postFaqs } from "@/lib/db/schema";
import { extractText } from "@/lib/editor/text";
import type { JSONContent } from "@tiptap/core";
import { slugify } from "@/lib/seo/slugify";
import { eq } from "drizzle-orm";

const TITLE = "UU7GAME Casino Games Guide";
const SLUG = slugify(TITLE);
const CATEGORY_SLUG = "app-tutorials";
const AUTHOR_SLUG = "rohan-kapoor";
const IMAGE_URL = "https://images.pexels.com/photos/6664249/pexels-photo-6664249.jpeg?cs=srgb&dl=pexels-shvetsa-6664249.jpg&fm=jpg";
const FOCUS_KEYWORD = "uu7game casino";
const SEO_TITLE = "UU7GAME Casino Games Guide: Roulette, Blackjack, Baccarat";
const META_DESCRIPTION = "Rules and strategy for UU7GAME's live casino games — roulette, blackjack, baccarat, and poker — explained clearly for players new to live-dealer formats.";

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
      "UU7GAME casino games run on live human dealers rather than software RNG, covering four formats: roulette, blackjack, baccarat, and table-banked poker variants. Our ",
      link("Games Overview", "/app-tutorials/uu7game-games-overview"),
      " covers live casino briefly alongside the platform's seven other categories. This guide is the deep dive it points to: real rules and basic strategy for each format — the same treatment our Online Rummy Guide already gives to rummy specifically.",
    ]),
    h2("What Makes Live Casino Different"),
    p(
      "Every other real-money format on the platform — slots, Andar Bahar, Dragon Tiger — runs on a random number generator. Live casino replaces that entirely with a real human dealer, filmed and streamed to your device, running an actual physical table exactly as it would work in a physical casino. The cards, wheel, and dice are real objects, not simulated ones, which is the entire appeal for players who prefer that over software-driven randomness.",
    ),
    p(
      "A live studio typically runs multiple camera angles — a wide shot of the table and a close-up on the cards, wheel, or dice at the moment of the result — so you can verify the outcome yourself rather than trusting a number the software reports. This is the core trust mechanism live casino offers that RNG games structurally can't: you watch the actual physical event happen, rather than trusting that unseen code generated a fair result.",
    ),
    h2("Reading a Live Table Interface"),
    p(
      "Every live table interface works on roughly the same pattern regardless of which specific game you're playing: a betting window opens for a set number of seconds, a countdown timer shows how long you have left to place or change bets, and betting locks the moment the dealer starts dealing or spins the wheel. Missing the window means waiting for the next round — there's no late-bet option once the timer expires, since the round is a real physical event happening on a fixed schedule, not a system waiting on you.",
    ),
    p(
      "Most interfaces also show a running bet history and a chip tray for selecting stake size before placing a bet, along with a rebet or double-last-bet shortcut for repeating a previous round's wager without re-selecting each chip. A results history strip — usually a row of recent winning numbers, colors, or hands — sits near the table view on most live formats, useful for spotting patterns players sometimes look for, though it's worth remembering each round is an independent physical event and past results don't change the odds of the next one.",
    ),
    h2("Roulette: Rules and Bet Types"),
    p(
      "Roulette is built around a spinning wheel numbered 0–36 (European) or 0–00–36 (American), with a ball landing on one number each round. Bets fall into two broad categories: inside bets (a single number or small group of adjacent numbers, higher payout, lower odds) and outside bets (red/black, odd/even, or a dozen/column of twelve numbers, lower payout, better odds). European roulette carries a single zero rather than the American wheel's double zero, which meaningfully lowers the house edge — a detail worth knowing before assuming all roulette tables are mathematically identical.",
    ),
    p(
      "Common inside bets include a straight-up bet on a single number (the highest payout, typically 35 to 1), a split bet across two adjacent numbers, and a corner bet across four. Outside bets pay much less — typically even money for red/black or odd/even — but win far more often, since they cover roughly half the wheel each. Neither approach is objectively \"better\": inside bets suit players comfortable with rare, larger payouts, outside bets suit players who prefer frequent, smaller ones, and mixing both across a session is common practice rather than a strategy error.",
    ),
    p(
      "Announced or \"call\" bets covering specific wheel sections (like Voisins du Zero or Tiers du Cylindre in European roulette) exist in the physical game but aren't universally offered on every live table — check what's actually available on a specific table rather than assuming every variant supports every bet type.",
    ),
    h2("Blackjack: Rules and Basic Strategy"),
    p(
      "Blackjack's objective is to get a hand value closer to 21 than the dealer without going over. Each player is dealt two cards and chooses to hit (take another card), stand (keep the current total), double down (double the bet for exactly one more card), or split (separate two matching cards into two hands). Basic strategy — a well-documented, mathematically derived set of correct decisions for every possible hand versus every dealer upcard — is publicly available and playing it correctly is the single biggest factor separating a strong blackjack player from a weak one; it doesn't guarantee winning any individual hand, but it minimizes the house's edge more than any other adjustment a player can make.",
    ),
    p(
      "A few basic-strategy principles worth knowing even without memorizing a full chart: always split aces and eights, never split tens, stand on a hard 17 or higher, and hit a hard 12 through 16 against a dealer's 7 or higher. \"Hard\" means the hand contains no ace being counted as 11 — a \"soft\" hand with an ace behaves differently since the ace can drop to a value of 1 without busting, giving those hands more flexibility that basic strategy charts account for separately.",
    ),
    p(
      "Live blackjack typically follows standard rules around dealer behavior too: the dealer usually must hit on 16 or below and stand on 17 or above, removing any decision-making from their side of the table — the entire strategic element sits with the player, since the dealer's actions are fixed by house rules rather than judgment.",
    ),
    h2("Baccarat: Rules and Bet Types"),
    p(
      "Baccarat is simpler than either of the above: you bet on Player, Banker, or Tie before two hands are dealt, and whichever hand's total is closer to 9 wins (with 10s and face cards counting as zero). There's no decision-making once the bet is placed — the dealing follows fixed rules automatically — which makes baccarat one of the fastest and lowest-complexity live casino formats to learn, even though the underlying math (particularly why the Banker bet is statistically the strongest of the three) takes a little longer to fully understand.",
    ),
    p(
      "Hand totals above 9 drop the tens digit — a hand of 7 and 8 (totaling 15) counts as 5, not 15. A third card is drawn automatically for either hand under specific, fixed conditions based on the first two cards' total, which is why baccarat needs no player input beyond the initial bet: every subsequent action follows a published rule table rather than any choice. The Banker bet wins slightly more often than the Player bet over time, which is why it typically carries a small commission (often 5%) on winning bets — the house's way of balancing out that statistical edge rather than leaving it fully in the bettor's favor.",
    ),
    h2("Poker: Common Live Casino Variants"),
    p(
      "Live casino \"poker\" is usually a table-banked variant played against the dealer rather than multiplayer poker against other players — commonly Casino Hold'em or Three Card Poker, where you're comparing your hand against the dealer's rather than out-playing opponents at the table. These variants trade the bluffing and reads of traditional poker for a simpler, faster format closer in spirit to blackjack: understand the qualifying hand rules for whichever variant is on offer, and the strategy comes down to fixed, well-documented decisions rather than reading anyone across the table.",
    ),
    p(
      "In Casino Hold'em specifically, the dealer must qualify with a pair of fours or better; if the dealer doesn't qualify, the ante bet typically pays out regardless of your own hand strength. Three Card Poker instead compares three-card hands directly, with straights ranked higher than flushes — a deliberate departure from standard poker hand rankings that catches players used to traditional poker off guard the first time they encounter it.",
    ),
    h2("House Edge and Payouts, Compared"),
    p(
      "It helps to separate two related but distinct ideas here: house edge (the built-in mathematical advantage on a single bet type) and volatility (how much any individual session's results tend to swing above or below the long-run average). A low house edge like baccarat's Banker bet doesn't mean small, steady wins every session — individual sessions still swing based on ordinary variance. House edge describes what happens over a very large number of rounds, not what any one sitting will look like.",
    ),
    mixedPara([
      "Every casino game carries a built-in mathematical ",
      link("house edge", "https://en.wikipedia.org/wiki/Casino_game#House_advantage", true),
      " — the statistical advantage that ensures the house wins over a large enough number of rounds, regardless of any individual session's result. As commonly published industry figures (not numbers specific to any one platform): European roulette runs close to a 2.7% house edge, blackjack played with correct basic strategy is often under 1%, and baccarat's Banker bet sits close to 1.06% — among the lowest house edges of any casino game. These figures vary by exact table rules and aren't something we've independently audited for UU7GAME specifically, but they're useful as a general reference point for how these four formats compare to each other mathematically.",
    ]),
    h2("Etiquette and Tips for Live Dealer Tables"),
    p(
      "Live tables move slower than software-driven games by design — a real dealer has to physically deal cards or spin a wheel, and many tables support chat with the dealer and other players. Basic etiquette matters more here than on a solo slot spin: keep chat civil, place bets within the time window the dealer announces, and don't expect the same speed as an instant RNG round. Because sessions run longer per round, it's worth deciding your stopping point (in time or in budget) before you sit down rather than mid-session — the same habit our Deposit and Withdrawal Guide recommends for exactly this reason.",
    ),
    p(
      "Minimum stakes on live tables also tend to run higher than on slots or Andar Bahar, since a real dealer's time has a real cost the platform accounts for. Factor that into session planning specifically for live casino rather than assuming the same budget that covers an hour of slots will stretch as far across an hour of live blackjack.",
    ),
    h2("Which Casino Game Should You Start With?"),
    p(
      "If you want the simplest possible rules with no in-round decisions, baccarat is the easiest entry point. If you want a genuine skill component that rewards learning a fixed strategy, blackjack rewards the time investment more than any other format here. If you want variety in bet types and don't mind a higher house edge in exchange for more ways to bet, roulette offers the most flexibility. And if you enjoy hand comparisons without needing to read opponents, one of the table poker variants is worth trying.",
    ),
    p(
      "Whichever game you pick first, treat the first few sessions as learning sessions rather than results-focused ones — stick to smaller stakes until the table's specific pace, interface, and betting window feel familiar. Switching between formats is normal too: many players settle into baccarat or blackjack for regular play while treating roulette or table poker as an occasional change of pace rather than picking a single game permanently on day one.",
    ),
    h2("Common Questions"),
    mixedPara([bold("Is live casino better odds than slots?"), " Broadly, yes for blackjack and baccarat specifically — both carry a lower house edge than most slot machines, though roulette's edge is comparable to many slots depending on the specific game."]),
    mixedPara([bold("Do I need strategy to play baccarat?"), " No — baccarat has no player decisions once a bet is placed, which is exactly why it's often recommended as the simplest live casino format to start with."]),
    mixedPara([bold("Is live casino poker the same as regular poker?"), " Not usually — most live casino poker variants are played against the dealer, not other players, and use fixed qualifying-hand rules rather than the bluffing and betting rounds of traditional multiplayer poker."]),
    mixedPara([bold("Can I chat with the dealer during a live session?"), " Most live tables support a text chat feature aimed at the dealer and other players at the table, though what's enabled varies by table and studio — treat it as a courtesy feature, not a way to influence the outcome of any round."]),
    mixedPara([
      "For the full picture of UU7GAME's other game categories, see our ",
      link("Games Overview", "/app-tutorials/uu7game-games-overview"),
      ", and for card-game rules specifically, our ",
      link("Online Rummy Guide", "/game-guides/online-rummy-guide-rules-formats-and-strategy"),
      " covers rummy in the same depth this page covers live casino. Whatever you play, our ",
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
    text: "UU7GAME's casino section runs on live dealers rather than software RNG, covering roulette, blackjack, baccarat, and table-banked poker variants. Baccarat has the simplest rules, blackjack rewards learning basic strategy, and roulette offers the most bet-type variety — all four are covered in detail below.",
  });

  await db.insert(postAiSummary).values({
    postId: post.id,
    summary:
      "UU7GAME's live casino games are dealt by a real human dealer streamed in real time, rather than governed by a software RNG like the platform's slots and card games. The section covers four formats: roulette (a spinning numbered wheel with inside and outside bet types, European wheels carrying a lower house edge than American ones), blackjack (beat the dealer's hand without exceeding 21, with well-documented basic strategy minimizing the house edge to under 1%), baccarat (bet on Player, Banker, or Tie with no in-round decisions, the Banker bet carrying roughly a 1.06% house edge — among the lowest of any casino game), and table-banked poker variants like Casino Hold'em or Three Card Poker (played against the dealer rather than other players, using fixed qualifying-hand rules). Baccarat is the simplest entry point; blackjack rewards strategic learning most.",
  });

  await db.insert(postKeyTakeaways).values(
    [
      "UU7GAME's live casino runs on real human dealers, not a software RNG.",
      "Four formats: roulette, blackjack, baccarat, and table-banked poker variants.",
      "European roulette (single zero) carries a lower house edge than American roulette (double zero).",
      "Correct basic strategy in blackjack minimizes the house edge to often under 1%.",
      "Baccarat has no in-round player decisions — bet Player, Banker, or Tie and the dealing is automatic.",
      "Live casino poker variants are typically played against the dealer, not other players.",
    ].map((text, position) => ({ postId: post.id, text, position })),
  );

  await db.insert(postFaqs).values(
    [
      { question: "What live casino games does UU7GAME offer?", answer: "Roulette, blackjack, baccarat, and table-banked poker variants such as Casino Hold'em or Three Card Poker." },
      { question: "Is live casino better odds than slots?", answer: "Broadly yes for blackjack and baccarat specifically, both of which carry a lower house edge than most slot machines." },
      { question: "Do I need strategy to play baccarat?", answer: "No — baccarat has no player decisions once a bet is placed, making it one of the simplest live casino formats to start with." },
      { question: "What's the difference between European and American roulette?", answer: "European roulette has a single zero; American roulette adds a second zero (00), which raises the house edge." },
      { question: "Is live casino poker the same as regular multiplayer poker?", answer: "Usually not — most live casino poker variants are played against the dealer using fixed qualifying-hand rules, not against other players." },
    ].map((f, position) => ({ postId: post.id, ...f, position })),
  );

  console.log("Created post:", post.id);
  process.exit(0);
}
main();
