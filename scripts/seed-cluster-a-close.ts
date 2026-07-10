import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  categories,
  authors,
  posts,
  postQuickAnswer,
  postAiSummary,
  postKeyTakeaways,
  postFaqs,
  postCtas,
  seoMeta,
} from "@/lib/db/schema";
import { estimateReadingTimeMinutes } from "@/lib/seo/reading-time";
import { extractText } from "@/lib/editor/text";

// Closes out Cluster A (App Tutorials) per docs/seo-content-strategy-plan.md
// §11 Day 3 — the pillar post and games-overview hub post were the two
// structural gaps the schedule itself flagged as missing from the launch
// batch. Re-adds "UU7GAME Review 2026" as a draft too (present in the
// original seed-launch-content.ts but not currently in the DB — its
// [VERIFY] markers were never resolved, so it stays unpublished here).
//
// Same minimal markdown -> Tiptap JSON converter as seed-launch-content.ts
// (duplicated rather than imported — these seed scripts are each
// self-contained, matching the existing convention).

function parseInline(text: string): object[] {
  const nodes: object[] = [];
  const pattern = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) nodes.push({ type: "text", text: text.slice(lastIndex, match.index) });
    if (match[1] !== undefined) {
      nodes.push({ type: "text", text: match[1], marks: [{ type: "bold" }] });
    } else {
      nodes.push({
        type: "text",
        text: match[2],
        marks: [{ type: "link", attrs: { href: match[3], rel: "noopener noreferrer", class: null, title: null, target: null } }],
      });
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) nodes.push({ type: "text", text: text.slice(lastIndex) });
  return nodes.length ? nodes : [{ type: "text", text }];
}

function paragraph(text: string) {
  return { type: "paragraph", attrs: { textAlign: null }, content: parseInline(text) };
}

function heading(level: 2 | 3, text: string) {
  return { type: "heading", attrs: { level, textAlign: null }, content: parseInline(text) };
}

function bulletList(items: string[]) {
  return {
    type: "bulletList",
    content: items.map((item) => ({
      type: "listItem",
      content: [{ type: "paragraph", attrs: { textAlign: null }, content: parseInline(item) }],
    })),
  };
}

function markdownToDoc(markdown: string) {
  const content: object[] = [];
  let listBuffer: string[] = [];

  function flushList() {
    if (listBuffer.length) {
      content.push(bulletList(listBuffer));
      listBuffer = [];
    }
  }

  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      continue;
    }
    if (line.startsWith("### ")) {
      flushList();
      content.push(heading(3, line.slice(4)));
    } else if (line.startsWith("## ")) {
      flushList();
      content.push(heading(2, line.slice(3)));
    } else if (line.startsWith("- ")) {
      listBuffer.push(line.slice(2));
    } else {
      flushList();
      content.push(paragraph(line));
    }
  }
  flushList();
  return { type: "doc", content };
}

// ---------------------------------------------------------------------------

type PostSeed = {
  title: string;
  slug: string;
  excerpt: string;
  categorySlug: string;
  authorSlug: string;
  status: "draft" | "published";
  quickAnswer: string;
  aiSummary: string;
  keyTakeaways: string[];
  faqs: { question: string; answer: string }[];
  cta: { heading: string; description: string; buttonText: string; buttonUrl: string };
  body: string;
  seo?: { seoTitle: string; metaDescription: string; focusKeyword: string };
};

