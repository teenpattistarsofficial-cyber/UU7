import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  categories,
  authors,
  pages,
  posts,
  postQuickAnswer,
  postAiSummary,
  postKeyTakeaways,
  postFaqs,
  postCtas,
  postStatsTables,
} from "@/lib/db/schema";
import { slugify } from "@/lib/seo/slugify";
import { estimateReadingTimeMinutes } from "@/lib/seo/reading-time";
import { extractText } from "@/lib/editor/text";

// ---------------------------------------------------------------------------
// Minimal markdown -> Tiptap JSON converter, scoped to exactly what this
// seed's content needs (headings, paragraphs, bullet lists, bold, links).
// Not a general-purpose parser — matches the exact node shapes Tiptap's
// StarterKit produces (confirmed against a real published post's stored
// JSON) so the Heading Validator / ToC extraction see a normal document.
// ---------------------------------------------------------------------------

function parseInline(text: string): object[] {
  const nodes: object[] = [];
  // Matches **bold** or [label](url), left to right.
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
        marks: [
          {
            type: "link",
            attrs: { href: match[3], rel: "noopener noreferrer", class: null, title: null, target: null },
          },
        ],
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

/** Body markdown -> Tiptap doc. Blank line = paragraph break; "## "/"### "
 * = heading; "- " lines = one bullet list. Post title is the page's H1, so
 * only H2/H3 are used here (matches the editor's configured heading range). */
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
// Content data
// ---------------------------------------------------------------------------

const CATEGORY_ROWS = [
  { name: "Game Guides", slug: "game-guides", description: "Rules, strategy, and how-to-play guides for rummy, teen patti, slots, aviator, and live casino games." },
  { name: "Betting Guides", slug: "betting-guides", description: "Real-money wagering guides, app comparisons, and where-to-play recommendations." },
  { name: "Bonuses", slug: "bonuses", description: "Welcome bonuses, reload offers, VIP programs, and promotion breakdowns." },
  { name: "App Tutorials", slug: "app-tutorials", description: "Step-by-step UU7GAME how-tos: download, login, registration, deposits, and withdrawals." },
  { name: "Statistics & Reports", slug: "statistics-reports", description: "Data-driven comparisons — payout times, RTP tables, and bonus comparison reports." },
];

const AUTHOR_ROWS = [
  {
    displayName: "Arjun Mehta",
    slug: "arjun-mehta",
    roleTitle: "Game Strategy Writer",
    bio: "Arjun writes UU7's rummy, teen patti, slots, aviator, and live casino strategy content, with a focus on getting the rules exactly right and keeping advice practical rather than hypey.",
    expertiseTags: ["Card Games", "Slot Mechanics", "Live Casino", "Game Rules"],
  },
  {
    displayName: "Neha Kapoor",
    slug: "neha-kapoor",
    roleTitle: "Reviews & Trust Editor",
    bio: "Neha covers platform reviews, bonus terms, and payments and security topics for UU7, and checks every platform claim against its own published terms before it goes to print.",
    expertiseTags: ["Platform Reviews", "Payments & Security", "Bonus Terms", "Responsible Gaming"],
  },
];

const PAGE_ROWS = [
  {
    title: "About UU7",
    slug: "about",
    template: "about" as const,
    body: `UU7 is a gaming knowledge hub built for one purpose: helping people understand games and gaming platforms clearly enough to make their own informed decisions — before they play, not after.

## Our Mission

Most gaming content online falls into one of two camps: marketing dressed up as advice, or forum-grade guesswork with no editorial process behind it. UU7 is our attempt at a third option — genuinely useful, accurate, and honestly written content about card games, slots, live casino formats, and the apps people use to play them.

We're not neutral about the fact that gaming should be fun and never a source of financial harm. Everything we publish is written with that as a starting assumption, not an afterthought.

## Educational Purpose

Our content exists to teach, not just to rank. A guide to Teen Patti variations should leave you actually understanding the variations — not just having skimmed a page optimized for a search engine. Where a topic touches real money (bonuses, deposits, withdrawals, app reviews), we aim to explain how things actually work so you can evaluate a platform on its own terms, rather than take our word for it.

## Our Editorial Methodology

- **Rules and mechanics are checked against how a game actually plays**, not copied from other websites.
- **Claims about a specific platform** (bonus terms, deposit and withdrawal processes, security features) are checked against that platform's own published terms and official app before publication. Where we haven't been able to verify a detail, we say so rather than guess.
- **Content is dated and reviewed periodically.** Bonus terms, payout processes, and app details change — we update pages rather than leave stale information live.
- **We disclose commercial relationships.** Where a page includes a link to a gaming platform we have a relationship with, that's disclosed rather than hidden.
- **Responsible gaming isn't a footer link.** Any page discussing real-money play links to our [Responsible Gaming](/responsible-gaming) page, and none of our content treats gaming as a way to make money.

Read more about how we research and fact-check specific pieces on our [Editorial Policy](/editorial-policy) page.`,
  },
  {
    title: "Editorial Policy",
    slug: "editorial-policy",
    template: "legal" as const,
    body: `This page explains how UU7's content gets made — the research process, the review workflow, and how we validate what we publish. We think you should be able to check our work, so here's how it happens.

## Research Process

Every guide starts from the game or platform itself, not from other articles about it. For game-rules content (rummy, teen patti, slots mechanics, live casino formats), that means working from the actual rules of play and standard scoring and format conventions, not paraphrasing whatever ranks highest already. For platform-specific content (app guides, reviews, bonus breakdowns), that means checking the platform's own terms, app screens, and published policies directly.

## Review Workflow

- A draft is written against a specific target: a keyword, a search intent, and a clear answer to the question a reader actually has.
- Before publishing, we check the piece against our own heading-structure and content-completeness standards — this is enforced by our publishing tooling, not just a manual checklist.
- Any claim about a specific gaming platform is flagged and checked against that platform's current terms before the piece goes live. If we can't verify something, it doesn't get published as fact.
- Published pages carry a visible publish date and last-updated date, so you can tell how current the information is.

## Source Validation

- **Primary sources first.** A platform's own terms and conditions, official app, or published policies outrank any third-party description of them.
- **External sources are cited, not just linked.** Where we reference outside information, we link to the actual source.
- **We correct mistakes.** If something we published turns out to be wrong or has changed, we update the page rather than leave it stale — updated pages show a new last-modified date.

## Commercial Relationships

UU7 has a relationship with uu7stars.com, and some of our content links there. Where that's the case, it's a clearly marked call-to-action, not a disguised link inside the body text — and it never determines whether a review is positive. A platform's bonus terms or withdrawal process get described the same way whether or not we have a commercial relationship with it.

Questions about a specific piece of content? [Contact us](/contact).`,
  },
  {
    title: "Responsible Gaming",
    slug: "responsible-gaming",
    template: "legal" as const,
    body: `Gaming should stay fun. This page covers the basics of playing safely, who shouldn't play at all, and how to recognize when gaming has stopped being a form of entertainment.

## Safe Play Guidelines

- **Set a budget before you start** — an amount you're fully prepared to lose — and stop when you reach it, regardless of whether you're up or down.
- **Set a time limit too.** It's easy to lose track of time in a session; deciding in advance when you'll stop removes that decision from a moment when you might not want to make it.
- **Never chase losses.** Increasing your stakes to win back money you've lost is one of the clearest warning signs of harmful play, not a strategy.
- **Treat it as entertainment spending, not income.** No game of chance is a reliable way to make money, regardless of the skill involved in games like rummy or teen patti.
- **Don't play under the influence** of alcohol or when you're stressed, upset, or trying to escape a bad day — all of these impair judgment specifically around risk.

## Age Restrictions

Real-money gaming is restricted to adults who meet the minimum legal age for online gaming in their jurisdiction — in India, this is 18 and older, and some states restrict or prohibit real-money gaming entirely regardless of age. It's the player's responsibility to know and follow the law where they live. None of the content on this site is intended for or directed at minors.

## Recognizing Risk

Consider stepping back, or stopping entirely, if you notice any of the following:

- You're spending more money or time than you planned, regularly.
- You're borrowing money, or using money set aside for essentials, to play.
- You're hiding how much you play or spend from people close to you.
- You feel anxious, irritable, or preoccupied when you're not playing.
- You've tried to cut back or stop and found it difficult.

## Getting Help

If any of the above sounds familiar, talking to someone helps — a trusted friend or family member, a counselor, or a licensed problem-gambling support service in your region. This isn't something to work through alone, and reaching out isn't a sign of failure.

If you're following a link from our content to a real-money platform, that decision should be made deliberately and within limits you've set for yourself — not in the moment.`,
  },
];

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
  statsTable?: { title: string; columns: string[]; rows: string[][] };
  cta: { heading: string; description: string; buttonText: string; buttonUrl: string };
  body: string;
};

