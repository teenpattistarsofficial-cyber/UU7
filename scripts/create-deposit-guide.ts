import { db } from "@/lib/db";
import { posts, categories, authors, seoMeta, postStatsTables, postQuickAnswer, postAiSummary, postKeyTakeaways, postFaqs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { extractText } from "@/lib/editor/text";
import type { JSONContent } from "@tiptap/core";
import { slugify } from "@/lib/seo/slugify";

const TITLE = "UU7GAME Deposit and Withdrawal Guide";
const SLUG = slugify(TITLE);
const CATEGORY_SLUG = "app-tutorials";
const AUTHOR_SLUG = "rohan-kapoor";
const IMAGE_URL = "https://images.pexels.com/photos/6406691/pexels-photo-6406691.jpeg?cs=srgb&dl=pexels-tranmautritam-6406691.jpg&fm=jpg";
const FOCUS_KEYWORD = "uu7game deposit";
const SEO_TITLE = "UU7GAME Deposit & Withdrawal Guide: Times, Limits, Methods";
const META_DESCRIPTION = "How to deposit and withdraw on UU7GAME — the UPI payment method, minimum limits, processing times, and what's required before your first withdrawal.";

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
function orderedItem(parts: (JSONContent | string)[]): JSONContent {
  return { type: "listItem", content: [mixedPara(parts)] };
}
function orderedList(items: JSONContent[]): JSONContent {
  return { type: "orderedList", attrs: { start: 1 }, content: items };
}

const content: JSONContent = {
  type: "doc",
  content: [
    p(
      "Every UU7GAME deposit process and withdrawal eventually comes down to the same few questions: how much can you move, how long does it take, and what has to happen before the money actually lands. Our Login and Registration guides both promised this page — here's the full breakdown, covering payment method, limits, processing times, and the requirements that trip people up most often. None of this is unique to UU7GAME specifically; it's the same baseline every UPI-based real-money gaming platform in India works from, so understanding it here is useful well beyond this one app.",
    ),
    h2("Deposit & Withdrawal Basics at a Glance"),
    p(
      "The numbers below cover everything most players actually need before their first transaction — the same core details our Registration and Login guides each touch on briefly, gathered here in one place rather than spread across three separate pages.",
    ),
    h2("How to Make a Deposit on UU7GAME"),
    p(
      "The flow is the same one used by essentially every UPI-based real-money platform, so if you've deposited on any similar app before, this will feel familiar:",
    ),
    orderedList([
      orderedItem(["Open the UU7GAME app and go to the wallet or deposit section."]),
      orderedItem(["Select ", bold("UPI"), " as the payment method — currently the only method the platform supports."]),
      orderedItem(["Enter the amount you want to deposit (₹100 minimum)."]),
      orderedItem(["Confirm the payment in your UPI app (Google Pay, PhonePe, Paytm, or your bank's own app)."]),
      orderedItem(["Funds are typically credited within 1–5 minutes of confirming."]),
    ]),
    p(
      "First-time deposits sometimes take a little longer than the usual 1–5 minute window while the platform completes an initial verification pass on a new payment method — this is a one-time step, not the ongoing norm, and subsequent deposits from the same UPI account are typically faster.",
    ),
    p(
      "If a deposit doesn't reflect after several minutes, check your UPI app's own transaction history first — most delays are on the bank/UPI network side, not the platform, and the amount is usually still deducted and pending rather than lost. It's worth taking a screenshot of the UPI transaction reference number (a unique ID every UPI payment generates) before contacting support about a delayed deposit — it's the single most useful piece of information for tracing exactly where a payment is stuck.",
    ),
    h2("Why UU7GAME Only Supports UPI"),
    p(
      "UPI has become the dominant payment method for real-money gaming platforms across India generally, not just on UU7GAME, for a few concrete reasons: it settles in real time rather than the 1–3 business days a card or net banking transaction can take, it carries lower processing costs than card networks, and it works directly against a bank account rather than requiring a separate stored-value wallet. Supporting a single, fast, low-cost rail instead of several slower ones is a common tradeoff industry-wide — the cost is less payment-method choice, the benefit is the 1–5 minute deposit speed covered above.",
    ),
    h2("Understanding UPI Payments"),
    mixedPara([
      link("UPI (Unified Payments Interface)", "https://en.wikipedia.org/wiki/Unified_Payments_Interface", true),
      " is India's real-time payment system, linking a bank account directly to a payment app without needing card details entered each time. It's why deposits process in minutes rather than the hours or days a traditional bank transfer can take. UU7GAME currently supports UPI as its only payment method — there's no card, net banking, or e-wallet option — so having a working UPI app linked to a funded bank account is a prerequisite before you can deposit at all.",
    ]),
    h2("UPI Compared to Other Payment Methods"),
    p(
      "For context on why a UPI-only setup is a deliberate choice rather than a limitation: card payments typically settle in 1–3 business days and carry higher processing fees passed on somewhere in the system; net banking transfers are often same-day but rarely instant; e-wallets add an extra step of moving money into the wallet itself before it can be spent. UPI skips all of that — money moves directly bank-to-bank in real time, with no intermediate balance to fund first. The tradeoff is payment-method choice: if you don't already use UPI regularly, there's a small one-time setup cost (linking a bank account to a UPI app) before your first deposit, but no ongoing downside afterward.",
    ),
    p(
      "For players used to platforms that support multiple payment rails, a single-method setup can initially read as a limitation rather than a design choice. In practice, the speed and cost tradeoff is why UPI-only has become common across the Indian real-money gaming space specifically, rather than something UU7GAME does differently from its peers — a useful thing to know before assuming it's a gap unique to this one app.",
    ),
    h2("How to Withdraw From UU7GAME"),
    p(
      "Withdrawals follow the same UPI rail in reverse, but with two requirements that have to be met first, regardless of how much is in your balance. This two-step gate — a real deposit on record, plus a cleared turnover requirement — is standard across the industry specifically because bonus credit with no such gate is one of the most common ways real-money platforms get exploited: without it, someone could register, claim a welcome bonus, and cash it out immediately with zero actual play.",
    ),
    bulletList([
      bulletItem([bold("At least one successful deposit"), " must be on record. A brand-new account with only bonus credit and no real deposit can't withdraw yet."]),
      bulletItem([bold("The platform's turnover (wagering) requirement"), " must be completed — see the next section for what that actually means in practice."]),
    ]),
    p(
      "Once both are satisfied, request the withdrawal from the wallet section the same way you'd initiate a deposit, and it processes to the same UPI-linked account you deposited from — the minimum withdrawal is also ₹100, and processing typically takes 5–30 minutes depending on your bank or payment provider.",
    ),
    h2("Understanding Turnover (Wagering) Requirements"),
    p(
      "A turnover requirement means a deposit (and any bonus attached to it) has to be wagered a set number of times before it — or winnings from it — counts as withdrawable balance. This exists across the real-money gaming industry, not just on UU7GAME, specifically to stop bonus credit from being deposited and cashed out immediately with no actual play in between.",
    ),
    p(
      "In practice: if a deposit carries, say, a 3x turnover requirement, ₹1,000 deposited needs ₹3,000 in total wagers placed (across eligible games) before that ₹1,000 — or any winnings sitting alongside it — can be withdrawn. The exact multiplier and which games count toward it varies by specific bonus and isn't something we've independently verified as a fixed platform-wide number, so check the terms attached to whichever deposit or bonus you're using rather than assuming a single rate applies everywhere.",
    ),
    p(
      "A practical way to track this yourself: note your deposit amount and the stated multiplier (if shown) as soon as you deposit, then keep a rough running total of what you've wagered across sessions until you're confident you've cleared it, rather than trying to reconstruct it from memory the first time a withdrawal gets blocked. Not every game category necessarily contributes toward turnover at the same rate — some real-money platforms weight slots and live casino differently from card games like rummy or Teen Patti — so a specific bonus's terms are worth reading in full rather than assuming turnover clears at an even pace regardless of what you play.",
    ),
    h2("Withdrawal Processing Times Explained"),
    p(
      "The 5–30 minute window isn't arbitrary — it reflects a few things outside the platform's direct control. Your bank's own processing speed for incoming UPI credits varies; some banks post instantly, others batch transactions every few minutes. Network load on the UPI system itself (heaviest around peak hours) can add a short delay. And every withdrawal typically passes an automated verification check first, confirming the requesting account matches the deposit history on file, which adds a few seconds but is a genuine anti-fraud measure rather than deliberate friction.",
    ),
    p(
      "That verification step is also why a withdrawal has to go to the same UPI account a deposit came from, rather than any account you choose at withdrawal time — it's what lets the platform confirm the funds are actually going back to their original source rather than a third party, which is a meaningful anti-fraud safeguard even though it does mean you can't redirect withdrawals to a different account on a whim.",
    ),
    h2("Common Deposit & Withdrawal Issues"),
    bulletList([
      bulletItem([bold("Deposit not showing up?"), " Check your UPI app's transaction history before assuming it failed — most delays clear within a few minutes, and the amount is rarely actually lost."]),
      bulletItem([bold("Withdrawal button greyed out or blocked?"), " Confirm you've met both requirements above — a completed deposit on record and the turnover requirement cleared — before assuming it's a bug."]),
      bulletItem([bold("Withdrawal taking longer than 30 minutes?"), " This is uncommon but not impossible during bank-side delays; wait a bit longer before contacting support, since most \"stuck\" withdrawals resolve on their own within the hour."]),
      bulletItem([bold("UPI payment failing at the bank's end?"), " Confirm your UPI app itself is working correctly with a small test transaction elsewhere before assuming the issue is UU7GAME-specific — UPI outages happen at the bank or NPCI level more often than on any single platform."]),
      bulletItem([bold("Deposited but the amount looks wrong?"), " Double-check whether a bonus was applied separately from the raw deposit — a bonus credit showing alongside your deposit isn't a billing error, but it does carry its own turnover requirement on top of the base deposit's."]),
      bulletItem([bold("Withdrawal request disappeared or shows no status?"), " Refresh the app rather than resubmitting the request — a duplicate withdrawal request for the same funds is a common self-inflicted delay, not a platform bug."]),
    ]),
    h2("Security Tips for Deposits and Withdrawals"),
    mixedPara([
      "Never share your UPI PIN with anyone, including someone claiming to be UU7GAME support — legitimate support will never ask for it, the same rule that applies to passwords and OTPs in our ",
      link("Login Guide", "/app-tutorials/uu7game-login-guide"),
      ". Double-check the UPI ID or QR code shown in-app before confirming any payment, and only ever deposit or withdraw through the official app itself, never through a link sent by message or email.",
    ]),
    p(
      "Keep a personal record of your own deposits and withdrawals — dates, amounts, and UPI reference numbers — separate from whatever the app itself shows. It costs nothing to maintain and is the fastest way to resolve any dispute about whether a specific transaction actually went through, rather than relying on memory or a support agent's own records alone. A simple notes-app entry after each transaction is enough; it doesn't need to be anything more formal than that.",
    ),
    p(
      "Set your device's UPI app to require biometric or PIN confirmation for every transaction, not just app login — this is a device-level setting, not something UU7GAME controls, but it's the single most effective protection against someone else initiating a payment from your phone if it's ever lost or unlocked. It's a five-minute setup that most people skip simply because it isn't turned on by default, not because it's difficult.",
    ),
    h2("Planning Sessions Around Processing Times"),
    p(
      "The 1–5 minute deposit window is fast enough that it rarely affects session planning — you can top up mid-session without much of a wait. Withdrawals are the one to plan around: since they can take up to half an hour, requesting a withdrawal isn't something to do at the exact moment you want the money for something else. A simple habit worth building is requesting withdrawals as soon as you've decided to stop for the session, rather than waiting until you actually need the funds elsewhere — that way the processing time overlaps with whatever you're doing next instead of becoming a wait you notice.",
    ),
    mixedPara([
      "This ties directly into budgeting generally: deciding your deposit amount and a stopping point before you start, rather than mid-session, is the same core habit our ",
      link("Responsible Gaming", "/responsible-gaming"),
      " guidelines recommend — knowing the deposit and withdrawal mechanics covered above just makes that plan easier to actually follow, since there's no guesswork about when money will be available.",
    ]),
    mixedPara([
      "Once you're set up, see ",
      link("The Ultimate UU7GAME Guide", "/app-tutorials/the-ultimate-uu7game-guide"),
      " for the full picture of getting started, our ",
      link("UU7GAME Review 2026", "/app-tutorials/uu7game-review-2026-is-it-legit"),
      " for our complete assessment of the platform, and our ",
      link("Registration Guide", "/app-tutorials/uu7game-registration-guide"),
      " if you haven't created an account yet. Whatever you deposit, our ",
      link("Responsible Gaming", "/responsible-gaming"),
      " guidelines are worth reading first: set a budget before you start, and treat it as entertainment spending, not income.",
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

  // Safe to re-run on any database (local dev or production, which have
  // independently generated ids) — checks by slug rather than assuming
  // this only ever runs once, so a second invocation is a no-op instead
  // of creating a duplicate post.
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

  await db.insert(postStatsTables).values({
    postId: post.id,
    title: "Deposit & Withdrawal Basics",
    columns: ["", "Details"],
    rows: [
      ["Minimum Deposit", "₹100"],
      ["Minimum Withdrawal", "₹100"],
      ["Supported Payment Method", "UPI"],
      ["Deposit Processing Time", "Within 1–5 minutes"],
      ["Withdrawal Processing Time", "Typically 5–30 minutes, depending on the bank or payment provider"],
      ["Withdrawal Requirements", "One prior successful deposit + completed turnover requirement"],
    ],
    position: 0,
  });

  await db.insert(postQuickAnswer).values({
    postId: post.id,
    text: "UU7GAME supports UPI as its only deposit and withdrawal method, with a ₹100 minimum for both. Deposits process within 1–5 minutes; withdrawals take 5–30 minutes depending on your bank, and require a prior deposit plus a completed turnover requirement first.",
  });

  await db.insert(postAiSummary).values({
    postId: post.id,
    summary:
      "UU7GAME's deposit and withdrawal system runs entirely on UPI, India's real-time bank-linked payment system, with a ₹100 minimum for both deposits and withdrawals. Deposits process within 1–5 minutes; withdrawals take 5–30 minutes depending on the receiving bank, and require at least one prior successful deposit plus completion of the platform's turnover (wagering) requirement — a standard multiplier-based rule requiring a deposit and any attached bonus to be wagered a set number of times before becoming withdrawable, present across the real-money gaming industry to prevent bonus abuse rather than something specific to this platform. Common issues (delayed deposits, blocked withdrawals, slow bank processing) are almost always resolved by checking UPI transaction history or confirming both withdrawal requirements are actually met, rather than indicating a platform fault.",
  });

  await db.insert(postKeyTakeaways).values(
    [
      "UPI is the only supported payment method, with a ₹100 minimum for both deposits and withdrawals.",
      "Deposits typically credit within 1–5 minutes; withdrawals take 5–30 minutes depending on the bank.",
      "Withdrawals require at least one prior successful deposit and a completed turnover (wagering) requirement.",
      "Turnover requirements mean a deposit/bonus must be wagered a set multiple of times before it's withdrawable — standard industry practice, not UU7GAME-specific.",
      "Most deposit/withdrawal issues resolve by checking UPI transaction history or confirming both withdrawal requirements are met.",
      "Never share a UPI PIN with anyone, including someone claiming to be support.",
    ].map((text, position) => ({ postId: post.id, text, position })),
  );

  await db.insert(postFaqs).values(
    [
      { question: "What is the minimum deposit on UU7GAME?", answer: "₹100, made via UPI." },
      { question: "How long do UU7GAME withdrawals take?", answer: "Typically 5 to 30 minutes, depending on your bank or payment provider." },
      { question: "Why can't I withdraw yet?", answer: "You need at least one successful deposit on record and to have completed the platform's turnover (wagering) requirement — both are required regardless of your current balance." },
      { question: "What payment methods does UU7GAME support?", answer: "UPI only, currently — no cards, net banking, or e-wallets." },
      { question: "What is a turnover requirement?", answer: "A rule requiring a deposit (and any bonus attached to it) to be wagered a set number of times before it becomes withdrawable — standard across real-money gaming platforms to prevent bonus abuse." },
    ].map((f, position) => ({ postId: post.id, ...f, position })),
  );

  console.log("Created post:", post.id);
  process.exit(0);
}
main();