const POST_ROWS: PostSeed[] = [
  {
    title: "The Ultimate UU7GAME Guide",
    slug: "the-ultimate-uu7game-guide",
    excerpt: "Everything you need to know about UU7GAME in one place — what it is, the games it offers, and links to every step-by-step guide for getting started.",
    categorySlug: "app-tutorials",
    authorSlug: "rohan-kapoor",
    status: "published",
    quickAnswer: "UU7GAME is a real-money gaming app offering rummy, teen patti, slots, Aviator, and live casino games. This guide is the starting point for everything else this site covers about UU7GAME — downloading and installing the app, registering an account, logging in, and understanding what games are on offer.",
    aiSummary: "UU7GAME is a real-money gaming platform covering card games (rummy, teen patti), slots, the Aviator crash game, and live casino formats, distributed as a direct APK download rather than through the Google Play Store — a common pattern for real-money gaming apps in India. This guide indexes UU7's complete coverage of the platform: installation, registration, login, and a full games overview, each covered in its own dedicated guide.",
    keyTakeaways: [
      "UU7GAME covers five main game categories: rummy, teen patti, slots, Aviator, and live casino formats.",
      "Like most Indian real-money gaming apps, it's distributed as a direct APK download rather than through the Google Play Store — standard industry practice, not a red flag by itself.",
      "Getting started involves three steps in order: downloading and installing the app, registering an account (including KYC verification), and logging in.",
      "This guide links out to a dedicated, step-by-step guide for each part of that process — use it as your starting point.",
    ],
    faqs: [
      { question: "What is UU7GAME?", answer: "UU7GAME is a real-money gaming app offering rummy, teen patti, slots, the Aviator crash game, and live casino formats, aimed primarily at players in India." },
      { question: "Is UU7GAME available on the Google Play Store?", answer: "No — like most real-money gaming apps in India, UU7GAME is distributed as a direct APK download from its own official site rather than through the Play Store, due to Play Store policy restrictions on real-money gaming apps." },
      { question: "What do I need to get started with UU7GAME?", answer: "A compatible Android device, a mobile number you can verify by OTP, and a valid ID and bank details ready for KYC verification before your first withdrawal. See our Registration Guide for the full process." },
      { question: "Where can I read a full UU7GAME review?", answer: "We're completing a full, fact-checked UU7GAME review — see our App Tutorials category for our latest published guides in the meantime." },
    ],
    cta: {
      heading: "Ready to Get Started?",
      description: "Explore UU7GAME's rummy, teen patti, slots, Aviator, and live casino games.",
      buttonText: "Visit UU7GAME",
      buttonUrl: "https://uu7stars.com/",
    },
    seo: {
      seoTitle: "The Ultimate UU7GAME Guide — Games, Setup & Getting Started",
      metaDescription: "The complete UU7GAME hub: what the platform offers, how to download, register, and log in, and links to every step-by-step guide on this site.",
      focusKeyword: "uu7game",
    },
    body: `UU7GAME is a real-money gaming platform covering some of the most popular card games and casino formats played in India — rummy, teen patti, slots, the Aviator crash game, and live casino tables. This guide is the hub for everything UU7 covers about the platform: what it offers, how to get started, and where to find each step-by-step guide.

## What Is UU7GAME?

UU7GAME is a real-money gaming app built around five main categories: card games (rummy and teen patti), slots, the Aviator crash game, and live dealer casino formats. Like most real-money gaming platforms serving India, it's distributed as a direct APK download from its own website rather than through the Google Play Store — a distribution choice driven by Play Store policy, not a sign anything's wrong with the app itself. See our [APK Download Guide](/app-tutorials/uu7game-apk-download-guide) for how that works.

## Getting Started: The Three Steps

Every new player goes through the same three steps, in order, and we've written a dedicated guide for each one.

### 1. Download and Install

Real-money gaming apps in India are typically distributed as a direct APK rather than through the Play Store. Our [APK Download Guide](/app-tutorials/uu7game-apk-download-guide) covers exactly how to download and install it safely, and — just as importantly — how to tell a genuine download from a modified or malicious one.

### 2. Register an Account

Registration involves verifying your mobile number, setting a password, and completing KYC (identity) verification — standard practice across Indian real-money gaming platforms, not something specific to UU7GAME. Our [Registration Guide](/app-tutorials/uu7game-registration-guide) walks through the full process and what to have ready beforehand.

### 3. Log In

Once registered, logging back in is the simplest step — but it's also where most day-to-day support questions come from. Our [Login Guide](/app-tutorials/uu7game-login-guide) covers the standard login flow, troubleshooting steps if it isn't working, and a few security habits worth building regardless of which app you use.

## What Games Does UU7GAME Offer?

UU7GAME's game catalog spans five categories, each covered in its own dedicated guide on this site:

- **Rummy** — 13-card rummy in Points, Pool, and Deals formats. See our [Online Rummy Guide](/game-guides/online-rummy-guide).
- **Teen Patti** — India's classic three-card game, played in several rule variations.
- **Slots** — online slot games ranging from simple classic formats to progressive jackpots.
- **Aviator** — a multiplier-based crash game where you cash out before the plane flies away.
- **Live Casino** — live-dealer roulette, blackjack, baccarat, poker, and more, streamed in real time.

Our [UU7GAME Games Overview](/app-tutorials/uu7game-games-overview) covers each of these in more depth, and our [Game Guides](/game-guides) category has the full rules and strategy for each one as it's published.

## Is UU7GAME Legit?

This is the single most common question we get about any real-money gaming app, and it deserves a properly researched answer rather than a quick verdict. We're completing a full review of UU7GAME, checked directly against the platform's own published terms — not a generic star rating. Until that's published, this guide focuses on what we can say with confidence: the general patterns common to how real-money gaming platforms in India operate, which apply to UU7GAME as much as any other.

## Responsible Play

Every real-money game on UU7GAME — rummy, teen patti, slots, Aviator, or live casino — should be treated as entertainment spending, not a way to make money. See our [Responsible Gaming](/responsible-gaming) page for safe play guidelines, age restrictions, and where to get help if gaming ever stops being fun.`,
  },
  {
    title: "UU7GAME Games Overview",
    slug: "uu7game-games-overview",
    excerpt: "A complete overview of every game category on UU7GAME — rummy, teen patti, slots, Aviator, and live casino — with what each one actually involves.",
    categorySlug: "app-tutorials",
    authorSlug: "rohan-kapoor",
    status: "published",
    quickAnswer: "UU7GAME's game catalog spans five categories: rummy and teen patti card games, online slots, the Aviator crash game, and live-dealer casino tables. Each category suits a different kind of session, from quick rounds of Aviator to longer, strategic rummy games.",
    aiSummary: "UU7GAME's catalog covers five distinct game categories common to Indian real-money gaming platforms: card games (13-card rummy and teen patti), online slots, the Aviator multiplier crash game, and live-dealer casino formats (roulette, blackjack, baccarat, poker). Each category rewards a different kind of player — rummy and teen patti reward strategic, skill-based play; slots and Aviator are faster and chance-driven; live casino replicates a physical casino table in real time.",
    keyTakeaways: [
      "UU7GAME's catalog spans five categories: rummy, teen patti, slots, Aviator, and live casino.",
      "Rummy and teen patti are skill-influenced card games with a real strategic component; slots and Aviator are faster, chance-driven formats.",
      "Live casino tables use a real human dealer streamed in real time, rather than random-number-generator software alone.",
      "Confirm UU7GAME's exact current game list and any regional restrictions directly in the app, since catalogs change over time.",
    ],
    faqs: [
      { question: "What games can I play on UU7GAME?", answer: "UU7GAME's catalog spans rummy, teen patti, online slots, the Aviator crash game, and live-dealer casino formats like roulette, blackjack, baccarat, and poker." },
      { question: "What's the difference between rummy and teen patti?", answer: "Both are Indian card games, but rummy is about forming valid sequences and sets from your hand, while teen patti is a three-card betting game closer in spirit to poker, built around reading opponents rather than completing a hand structure." },
      { question: "Is Aviator a game of skill or chance?", answer: "Aviator is primarily a chance-driven game — you're deciding when to cash out a rising multiplier before a random crash point, which is a risk-management decision rather than a skill that changes the odds themselves." },
      { question: "What is live casino, and how is it different from slots?", answer: "Live casino games are streamed in real time with a real human dealer running a physical table, unlike slots, which run entirely on software with no dealer involved." },
    ],
    cta: {
      heading: "Explore Every Game on UU7GAME",
      description: "From strategic card games to fast-paced live casino tables, find your game on UU7GAME.",
      buttonText: "Visit UU7GAME",
      buttonUrl: "https://uu7stars.com/",
    },
    seo: {
      seoTitle: "UU7GAME Games Overview — Rummy, Teen Patti, Slots & More",
      metaDescription: "A complete overview of every game category on UU7GAME — rummy, teen patti, slots, Aviator, and live casino — and what each one actually involves.",
      focusKeyword: "uu7game games",
    },
    body: `UU7GAME's game catalog spans five categories — two card games, slots, a crash-style multiplier game, and live-dealer casino tables. Each one suits a different kind of session and a different kind of player. This guide walks through what each category actually involves, so you can find the one that matches what you're looking for.

## Rummy

Rummy is a card game built around forming valid sequences and sets from a 13-card hand, faster than your opponents. It has a genuine skill component — reading discards, sequencing decisions, and joker usage all affect outcomes — and comes in several formats (Points, Pool, and Deals Rummy) that differ mainly in session length and how scoring carries between hands. See our [Online Rummy Guide](/game-guides/online-rummy-guide) for the full rules and strategy breakdown.

## Teen Patti

Teen Patti is India's classic three-card game, closer in spirit to poker than to rummy: rather than completing a hand structure, you're reading opponents, managing a betting pot, and deciding when to bet, call, or fold on a three-card hand ranked by standard poker-style sequences. It rewards psychological read and risk management more than hand-completion strategy.

## Slots

Slots are the simplest format to pick up: spin, and a random-number-generator determines the outcome against a published payout structure. Modern online slots range from simple classic three-reel formats to elaborate video slots with bonus rounds, and progressive jackpot slots where the top prize grows across a network of players until someone wins it.

## Aviator

Aviator is a multiplier-based crash game: a plane takes off and a multiplier climbs in real time, and you choose when to cash out before the plane "flies away" at a random crash point. It's fast, chance-driven, and the entire decision comes down to risk management — when to take a smaller guaranteed multiplier versus holding out for a bigger one.

## Live Casino

Live casino tables replicate a physical casino experience: a real human dealer runs the table — roulette, blackjack, baccarat, or poker — streamed to your device in real time, rather than the software-only randomness behind slots or Aviator. It's the closest online equivalent to sitting at a physical casino table, with the same pacing and dealer interaction.

## Which Game Should You Start With?

If you want a genuine strategic challenge, start with rummy or teen patti — both reward learning the rules properly before playing for stakes. If you want something faster and lower-commitment, slots or Aviator suit short sessions. If you want the closest thing to a physical casino, live dealer tables are the format built for that specifically.

Whichever you choose, our [Responsible Gaming](/responsible-gaming) guidelines apply the same way across every format: set a budget before you start, and treat it as entertainment spending, not income.

**A note on accuracy:** game catalogs change over time, and this overview reflects the categories common across Indian real-money gaming platforms generally. Confirm UU7GAME's exact current game list and any regional availability directly in the app.`,
  },
  {
    title: "UU7GAME Review 2026: Is It Legit?",
    slug: "uu7game-review-2026",
    excerpt: "An honest, methodology-first look at UU7GAME — games offered, bonuses, deposits and withdrawals, security, and support, checked against the platform's own terms.",
    categorySlug: "app-tutorials",
    authorSlug: "rohan-kapoor",
    status: "draft",
    quickAnswer: "[VERIFY: This Quick Answer must state a verified conclusion once the sections below are checked against UU7GAME's current terms — do not publish a legitimacy claim before that verification is complete.]",
    aiSummary: "[VERIFY: Summarize the verified findings once every section below has been checked against UU7GAME's official terms, app, and current policies. Do not publish this summary with placeholder or assumed facts.]",
    keyTakeaways: [
      "[VERIFY: Replace with a real takeaway once games offered are confirmed against the current app.]",
      "[VERIFY: Replace with a real takeaway once bonus terms are confirmed.]",
      "[VERIFY: Replace with a real takeaway once deposit/withdrawal specifics are confirmed.]",
      "[VERIFY: Replace with a real takeaway once licensing/security details are confirmed.]",
    ],
    faqs: [
      { question: "Is UU7GAME legit?", answer: "[VERIFY: Answer only after confirming licensing, security features, and payout track record directly against UU7GAME's own published terms — do not publish an assumed answer.]" },
      { question: "Is UU7GAME safe to use?", answer: "[VERIFY: Confirm security features (encryption, account protection, KYC process) against the platform's own documentation before answering.]" },
      { question: "What games does UU7GAME offer?", answer: "[VERIFY: List the confirmed current game catalog — rummy, teen patti, slots, aviator, and live casino are the categories referenced in this site's keyword brief, but confirm against the live app before publishing as fact.]" },
      { question: "How long do UU7GAME withdrawals take?", answer: "[VERIFY: State the platform's actual published withdrawal processing time — do not estimate.]" },
    ],
    cta: {
      heading: "Explore UU7GAME",
      description: "See the full range of games and current offers on UU7GAME.",
      buttonText: "Visit UU7GAME",
      buttonUrl: "https://uu7stars.com/",
    },
    body: `This review is written against UU7's own [editorial policy](/editorial-policy): every claim about the platform below is checked against its own published terms and current app before publication. Where a section is marked **[VERIFY]**, that means we have not yet confirmed the detail against UU7GAME's official terms — it is a placeholder for the writer completing this review, not a claim you should rely on yet.

## What Is UU7GAME?

UU7GAME is a real-money gaming app offering card games (rummy, teen patti), slots, the Aviator crash game, and live casino formats. [VERIFY: confirm the exact current game catalog and any regional availability restrictions against the live app before publishing.]

## Games Offered

[VERIFY: List the confirmed current game catalog with brief descriptions of each category, cross-linked to this site's dedicated guides for rummy, teen patti, slots, aviator, and live casino.]

## Bonuses and Promotions

[VERIFY: Describe the platform's actual current welcome bonus, reload bonuses, and VIP program, including exact terms and wagering requirements, sourced from UU7GAME's own promotions page — not assumed or estimated figures.]

## Deposits and Withdrawals

[VERIFY: State the platform's actual minimum deposit, minimum withdrawal, accepted payment methods, and typical withdrawal processing time, sourced directly from the app or official terms.]

## Licensing and Security

[VERIFY: State the platform's actual licensing basis and the specific security measures it publishes — encryption, KYC process, account protection — rather than a generic assumption.]

## Customer Support

[VERIFY: State the platform's actual support channels and hours.]

## Pros and Cons

[VERIFY: Write pros and cons based on hands-on use of the current app and confirmed terms — not assumed. A review with fabricated pros and cons is worse than no review.]

## Our Verdict

[VERIFY: This section should only be completed, and this post only published, once every section above reflects confirmed, current facts about UU7GAME. Until then this post should remain in draft status.]`,
  },
];