const POST_ROWS: PostSeed[] = [
  {
    title: "Online Rummy Guide: Rules, Formats, and Strategy",
    slug: "online-rummy-guide",
    excerpt: "How online rummy actually works — 13-card rules, Points vs. Pool vs. Deals formats, real strategy, and what to check before playing for real money.",
    categorySlug: "game-guides",
    authorSlug: "arjun-mehta",
    status: "published",
    quickAnswer: "Online rummy is a card game played on a website or app, most commonly 13-card (Indian) rummy: form valid sequences and sets — including one pure sequence — before your opponents do. It can be played free, for real-money cash stakes, or in tournaments.",
    aiSummary: "Online rummy moves the traditional 13-card game onto a website or app in three formats: free tables, real-money cash games, and tournaments. A valid hand needs at least two sequences, one of them pure (no joker), with the rest forming valid sequences or sets. The three most common real-money formats — Points, Pool, and Deals Rummy — differ mainly in session length and how scoring carries between hands.",
    keyTakeaways: [
      "A valid rummy hand needs at least one pure sequence — a hand with no pure sequence cannot be declared, no matter how good the rest of it looks.",
      "Points Rummy settles each hand immediately; Pool Rummy carries a running score across hands until a points limit eliminates you; Deals Rummy fixes the number of hands upfront.",
      "Tracking opponents' discards is as important as managing your own hand — it's the main source of information about what they're collecting.",
      "Rummy's legal status for real-money play varies by state in India — check local rules before playing for stakes.",
    ],
    faqs: [
      { question: "What are the basic rules of rummy?", answer: "In 13-card rummy, each player is dealt 13 cards and must arrange them into valid sequences and sets — at least two sequences, with one of them a pure sequence containing no joker — before anyone else does." },
      { question: "What's the difference between Points, Pool, and Deals Rummy?", answer: "Points Rummy is a single hand settled immediately at a fixed rupee-per-point rate. Pool Rummy strings multiple hands together, eliminating players once their score crosses a limit (usually 101 or 201). Deals Rummy fixes the number of hands upfront, with the highest chip count at the end winning." },
      { question: "Is rummy a game of skill or chance?", answer: "Rummy has a genuine skill component — reading discards, sequencing decisions, and joker usage all affect outcomes — which is why several Indian courts have classified it as a game of skill rather than pure chance, though real-money rules still vary by state." },
      { question: "How does real-money rummy work?", answer: "Real-money formats convert the same underlying game into cash stakes: Points Rummy assigns a fixed rupee value per point, while Pool and Deals formats typically use a fixed entry fee with a defined prize structure for tournaments." },
      { question: "What should I check before playing rummy for real money?", answer: "Look for clearly published rules and scoring for every format, transparent withdrawal terms stated upfront, a verifiable legal operating basis for your state, and real customer support — not just an automated FAQ." },
    ],
    statsTable: {
      title: "Rummy Variants at a Glance",
      columns: ["Variant", "Format", "Typical Length", "Best For"],
      rows: [
        ["Points Rummy", "Single hand, settled immediately", "A few minutes", "Fast, casual sessions"],
        ["Pool Rummy", "Multiple hands, eliminated at 101/201 points", "30–60+ minutes", "Longer, strategic sessions"],
        ["Deals Rummy", "Fixed number of deals", "Set, predictable length", "A defined session length"],
      ],
    },
    cta: {
      heading: "Ready to Play Rummy?",
      description: "Explore rummy cash games and tournaments on UU7GAME.",
      buttonText: "Visit UU7GAME",
      buttonUrl: "https://uu7stars.com/",
    },
    body: `Rummy is one of the most widely played card games in India, and "online rummy" now covers everything from free practice tables to real-money cash games and tournaments. This guide covers how the game works, the main formats you'll encounter, basic strategy, and what actually matters when you're comparing where to play.

## What Is Online Rummy?

Rummy is a card game built around forming valid sequences and sets from a hand of cards, faster than your opponents. Online rummy simply moves that same game onto a website or app, usually with three formats on offer: free practice tables, cash games (single hands played for real stakes), and tournaments (a structured series of hands with an entry fee and a prize pool).

The core skill — reading your hand, tracking discards, and deciding what to hold or drop — is identical whether you're playing with a physical deck or on a screen. What changes online is speed, format variety, and the ability to play cash games or tournaments instead of only casual rounds.

## Rummy Rules: The Basics

The most common online format is **13-card rummy** (also called Indian Rummy). Each player is dealt 13 cards, and the goal is to arrange them into valid sequences and sets before anyone else does.

- A **sequence** is three or more consecutive cards of the same suit.
- A **pure sequence** is a sequence with no joker used — at least one pure sequence is mandatory in a valid hand.
- A **set** is three or four cards of the same rank across different suits.
- To win, a hand must include at least two sequences, one of them pure, with the remaining cards forming valid sequences or sets.

Play proceeds in turns: draw a card from the closed deck or the open discard pile, then discard one. The round ends when a player completes a valid hand and declares.

## Points Rummy vs. Pool Rummy vs. Deals Rummy

These are the three formats you'll see most often, and they suit different playing styles.

**Points Rummy** is the fastest format — a single hand, scored immediately, with each point converted to cash at a fixed rate. It's the easiest way to play a few hands in a short break, since nothing carries over between hands.

**Pool Rummy** strings multiple hands together, with players eliminated once their cumulative score crosses a limit, usually 101 or 201 points. It rewards consistency over a session rather than any single hand, since one bad round doesn't end your game outright.

**Deals Rummy** fixes the number of hands upfront, and whoever holds the most chips when the deals run out wins. It's the most predictable format in terms of session length, since you know exactly how many hands you're committing to before you start.

Here's how the three formats compare at a glance.

## Rummy Strategy: Where to Actually Focus

Rummy has a real skill component — this isn't a pure-chance game — and most of that skill comes down to a handful of habits:

- **Prioritize your pure sequence first.** Without it, your hand can't be valid no matter how good everything else looks.
- **Track discards, not just your own hand.** What opponents discard, and what they pick from the open pile, tells you what they're collecting and what's safe for you to discard.
- **Hold high-value cards cautiously.** Face cards and aces cost more points if you're stuck holding them when someone else declares.
- **Use jokers deliberately.** A joker is most valuable completing a set or an impure sequence — don't spend it on a sequence you could complete naturally.
- **Know when to drop.** A first-drop on a genuinely bad hand costs far fewer points than playing it out and losing anyway.

## Playing Rummy for Real Money

Real-money rummy works by converting game formats into cash stakes: in Points Rummy, each point has a fixed rupee value; in Pool and Deals formats, there's typically a fixed entry fee and a prize structure for tournaments. None of this changes the underlying game — it changes what's at stake on each hand.

If you're going to play for real money, treat the format choice itself as a strategic decision. Points Rummy suits short, controlled sessions where you set a per-hand budget. Pool Rummy suits players comfortable with variance across a longer session. Whatever the format, our [Responsible Gaming](/responsible-gaming) guidelines apply just as much to rummy as to any other real-money game — decide your budget before you sit down, not while you're playing.

## What to Look for in a Rummy App

Not every app is worth your time or money. Before playing anywhere for real stakes, check for:

- **Clear, published rules and scoring** for every format offered — if the scoring system isn't documented, that's a red flag.
- **Transparent withdrawal information**: minimum withdrawal amount, processing time, and any conditions, stated upfront rather than buried in terms you only find after depositing.
- **Verifiable licensing or legal operating basis** for the states it serves — rummy's legal status varies by state in India.
- **Real customer support**, not just an automated FAQ bot for account or payment issues.

We cover specific platforms, including UU7GAME, in dedicated guides in our [App Tutorials](/app-tutorials) category.`,
  },
  {
    title: "UU7GAME Review 2026: Is It Legit?",
    slug: "uu7game-review-2026",
    excerpt: "An honest, methodology-first look at UU7GAME — games offered, bonuses, deposits and withdrawals, security, and support, checked against the platform's own terms.",
    categorySlug: "app-tutorials",
    authorSlug: "neha-kapoor",
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
  {
    title: "UU7GAME Login Guide",
    slug: "uu7game-login-guide",
    excerpt: "How to log in to UU7GAME, what to do if login isn't working, and login security tips — with platform-specific steps flagged for verification.",
    categorySlug: "app-tutorials",
    authorSlug: "neha-kapoor",
    status: "draft",
    quickAnswer: "To log in to UU7GAME, open the app or website, select Login, enter your registered mobile number or email, and verify with your password or an OTP. [VERIFY: confirm this matches the current app's actual login flow before publishing.]",
    aiSummary: "Logging in to UU7GAME follows the standard pattern used by most Indian real-money gaming apps: open the app, tap Login, enter your registered mobile number or email, then verify with a password or OTP. [VERIFY: confirm exact screen labels and steps against the current app before this is published, since interfaces change between app versions.]",
    keyTakeaways: [
      "[VERIFY: Confirm the exact login steps and screen labels against the current app before publishing.]",
      "Never share your password or OTP with anyone, including someone claiming to be customer support.",
      "Use the in-app password reset flow if you can't remember your password — don't reuse a password from another account.",
      "Log out of shared or public devices after every session.",
    ],
    faqs: [
      { question: "What do I need to log in to UU7GAME?", answer: "Your registered mobile number or email address, and your password (or access to an OTP sent to your registered number, depending on which login method the app supports)." },
      { question: "What if I forgot my UU7GAME password?", answer: "Use the app's “Forgot Password” option, which typically sends a reset link or OTP to your registered mobile number or email. [VERIFY: confirm this matches the app's actual reset flow.]" },
      { question: "Why isn't my UU7GAME OTP arriving?", answer: "Check that you entered the correct registered mobile number, that you have signal, and that SMS isn't being blocked or delayed by your carrier. If it still doesn't arrive after a few minutes, use the app's resend option rather than requesting repeatedly." },
      { question: "Is it safe to save my UU7GAME login on a shared device?", answer: "No — avoid saving login credentials on any device you don't exclusively control, and always log out manually when you're done on a shared or public device." },
    ],
    cta: {
      heading: "Get Started on UU7GAME",
      description: "Already registered? Log in and pick up where you left off.",
      buttonText: "Visit UU7GAME",
      buttonUrl: "https://uu7stars.com/",
    },
    body: `Logging in to a gaming app should be the fastest part of the experience. This guide covers the standard login process, what to do when it doesn't work, and a few security habits worth building regardless of which app you're using.

**[VERIFY]** The steps below describe the login flow common to most Indian real-money gaming apps. Confirm every step and screen label against the current UU7GAME app before this guide is published — interfaces change between app versions.

## Before You Log In

Make sure you have your registered mobile number or email address on hand, a stable internet connection, and the latest version of the app installed — outdated app versions are a common, overlooked cause of login failures.

## How to Log In to UU7GAME

1. Open the UU7GAME app or website.
2. Select **Login**.
3. Enter your registered mobile number or email address.
4. Enter your password, or request an OTP if that's the login method offered.
5. Submit to access your account.

**[VERIFY]** Confirm these exact steps, field labels, and available login methods (password vs. OTP vs. both) against the current app.

## Troubleshooting Common Login Issues

- **Forgot your password?** Use the in-app password reset option rather than guessing repeatedly, which can temporarily lock an account on some platforms.
- **OTP not arriving?** Double-check the registered number is correct, confirm you have signal, and wait for the resend window rather than requesting repeatedly.
- **App not loading or freezing at login?** Update to the latest app version, check your internet connection, and restart the app before assuming it's an account issue.

## Login Security Tips

- Never share your password or an OTP with anyone — legitimate customer support will never ask for either.
- Use a password you don't reuse on other accounts.
- Log out manually on any shared or public device.
- Enable your device's own lock screen as a second layer of protection for the app itself.`,
  },
  {
    title: "UU7GAME APK Download Guide",
    slug: "uu7game-apk-download-guide",
    excerpt: "How to safely download and install the UU7GAME APK, and how to tell a genuine download from a modified or malicious one.",
    categorySlug: "app-tutorials",
    authorSlug: "neha-kapoor",
    status: "draft",
    quickAnswer: "Download the UU7GAME APK only from the platform's official website [VERIFY: insert the confirmed official download URL], enable “Install from unknown sources” in your Android settings, then open the downloaded file to install.",
    aiSummary: "Real-money gaming apps are commonly distributed as a direct APK download rather than through the Google Play Store, due to Play Store policy restrictions on real-money gaming apps in many regions. Installing one safely means downloading only from the platform's own official source, enabling Android's unknown-sources install permission, and checking the file before installing — never from a third-party mirror or a link shared in a message or forum.",
    keyTakeaways: [
      "[VERIFY: Insert the confirmed official UU7GAME APK download URL — do not link to or imply an unverified source.]",
      "APKs for real-money gaming apps commonly exist because of Play Store policy restrictions, not because anything is wrong with the app itself.",
      "Only install from the platform's own official source — third-party APK mirror sites are a common distribution channel for malware.",
      "Check requested app permissions before installing; anything unrelated to a gaming app's function is a warning sign.",
    ],
    faqs: [
      { question: "Why isn't UU7GAME on the Google Play Store?", answer: "Google Play Store policy restricts or prohibits real-money gaming apps in many regions, which is why platforms like this commonly distribute their app as a direct APK download instead." },
      { question: "Is it safe to download the UU7GAME APK?", answer: "It's safe when downloaded directly from the platform's own official website. [VERIFY: confirm and link the official source before publishing.] Avoid third-party APK download sites and links shared in messages, forums, or social media — these are common vectors for modified, malicious APK files." },
      { question: "How do I install an APK on Android?", answer: "Download the file, enable “Install from unknown sources” (or “Install unknown apps”) for your browser or file manager in your device's security settings, open the downloaded file, and tap Install." },
      { question: "How do I know if my UU7GAME APK is genuine?", answer: "Confirm it was downloaded from the platform's official source, check that the requested permissions are reasonable for a gaming app, and avoid any version described as “modded,” “cracked,” or offering unlocked bonuses — those are not official releases." },
    ],
    cta: {
      heading: "Get the Official UU7GAME App",
      description: "Download UU7GAME directly and explore rummy, teen patti, slots, aviator, and live casino games.",
      buttonText: "Visit UU7GAME",
      buttonUrl: "https://uu7stars.com/",
    },
    body: `Most real-money gaming apps in India, UU7GAME included, are distributed as a direct APK download rather than through the Google Play Store. That's a normal, deliberate distribution choice — not a red flag by itself — but it does mean the download step needs a bit more care than a standard Play Store install.

## Why APK Instead of the Play Store

Google Play Store policy restricts or prohibits real-money gaming apps in many regions. Rather than that being a limitation of the app, it's simply why real-money gaming platforms commonly offer a direct APK download from their own website instead.

## How to Download and Install the UU7GAME APK

**[VERIFY]** Download the APK only from UU7GAME's official website — [insert the confirmed official download URL here] — never from a third-party app store, a mirror site, or a link shared in a message, forum, or social media post. Modified APK files distributed outside official channels are a common way malware gets onto a device.

1. Download the APK file from the confirmed official source above.
2. On your Android device, go to **Settings > Security** (or **Apps**, depending on your Android version) and enable **Install unknown apps** for the browser or file manager you used to download it.
3. Open the downloaded APK file.
4. Review the requested permissions, then tap **Install**.
5. Once installed, open the app and proceed to [registration](/app-tutorials/uu7game-registration-guide) or [login](/app-tutorials/uu7game-login-guide).

## How to Verify You Have a Safe, Genuine APK

- Confirm the file came from the platform's own official source — not a search-result ad, a forum post, or a "faster mirror" site.
- Check the requested permissions: a gaming app asking for access unrelated to its function (e.g. reading your SMS or contacts without a stated reason) is a warning sign.
- Avoid any version advertised as "modded," "unlocked," or offering bonuses beyond what the platform's own official promotions page lists — these are not genuine releases and are a common scam vector.
- Keep the app updated by re-downloading from the same official source, rather than from a link that shows up in an unrelated message or ad.`,
  },
  {
    title: "UU7GAME Registration Guide",
    slug: "uu7game-registration-guide",
    excerpt: "How to register a UU7GAME account, what eligibility and KYC verification involve, and what to prepare before you start.",
    categorySlug: "app-tutorials",
    authorSlug: "neha-kapoor",
    status: "draft",
    quickAnswer: "To register on UU7GAME, download the app, tap Register, verify your mobile number by OTP, set a password, and complete KYC verification before withdrawing. [VERIFY: confirm this matches the app's current registration flow.]",
    aiSummary: "Registering on a real-money gaming app in India typically involves mobile number verification via OTP, setting a password, and completing KYC (identity) verification — usually PAN and bank details — before withdrawals are allowed. [VERIFY: confirm UU7GAME's exact registration steps and KYC requirements against the current app before publishing.]",
    keyTakeaways: [
      "Registration requires meeting the minimum legal age for real-money gaming in your state (18+ in India), and it's the player's responsibility to confirm real-money gaming is legally permitted where they live.",
      "[VERIFY: Confirm UU7GAME's exact registration steps and required fields against the current app.]",
      "KYC (identity) verification is standard practice for real-money gaming apps in India, not specific to any one platform — it exists for anti-fraud and regulatory reasons.",
      "Have a valid ID and bank details ready before you start, since most platforms require these before your first withdrawal.",
    ],
    faqs: [
      { question: "What do I need to register on UU7GAME?", answer: "A mobile number you can verify by OTP, and typically a valid ID and bank account details for KYC verification before your first withdrawal. [VERIFY: confirm the exact required documents against the current app.]" },
      { question: "Is there an age requirement to register?", answer: "Yes — real-money gaming requires meeting the minimum legal age in your jurisdiction, 18 or older in India, and it's your responsibility to confirm real-money gaming is legally permitted in your specific state." },
      { question: "What is KYC and why do I need to complete it?", answer: "KYC (Know Your Customer) is identity verification — typically confirming your PAN and bank details — required by real-money gaming platforms in India for anti-fraud and regulatory reasons. It's standard practice across the industry, not specific to one app." },
      { question: "Can I use UU7GAME without completing KYC?", answer: "[VERIFY: confirm whether UU7GAME allows any play before KYC completion, and at what point KYC becomes mandatory — commonly required before a first withdrawal even if not before initial registration.]" },
    ],
    cta: {
      heading: "Create Your UU7GAME Account",
      description: "Register and explore rummy, teen patti, slots, aviator, and live casino games.",
      buttonText: "Visit UU7GAME",
      buttonUrl: "https://uu7stars.com/",
    },
    body: `Registering for a real-money gaming account involves a bit more than a typical app sign-up, mainly because of identity verification requirements that apply across the industry, not just to one platform. Here's what to expect and prepare for.

## Before You Register

Confirm you meet the minimum legal age for real-money gaming in your jurisdiction — 18 or older in India — and that real-money gaming is legally permitted in your specific state, since this varies. Have a valid government ID and your bank account details ready, since these are typically required for identity verification before you can withdraw.

## How to Register on UU7GAME

**[VERIFY]** The steps below reflect the standard registration pattern for Indian real-money gaming apps. Confirm the exact fields and flow against the current UU7GAME app before publishing.

1. Download and open the UU7GAME app.
2. Tap **Register** or **Sign Up**.
3. Enter your mobile number and verify it via OTP.
4. Set a password for your account.
5. Complete your profile details.
6. Complete KYC verification — typically PAN and bank account details — before your first withdrawal.

## KYC and Verification, Explained

KYC (Know Your Customer) verification is a standard requirement across real-money gaming platforms in India, not something specific to UU7GAME. It exists to prevent fraud and comply with financial regulations, and typically involves confirming your identity (PAN) and linking a bank account for withdrawals. Expect to complete this before you can withdraw any winnings, even if you're able to play before completing it.

Once you're registered, see our [Login Guide](/app-tutorials/uu7game-login-guide) for signing back in, and our [Deposit Guide] [VERIFY: link once published] for funding your account.`,
  },
];

// ---------------------------------------------------------------------------
// Insert logic — idempotent by slug, so this script is safe to re-run.
// ---------------------------------------------------------------------------

async function upsertCategories() {
  const slugToId = new Map<string, string>();
  for (const row of CATEGORY_ROWS) {
    const existing = await db.query.categories.findFirst({ where: eq(categories.slug, row.slug) });
    if (existing) {
      slugToId.set(row.slug, existing.id);
      continue;
    }
    const [created] = await db.insert(categories).values(row).returning({ id: categories.id });
    slugToId.set(row.slug, created.id);
    console.log(`Created category: ${row.name}`);
  }
  return slugToId;
}

async function upsertAuthors() {
  const slugToId = new Map<string, string>();
  for (const row of AUTHOR_ROWS) {
    const existing = await db.query.authors.findFirst({ where: eq(authors.slug, row.slug) });
    if (existing) {
      slugToId.set(row.slug, existing.id);
      continue;
    }
    const [created] = await db.insert(authors).values(row).returning({ id: authors.id });
    slugToId.set(row.slug, created.id);
    console.log(`Created author: ${row.displayName}`);
  }
  return slugToId;
}

async function upsertPages() {
  for (const row of PAGE_ROWS) {
    const existing = await db.query.pages.findFirst({ where: eq(pages.slug, row.slug) });
    if (existing) {
      console.log(`Page already exists, skipping: ${row.slug}`);
      continue;
    }
    await db.insert(pages).values({
      title: row.title,
      slug: row.slug,
      template: row.template,
      status: "published",
      content: markdownToDoc(row.body),
    });
    console.log(`Created page: ${row.title}`);
  }
}

async function upsertPosts(categoryIds: Map<string, string>, authorIds: Map<string, string>) {
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
        authorId: authorIds.get(row.authorSlug) ?? null,
        categoryId: categoryIds.get(row.categorySlug) ?? null,
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
    if (row.statsTable) {
      await db.insert(postStatsTables).values({ postId: created.id, position: 0, ...row.statsTable });
    }
    await db.insert(postCtas).values({ postId: created.id, position: 0, ...row.cta });

    console.log(`Created post (${row.status}): ${row.title}`);
  }
}

async function main() {
  const categoryIds = await upsertCategories();
  const authorIds = await upsertAuthors();
  await upsertPages();
  await upsertPosts(categoryIds, authorIds);
  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
