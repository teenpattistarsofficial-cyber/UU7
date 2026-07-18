import { db } from "@/lib/db";
import { posts, categories, authors, seoMeta, postQuickAnswer, postAiSummary, postKeyTakeaways, postFaqs, postCtas, postStatsTables } from "@/lib/db/schema";
import { extractText } from "@/lib/editor/text";
import type { JSONContent } from "@tiptap/core";
import { slugify } from "@/lib/seo/slugify";
import { eq } from "drizzle-orm";

const TITLE = "UU7GAME Withdrawal Time Data";
const SLUG = slugify(TITLE);
const CATEGORY_SLUG = "statistics-reports";
const AUTHOR_SLUG = "rohan-kapoor";
const IMAGE_URL = "https://images.pexels.com/photos/4386175/pexels-photo-4386175.jpeg?cs=srgb&dl=pexels-karola-g-4386175.jpg&fm=jpg";
const FOCUS_KEYWORD = "uu7game withdrawal time";
const SEO_TITLE = "UU7GAME Withdrawal Time Data: The Stated Numbers";
const META_DESCRIPTION = "UU7GAME's own stated deposit and withdrawal processing times, laid out as data — plus what actually determines those numbers and how they compare industry-wide.";
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
      "UU7GAME withdrawal time is one of the most-searched practical questions about the platform — this page lays out the platform's own stated numbers as data, rather than as a how-to walkthrough. Our ",
      link("Deposit and Withdrawal Guide", "/app-tutorials/uu7game-deposit-and-withdrawal-guide"),
      " covers the full process end to end; this page is the reference table and the numbers behind it.",
    ]),

    h2("The Stated Numbers"),
    p(
      "UU7GAME runs its deposits and withdrawals entirely on UPI, India's real-time bank-linked payment system. The table below summarizes every stated figure relevant to processing time.",
    ),

    h2("What Actually Determines These Numbers"),
    p(
      "A deposit only requires the platform to receive an incoming UPI payment and credit a balance once it confirms — a near-instant process on a real-time rail, which is why the stated deposit window (1–5 minutes) is so much shorter than the withdrawal window. A withdrawal requires three additional steps a deposit doesn't: the platform has to initiate an outgoing transfer, run an automated anti-fraud verification pass (confirming the requesting account matches deposit history on file), and then wait on the receiving bank's own posting speed, which varies — some banks credit instantly, others batch transactions every few minutes. That combination is what produces the wider, slower 5–30 minute stated withdrawal range.",
    ),
    p(
      "Two gating requirements sit in front of every withdrawal request, regardless of account balance: at least one successful deposit on record, and a completed turnover (wagering) requirement on that deposit and any bonus attached to it. Neither of these is a processing-time factor exactly — they determine when a withdrawal becomes eligible to request at all, which matters as much as the processing time once it's submitted.",
    ),

    h2("How This Compares Industry-Wide"),
    mixedPara([
      "Across the real-money gaming category in India generally, platforms built on ",
      link("UPI", "https://en.wikipedia.org/wiki/Unified_Payments_Interface", true),
      " commonly state deposit windows from near-instant to around 30 minutes, and withdrawal windows from a few minutes to several hours depending on the specific payment rail and the platform's own internal verification process. UU7GAME's stated 5–30 minute withdrawal window sits toward the faster end of that general range, though this guide hasn't independently audited real-world processing times across a large sample of actual transactions — the numbers here are the platform's own stated figures, not a measured average.",
    ]),
    mixedPara([
      "The more useful industry-wide comparison point isn't the raw minute figure alone, but whether a platform states a range at all (rather than a vague \"fast\" claim), ties that range to a specific payment method, and documents what happens when a specific transaction runs past it. Our ",
      link("Fastest Withdrawal Gaming Apps", "/betting-guides/fastest-withdrawal-gaming-apps"),
      " guide covers this evaluation framework in full, applicable to any platform, not just UU7GAME.",
    ]),
    p(
      "A platform relying on bank-transfer methods outside real-time rails like UPI can state withdrawal windows considerably longer than UU7GAME's — sometimes a full business day or more — simply because of how those payment rails process transactions, independent of anything the platform itself does. This is why the payment rail itself is worth checking before comparing two platforms' stated withdrawal times directly: a faster-sounding stated number on a slower rail can still work out slower in practice than a slightly longer stated number on a genuinely real-time rail.",
    ),

    h2("The Documented Escalation Path"),
    p(
      "UU7GAME states a specific fallback for deposits that run past the normal window: submitting the payment's UTR (UPI transaction reference number) through support. For withdrawals, the platform states a compensation policy for timeouts beyond the normal processing window. A platform stating what happens when its own numbers don't hold for a specific transaction is a more meaningful signal than the raw stated minute figure by itself — it's the difference between a marketing claim and a number the platform is willing to be held to.",
    ),
    p(
      "A UTR is generated by the sending bank at the moment a UPI payment is initiated, and functions as a unique reference that support can look up to confirm a specific payment actually left an account, independent of whether it's shown as received on the platform's side yet. Having this number ready before contacting support (rather than only a screenshot of the payment app) is the fastest way to get a delayed deposit resolved, since it gives support a specific, traceable reference rather than a general description of when a payment was sent. Most UPI payment apps show the UTR immediately in the transaction's own confirmation or history screen, so it's worth locating before a delay happens rather than searching for it under pressure once one has.",
    ),
    p(
      "For withdrawals, the practical value of a stated compensation policy is that it defines what \"delayed\" actually means in concrete terms — a specific time threshold past which the platform commits to some form of resolution, rather than leaving \"how long is too long\" undefined. Checking the exact wording of this policy (what threshold triggers it, and what the compensation actually is) is worth doing once, before a delay ever happens, rather than discovering the details for the first time during an actual delayed withdrawal.",
    ),

    h2("A Note on Where This Data Comes From"),
    p(
      "Every figure in this report is sourced directly from UU7GAME's own app interface and stated policies — the deposit screen's displayed minimum/maximum and processing-time text, the withdrawal screen's stated minimum and processing window, and the support-facing UTR and compensation-policy language. Nothing here is drawn from user-submitted reports, third-party review aggregation, or an independently run sample of real transactions timed by this site. That distinction matters for how much weight to put on any single figure: a platform's own stated number is a real, checkable claim, but it's a claim about typical/intended behavior, not a guarantee that applies identically to every single transaction under every condition.",
    ),
    p(
      "Where this report explicitly doesn't have independently verified data — such as a real-world average measured across many actual transactions — it says so directly rather than presenting an estimate as if it were confirmed. This is a deliberate editorial choice for a Statistics & Reports piece specifically: a data page's value depends on being clear about what's actually been verified versus what's simply the platform's own claim, and conflating the two would undermine the entire point of presenting this as data in the first place.",
    ),

    h2("The Turnover Requirement, With Numbers"),
    p(
      "The two gating requirements before any withdrawal — a prior deposit and a cleared turnover requirement — matter as much to actual wait time as the processing window itself, since they determine when a withdrawal can be requested at all. A worked example: deposit ₹1,000 with a bonus carrying a 3x turnover requirement, and ₹3,000 in total eligible wagers has to be placed before that ₹1,000 (or any winnings sitting alongside it) becomes withdrawable. Attempting to withdraw before that requirement clears will correctly get blocked, regardless of how long the stated 5–30 minute processing window is — the clock on processing time only starts once a withdrawal is actually eligible to submit.",
    ),
    p(
      "This is a distinct data point from processing time, and conflating the two is a common source of \"why is my withdrawal stuck\" confusion — a withdrawal that appears to be taking hours isn't necessarily a slow transaction; it may not have actually been submitted yet because the turnover gate hasn't cleared. Checking the account's own Total Balance versus Withdrawable balance figures (covered in our Deposit and Withdrawal Guide) is the fastest way to distinguish an actual slow transaction from a withdrawal that hasn't cleared its eligibility requirements yet.",
    ),

    h2("Why This Data Matters for Session Planning"),
    p(
      "The 1–5 minute deposit window is fast enough that it rarely affects how a session is planned — a top-up mid-session doesn't cost much waiting time. Withdrawals are the number actually worth planning around: since a withdrawal can take up to half an hour on the stated range, requesting one at the exact moment funds are needed elsewhere isn't a reliable plan. A more practical habit is requesting a withdrawal as soon as a session ends (or as soon as a specific amount is decided to be cashed out), rather than waiting until the money is actually needed — that way the processing window overlaps with whatever happens next rather than becoming a wait that's actually noticed. This is the same habit our Deposit and Withdrawal Guide recommends generally, and the underlying data on this page is exactly why it holds up as practical advice rather than an arbitrary suggestion.",
    ),
    p(
      "This matters more for time-sensitive plans specifically — if withdrawn funds are earmarked for a specific near-term use, building in the stated 30-minute upper bound as a planning buffer avoids a scenario where the money is needed before the platform's own stated window has even elapsed. Treating the upper end of a stated range as the realistic planning figure, rather than the lower end, is a small habit that avoids most timing-related frustration regardless of which specific platform is being used.",
    ),

    h2("Regional and Bank-Level Variation"),
    p(
      "Because UPI is a shared, real-time rail used across nearly every major Indian bank, the specific bank a UU7GAME account is linked to is one of the larger sources of variation within the stated 5–30 minute withdrawal range. Some banks post incoming UPI credits to a linked account within seconds of the sending institution releasing them; others process in batches at set intervals, adding a real but bounded delay on the receiving side that's outside any gaming platform's direct control, UU7GAME included. This is a general characteristic of the UPI ecosystem, not something specific to how any one platform's app is built.",
    ),
    p(
      "Network load on the UPI system itself — heaviest around peak hours, and around high-traffic periods generally — can also add a short delay industry-wide, again independent of which specific real-money gaming platform is being used. None of this changes the platform's own stated range, but it's a useful piece of context for why a specific transaction might land closer to the 30-minute end of that range on one occasion and the 5-minute end on another, using the exact same app and the exact same bank account both times. Neither variation reflects a change in the platform's own processing — both sit entirely on the banking-network side of the transaction.",
    ),

    h2("Reading This Data Correctly"),
    bulletList([
      bulletItem(["These are UU7GAME's own stated figures, not independently measured averages across a sample of real transactions — treat them as the platform's documented claim, checkable against your own experience, not an audited statistic."]),
      bulletItem(["The withdrawal window applies once both gating requirements (a prior deposit, cleared turnover) are already met — time spent before that point isn't part of the stated processing window."]),
      bulletItem(["Bank-side processing speed varies by receiving bank, which is outside the platform's direct control and can push an individual transaction toward either end of the stated range."]),
      bulletItem(["A stated range with a documented escalation path is a more reliable data point than a single average figure with no fallback described."]),
    ]),

    h2("Common Questions"),
    mixedPara([bold("How long do UU7GAME withdrawals take?"), " UU7GAME states a typical processing window of 5–30 minutes over UPI, depending on the receiving bank, once a prior deposit and the platform's turnover requirement are both met."]),
    mixedPara([bold("How long do UU7GAME deposits take?"), " UU7GAME states deposits typically credit within 1–5 minutes over UPI, with a documented UTR-submission path for delays past that window."]),
    mixedPara([bold("Why do withdrawals take longer than deposits?"), " A deposit only requires the platform to receive and credit an incoming payment; a withdrawal requires an outgoing transfer, an anti-fraud verification pass, and the receiving bank's own processing — three extra steps a deposit doesn't need."]),
    mixedPara([bold("Is UU7GAME's stated withdrawal time independently verified?"), " No — the figures on this page are the platform's own stated numbers, not an independently measured average across real transactions. Treat them as a documented claim, checkable against your own experience."]),
    mixedPara([bold("What happens if a UU7GAME withdrawal takes longer than stated?"), " UU7GAME states a compensation policy for withdrawal timeouts beyond the normal processing window — a documented fallback rather than an unexplained delay."]),

    mixedPara([
      "For the full deposit and withdrawal process, see our ",
      link("Deposit and Withdrawal Guide", "/app-tutorials/uu7game-deposit-and-withdrawal-guide"),
      ", and for the broader evaluation framework this data feeds into, our ",
      link("Fastest Withdrawal Gaming Apps", "/betting-guides/fastest-withdrawal-gaming-apps"),
      " guide covers what to check on any platform. Whatever platform you use, our ",
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
    heading: "Ready to Test It Yourself?",
    description: "See UU7GAME's deposit and withdrawal times firsthand.",
    buttonText: "Visit UU7GAME",
    buttonUrl: OFFICIAL_URL,
    position: 0,
  });

  await db.insert(postStatsTables).values({
    postId: post.id,
    title: "UU7GAME Deposit & Withdrawal Time Data",
    columns: ["Metric", "Stated Figure"],
    rows: [
      ["Deposit Processing Time", "1–5 minutes"],
      ["Withdrawal Processing Time", "5–30 minutes, depending on receiving bank"],
      ["Minimum Deposit", "₹100"],
      ["Maximum Deposit", "₹50,000 per transaction"],
      ["Minimum Withdrawal", "₹100"],
      ["Payment Method", "UPI only"],
      ["Withdrawal Requirements", "One prior successful deposit + completed turnover requirement"],
      ["Delayed Deposit Escalation", "UTR submission through support"],
      ["Delayed Withdrawal Policy", "Stated compensation policy for timeouts"],
    ],
    position: 0,
  });

  await db.insert(postQuickAnswer).values({
    postId: post.id,
    text: "UU7GAME states a 1–5 minute deposit window and a 5–30 minute withdrawal window, both over UPI. Withdrawals require a prior deposit and a completed turnover requirement first, and are slower than deposits because they involve an outgoing transfer, anti-fraud verification, and the receiving bank's own processing — three steps a deposit doesn't need.",
  });

  await db.insert(postAiSummary).values({
    postId: post.id,
    summary:
      "This page presents UU7GAME's own stated deposit and withdrawal processing-time data: deposits typically credit within 1–5 minutes over UPI (₹100 minimum, ₹50,000 maximum per transaction); withdrawals typically process in 5–30 minutes depending on the receiving bank (₹100 minimum), gated by one prior successful deposit and a completed turnover requirement. The asymmetry (withdrawals slower than deposits) is explained by three additional steps withdrawals require: an outgoing transfer, an automated anti-fraud verification pass, and reliance on the receiving bank's own posting speed. UU7GAME states a UTR-submission escalation path for delayed deposits and a compensation policy for withdrawal timeouts. These are the platform's own stated figures, not an independently audited average across real transactions — explicitly flagged as such. Industry-wide, UU7GAME's stated withdrawal window sits toward the faster end of typical UPI-based real-money gaming platforms in India, per general category ranges rather than a direct competitor-by-competitor comparison.",
  });

  await db.insert(postKeyTakeaways).values(
    [
      "UU7GAME states a 1–5 minute deposit window and a 5–30 minute withdrawal window, both over UPI.",
      "Withdrawals are slower than deposits because they require an outgoing transfer, anti-fraud verification, and the receiving bank's own processing — three steps deposits don't need.",
      "Withdrawals require at least one prior successful deposit and a completed turnover requirement before they're eligible to request at all.",
      "UU7GAME documents an escalation path for both directions: UTR submission for delayed deposits, a compensation policy for withdrawal timeouts.",
      "These figures are UU7GAME's own stated numbers, not an independently measured average — treat them as a documented, checkable claim.",
      "UU7GAME's stated withdrawal window sits toward the faster end of typical ranges for UPI-based real-money gaming platforms in India generally.",
    ].map((text, position) => ({ postId: post.id, text, position })),
  );

  await db.insert(postFaqs).values(
    [
      { question: "How long do UU7GAME withdrawals take?", answer: "UU7GAME states a typical processing window of 5–30 minutes over UPI, depending on the receiving bank, once a prior deposit and the platform's turnover requirement are both met." },
      { question: "How long do UU7GAME deposits take?", answer: "UU7GAME states deposits typically credit within 1–5 minutes over UPI, with a documented UTR-submission path for delays past that window." },
      { question: "Why do withdrawals take longer than deposits?", answer: "A deposit only requires the platform to receive and credit an incoming payment; a withdrawal requires an outgoing transfer, an anti-fraud verification pass, and the receiving bank's own processing — three extra steps a deposit doesn't need." },
      { question: "Is UU7GAME's stated withdrawal time independently verified?", answer: "No — the figures on this page are the platform's own stated numbers, not an independently measured average across real transactions. Treat them as a documented claim, checkable against your own experience." },
      { question: "What happens if a UU7GAME withdrawal takes longer than stated?", answer: "UU7GAME states a compensation policy for withdrawal timeouts beyond the normal processing window — a documented fallback rather than an unexplained delay." },
    ].map((f, position) => ({ postId: post.id, ...f, position })),
  );

  console.log("Created post:", post.id);
  process.exit(0);
}
main();