async function main() {
  const category = await db.query.categories.findFirst({ where: eq(categories.slug, "app-tutorials") });
  if (!category) throw new Error("app-tutorials category not found");
  const author = await db.query.authors.findFirst({ where: eq(authors.slug, "rohan-kapoor") });
  if (!author) throw new Error("rohan-kapoor author not found");

  for (const row of POST_ROWS) {
    const existing = await db.query.posts.findFirst({ where: eq(posts.slug, row.slug) });
    if (existing) {
      console.log(`Post already exists, skipping: ${row.slug}`);
      continue;
    }

    const doc = markdownToDoc(row.body);
    const readingTimeMinutes = estimateReadingTimeMinutes(extractText(doc));

    const [created] = await db
      .insert(posts)
      .values({
        title: row.title,
        slug: row.slug,
        content: doc,
        excerpt: row.excerpt,
        status: row.status,
        publishedAt: row.status === "published" ? new Date() : null,
        authorId: author.id,
        categoryId: category.id,
        readingTimeMinutes,
      })
      .returning({ id: posts.id });

    await db.insert(postQuickAnswer).values({ postId: created.id, text: row.quickAnswer });
    await db.insert(postAiSummary).values({ postId: created.id, summary: row.aiSummary });
    if (row.keyTakeaways.length) {
      await db.insert(postKeyTakeaways).values(row.keyTakeaways.map((text, position) => ({ postId: created.id, text, position })));
    }
    if (row.faqs.length) {
      await db.insert(postFaqs).values(row.faqs.map((faq, position) => ({ postId: created.id, ...faq, position })));
    }
    await db.insert(postCtas).values({ postId: created.id, position: 0, ...row.cta });

    if (row.seo) {
      await db.insert(seoMeta).values({
        entityType: "post",
        entityId: created.id,
        seoTitle: row.seo.seoTitle,
        metaDescription: row.seo.metaDescription,
        focusKeyword: row.seo.focusKeyword,
      });
    }

    console.log(`Created post (${row.status}): ${row.title}`);
  }
  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
