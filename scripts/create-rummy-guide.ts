import { db } from "@/lib/db";
import { posts, seoMeta, postQuickAnswer, postAiSummary, postKeyTakeaways, postFaqs } from "@/lib/db/schema";
import { extractText } from "@/lib/editor/text";
import type { JSONContent } from "@tiptap/core";
import { slugify } from "@/lib/seo/slugify";
import { eq } from "drizzle-orm";

const TITLE = "UU7GAME Rummy Guide";
const SLUG = slugify(TITLE);
const CATEGORY_ID = "a18e720a-7e5c-4ae7-9492-10eff8c201d7"; // App Tutorials
const AUTHOR_ID = "1872efbc-b733-4717-983d-0cd9fe9726bd"; // Rohan Kapoor
const IMAGE_URL = "https://images.pexels.com/photos/2508565/pexels-photo-2508565.jpeg?cs=srgb&dl=pexels-didsss-2508565.jpg&fm=jpg";
const FOCUS_KEYWORD = "uu7game rummy";
const SEO_TITLE = "UU7GAME Rummy Guide: Formats, Tables, and Getting Started";
const META_DESCRIPTION = "How rummy actually works on UU7GAME — formats, cash vs practice tables, legality, and how to start your first game — plus where to go for full rummy strategy.";

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
      "UU7GAME rummy runs across the three formats most Indian real-money platforms offer — Points, Pool, and Deals Rummy — as our ",
      link("Games Overview", "/app-tutorials/uu7game-games-overview"),
      " briefly covers alongside the platform's seven other categories. This guide is specifically about the UU7GAME side of things: which formats you'll find, cash tables versus practice play, where rummy stands legally in India, and how to get from a fresh account to your first hand. For the actual rules of forming sequences and sets, joker usage, and hand-by-hand strategy, our ",
      link("Online Rummy Guide", "/game-guides/online-rummy-guide-rules-formats-and-strategy"),
      " already covers that in full depth — this page won't repeat it.",
    ]),
    h2("Rummy Formats on UU7GAME"),
    p(
      "Points, Pool, and Deals Rummy are the three formats you'll encounter, each suited to a different session length. Points Rummy settles after a single hand — each point carries a pre-agreed value, and whoever declares first collects points from every other player at the table based on the unmatched cards left in their hands. It's the fastest way to play a short session and the easiest format to learn on, since one hand fully resolves the round.",
    ),
    p(
      "Pool Rummy extends across multiple hands, with players eliminated once their accumulated points cross a fixed threshold — commonly structured as 101-point or 201-point pools industry-wide, though the exact thresholds and stakes on any given table are set by the table itself, not fixed platform-wide. Deals Rummy instead fixes the number of hands in advance (commonly two, three, or six deals) and whoever holds the fewest points once every deal is played wins the game — a format that rewards consistent play across several hands rather than one lucky round.",
    ),
    p(
      "Because Pool and Deals formats run longer per session than Points Rummy, they suit players who want an extended sitting rather than a quick single-hand result — worth factoring in alongside your own available time and bankroll before picking a table.",
    ),
    p(
      "A worked example makes the points math concrete: in a 101-point pool, a player who reaches or crosses 101 accumulated points across hands is eliminated from the pool, while remaining players continue until only one is left (or until the pool's own end condition, set by the platform, is reached). Each hand's points are scored the same way as Points Rummy — based on the unmatched cards left in losing hands — they simply accumulate across the pool instead of resetting after a single hand.",
    ),
    p(
      "Deals Rummy works differently again: rather than eliminating players, every player plays the same fixed number of hands (deals) regardless of how many points they accumulate along the way, and the player with the lowest total points once the last deal finishes wins the game. This makes Deals Rummy the most \"complete game\" of the three formats — a single bad hand doesn't end your participation the way crossing a pool threshold would, since there's no elimination mechanic at all.",
    ),
    h2("Cash Tables vs. Practice Play"),
    p(
      "Most Indian real-money rummy platforms — UU7GAME included — offer both free practice tables and real-cash tables side by side, letting new players learn a format's pacing and interface before wagering real money on it. Practice tables use play chips with no cash value, while cash tables involve real deposited funds and require the account verification (KYC) steps covered in our Registration Guide before you can join one.",
    ),
    p(
      "If you're new to a specific format — Pool Rummy's elimination mechanic in particular catches new players off guard the first time a threshold is crossed mid-session — a few practice hands before moving to a cash table is a low-cost way to get comfortable with the format's specific pacing rather than learning it with money on the line.",
    ),
    p(
      "Practice tables also let you get used to the interface itself — how discards are shown, how the draw pile and discard pile are laid out, and how a declaration is submitted — before any of those interactions involve real money. This matters more for rummy than for a simpler format like a slot spin, since a mis-tap during a live cash hand (declaring early, discarding the wrong card) can't usually be undone once submitted.",
    ),
    h2("Choosing Between Points, Pool, and Deals"),
    p(
      "If you only have a few minutes and want one quick, self-contained result, Points Rummy is the format built for that — a single hand, scored and settled immediately, with no ongoing commitment to future hands. If you want a longer session with a real chance to come back from an early bad hand, Deals Rummy's fixed-hand-count structure rewards consistency over a full sitting rather than eliminating you after one rough round. Pool Rummy sits in between: longer than a single hand but with real stakes attached to avoiding elimination, which suits players who want the tension of a knockout format without committing to a full fixed-length session.",
    ),
    p(
      "None of these formats change the underlying rummy rules — sequences, sets, and joker usage work identically across all three. What changes is purely the session structure and how points carry (or don't carry) between hands, which is why picking a format is really a question of how much time and how much risk-per-hand you want, not a question of learning different card rules for each one.",
    ),
    p(
      "It's also worth trying more than one format across your first few sessions rather than settling on whichever one you happen to open first — the pacing differences between a single Points Rummy hand and a full Deals Rummy session are large enough that most players end up with a clear format preference only after actually playing each one, not from reading a description of how they differ.",
    ),
    h2("Is Rummy Legal to Play for Real Money in India?"),
    mixedPara([
      "Indian courts have repeatedly classified rummy as a ",
      link("game of skill", "https://en.wikipedia.org/wiki/Rummy#Rummy_as_a_game_of_skill", true),
      " rather than a game of chance, a distinction that matters because most Indian states' gambling laws specifically exempt skill-based games from their restrictions on games of chance. This classification has been upheld in multiple state high court rulings and is the legal basis most Indian real-money rummy platforms rely on. That said, a small number of states have their own specific restrictions or bans on real-money gaming that aren't necessarily carved out by the game-of-skill classification alone — checking your own state's current rules before depositing real money is worth doing regardless of which platform you're using, since this is a legal question that sits above any individual platform's own policies.",
    ]),
    h2("How to Start Playing Rummy on UU7GAME"),
    mixedPara([
      "Getting from a fresh account to your first real-money rummy hand runs through the same steps as any other cash game on the platform. First, complete registration — our ",
      link("Registration Guide", "/app-tutorials/uu7game-registration-guide"),
      " covers the minimum legal age, KYC verification, and what to have ready beforehand. Once registered, log in (our ",
      link("Login Guide", "/app-tutorials/uu7game-login-guide"),
      " covers this if you run into any issues) and add funds through the deposit flow our ",
      link("Deposit and Withdrawal Guide", "/app-tutorials/uu7game-deposit-and-withdrawal-guide"),
      " walks through in detail.",
    ]),
    p(
      "From there, navigate to the rummy category, pick a format (Points for a quick single hand, Pool or Deals for a longer session), and choose a table matching your intended stake — tables are typically organized by entry fee or points value, letting you match a table to your own bankroll before joining rather than committing to a stake level you're unsure about.",
    ),
    h2("Choosing a Table That Fits Your Bankroll"),
    p(
      "Entry fees and points values vary by table, and picking one that's a comfortable fraction of your total rummy bankroll — rather than the highest stake available — is the same bankroll-management principle that applies across every real-money format on the platform. A string of losses at a stake too high for your total bankroll ends a session early regardless of how good your actual rummy decisions were; a stake that's appropriately sized lets ordinary variance play out without threatening the whole session.",
    ),
    p(
      "It's also worth deciding in advance how many hands or how much time you intend to play before sitting down, the same habit our Deposit and Withdrawal Guide recommends generally — rummy hands resolve faster than a live-dealer round, which makes it easy to play more hands in an hour than you'd initially planned without a stopping point set ahead of time.",
    ),
    p(
      "Table stakes on rummy platforms are typically shown as either a fixed entry fee (common in Pool and Deals formats) or a per-point value (common in Points Rummy, where your total win or loss for the hand is the point value multiplied by the points difference). Checking which of the two a specific table uses before joining avoids misjudging how much a single hand could actually cost relative to what the table's headline number implies.",
    ),
    h2("Common Mistakes New Players Make"),
    bulletList([
      bulletItem(["Declaring without a pure sequence — even a hand where every card is technically placed into a sequence or set doesn't qualify as a valid declaration without at least one pure (no-joker) sequence, and an invalid declaration typically carries a scoring penalty."]),
      bulletItem(["Jumping straight to a cash table on an unfamiliar format — Pool Rummy's elimination threshold in particular is easy to misjudge the first few times, and a practice hand or two costs nothing."]),
      bulletItem(["Picking a stake based on what's available rather than what fits total bankroll — the highest-stake table isn't automatically the best one to sit down at."]),
      bulletItem(["Treating a long losing streak in Pool Rummy as a sign to change strategy mid-pool — ordinary variance across hands is normal, and no strategy adjustment reliably reverses a specific bad run of cards."]),
    ]),
    h2("A Quick Rules Recap"),
    p(
      "Each player is dealt 13 cards and must arrange them into valid sequences and sets, drawing one card and discarding one each turn, declaring once a valid hand is formed. At least one sequence must be a \"pure\" sequence — three or more consecutive cards of the same suit with no joker substituted in — a rule that trips up new players more than any other, since a hand with only impure sequences (jokers used) doesn't qualify as a valid declaration even if every card is technically placed. For the full breakdown of sequences, sets, joker rules, and turn-by-turn strategy, our Online Rummy Guide covers all of it in depth — this recap is only enough to follow the format descriptions above.",
    ),
    h2("Common Questions"),
    mixedPara([bold("What rummy formats does UU7GAME offer?"), " Points, Pool, and Deals Rummy — the three formats found across most Indian real-money rummy platforms, differing mainly in session length and how points carry between hands."]),
    mixedPara([bold("Is rummy legal to play for real money in India?"), " Indian courts have classified rummy as a game of skill rather than a game of chance in multiple rulings, which is the legal basis most platforms operate under — though a small number of states have their own specific restrictions worth checking independently."]),
    mixedPara([bold("Can I practice rummy before playing with real money?"), " Most real-money rummy platforms, including UU7GAME, offer free practice tables using play chips alongside real-cash tables, letting you learn a format's pacing before wagering real money."]),
    mixedPara([bold("What's a 'pure sequence' in rummy?"), " Three or more consecutive cards of the same suit with no joker substituted in — at least one is required in every valid declaration, even if the rest of the hand uses jokers."]),
    mixedPara([bold("Which rummy format should a beginner start with?"), " Points Rummy is generally the easiest entry point — a single hand with an immediate result — before moving to the longer session structures of Pool or Deals Rummy once the pacing and interface feel familiar."]),
    mixedPara([bold("What happens if I declare an invalid hand in rummy?"), " An invalid declaration — most commonly missing the required pure sequence — typically carries a scoring penalty rather than simply being ignored, which is why checking for a pure sequence before declaring matters more than any other single check."]),
    mixedPara([
      "For the full picture of UU7GAME's other game categories, see our ",
      link("Games Overview", "/app-tutorials/uu7game-games-overview"),
      ", for complete rummy rules and strategy our ",
      link("Online Rummy Guide", "/game-guides/online-rummy-guide-rules-formats-and-strategy"),
      " is the deeper reference, and before your first real-money session our ",
      link("Registration Guide", "/app-tutorials/uu7game-registration-guide"),
      " and ",
      link("Deposit and Withdrawal Guide", "/app-tutorials/uu7game-deposit-and-withdrawal-guide"),
      " cover what you'll need. Whatever stakes you play, our ",
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

  const [post] = await db
    .insert(posts)
    .values({
      title: TITLE,
      slug: SLUG,
      content,
      status: "published",
      categoryId: CATEGORY_ID,
      authorId: AUTHOR_ID,
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
    text: "UU7GAME rummy covers Points, Pool, and Deals Rummy, with both practice tables (play chips) and real-cash tables available. Rummy is legally classified as a game of skill in India by multiple court rulings, though a few states have their own restrictions. Full setup runs through Registration, Login, and Deposit — covered below.",
  });

  await db.insert(postAiSummary).values({
    postId: post.id,
    summary:
      "UU7GAME's rummy section offers three formats: Points Rummy (a single hand, fastest to play), Pool Rummy (multiple hands with players eliminated once accumulated points cross a fixed threshold, commonly 101 or 201 points industry-wide), and Deals Rummy (a fixed number of hands, lowest total points wins). Most Indian real-money rummy platforms, including UU7GAME, offer both free practice tables using play chips and real-cash tables requiring KYC-verified accounts. Indian courts have repeatedly classified rummy as a game of skill rather than chance, which is the legal basis most platforms operate under, though a small number of states maintain their own specific restrictions. Getting started requires registration, login, and a deposit before joining a real-money table; entry fees and points values vary by table. For full rummy rules (sequences, sets, joker usage) and strategy, a separate dedicated Online Rummy Guide covers that depth.",
  });

  await db.insert(postKeyTakeaways).values(
    [
      "UU7GAME rummy offers three formats: Points, Pool, and Deals Rummy, differing mainly in session length.",
      "Pool Rummy eliminates players once accumulated points cross a fixed threshold, commonly 101 or 201 points industry-wide.",
      "Both free practice tables and real-cash tables are typically available, letting new players learn a format before wagering.",
      "Indian courts have classified rummy as a game of skill in multiple rulings — the legal basis most platforms rely on, though some states have their own restrictions.",
      "Starting real-money play requires registration, login, and a deposit before joining a cash table.",
      "At least one pure sequence (no joker) is required in every valid rummy declaration, regardless of format.",
    ].map((text, position) => ({ postId: post.id, text, position })),
  );

  await db.insert(postFaqs).values(
    [
      { question: "What rummy formats does UU7GAME offer?", answer: "Points, Pool, and Deals Rummy — the three formats found across most Indian real-money rummy platforms, differing mainly in session length and how points carry between hands." },
      { question: "Is rummy legal to play for real money in India?", answer: "Indian courts have classified rummy as a game of skill rather than a game of chance in multiple rulings, which is the legal basis most platforms operate under — though a small number of states have their own specific restrictions worth checking independently." },
      { question: "Can I practice rummy before playing with real money?", answer: "Most real-money rummy platforms, including UU7GAME, offer free practice tables using play chips alongside real-cash tables, letting you learn a format's pacing before wagering real money." },
      { question: "What's a 'pure sequence' in rummy?", answer: "Three or more consecutive cards of the same suit with no joker substituted in — at least one is required in every valid declaration, even if the rest of the hand uses jokers." },
      { question: "What's the difference between Pool Rummy and Deals Rummy?", answer: "Pool Rummy eliminates players once accumulated points cross a fixed threshold across multiple hands; Deals Rummy instead fixes the number of hands in advance, and whoever has the fewest total points once every deal is played wins." },
      { question: "Which rummy format should a beginner start with?", answer: "Points Rummy is generally the easiest entry point — a single hand with an immediate result — before moving to Pool or Deals Rummy once the pacing feels familiar." },
      { question: "What happens if I declare an invalid hand in rummy?", answer: "An invalid declaration, most commonly missing the required pure sequence, typically carries a scoring penalty rather than simply being ignored." },
    ].map((f, position) => ({ postId: post.id, ...f, position })),
  );

  console.log("Created post:", post.id);
  process.exit(0);
}
main();
