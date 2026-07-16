import { db } from "@/lib/db";
import { posts, categories, authors, seoMeta, postQuickAnswer, postAiSummary, postKeyTakeaways, postFaqs, postCtas } from "@/lib/db/schema";
import { extractText } from "@/lib/editor/text";
import type { JSONContent } from "@tiptap/core";
import { slugify } from "@/lib/seo/slugify";
import { eq } from "drizzle-orm";

const TITLE = "Best Real Money Gaming Apps in India (2026)";
const SLUG = slugify(TITLE);
const CATEGORY_SLUG = "betting-guides";
const AUTHOR_SLUG = "rohan-kapoor";
const IMAGE_URL = "https://images.pexels.com/photos/4114787/pexels-photo-4114787.jpeg?cs=srgb&dl=pexels-castorlystock-4114787.jpg&fm=jpg";
const FOCUS_KEYWORD = "best real money gaming apps";
const SEO_TITLE = "Best Real Money Gaming Apps in India (2026)";
const META_DESCRIPTION = "What actually separates a good real-money gaming app from a risky one — game variety, payout speed, licensing signals, and bonus terms.";
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
      "\"Best real money gaming apps\" isn't a single objective ranking — what matters is whether a specific app holds up against a consistent set of criteria: game variety, how fast money actually moves, what its fairness and licensing signals look like, and whether its bonus terms are honest about what they require. This guide walks through that evaluation framework directly, then uses UU7GAME as a worked example against each criterion — not a generic \"5 stars, best app ever\" writeup, and not a head-to-head naming match against specific competitor apps we haven't independently audited. For UU7GAME's own detailed legitimacy review, see our ",
      link("UU7GAME Review 2026", "/app-tutorials/uu7game-review-2026-is-it-legit"),
      ", and for this same framework applied specifically to UU7GAME, our ",
      link("UU7GAME vs Other Gaming Apps", "/betting-guides/uu7game-vs-other-gaming-apps"),
      " goes deeper.",
    ]),

    h2("What Actually Makes a Real-Money Gaming App Worth Using"),
    p(
      "Five criteria matter more than a marketing tagline or a star rating: how many genuinely different game categories the app offers (not just re-skinned variants of the same format), how quickly deposits and withdrawals actually process, what fairness/licensing signals are visible (provably fair systems, RNG certification, KYC verification), how honest the bonus terms are about wagering requirements, and whether customer support is actually reachable when something goes wrong. Every section below evaluates one of these directly.",
    ),
    p(
      "None of these criteria require insider knowledge to check — every one of them is visible directly in an app's own interface (the deposit screen, the game rules modal, the bonus terms text) before you ever commit real money. That's deliberate: a platform that's genuinely upfront about its own numbers and terms tends to show them plainly, while one that isn't tends to bury or omit them entirely, which is itself a useful signal on its own.",
    ),

    h2("Game Variety: Breadth Across Formats, Not Just Volume"),
    mixedPara([
      "A long list of near-identical slot titles isn't the same as real variety. Worth checking specifically: does the app cover card games (rummy, teen patti) with more than one format each, RNG-driven slots across multiple providers, live-dealer table games with a real human dealer, and crash-format games like Aviator — four structurally different genres, not one genre re-skinned repeatedly. UU7GAME's own game categories span exactly this range; our ",
      link("Games Overview", "/app-tutorials/uu7game-games-overview"),
      " breaks down all eight categories, and our ",
      link("Casino Games Guide", "/app-tutorials/uu7game-casino-games-guide"),
      ", ",
      link("Slots Guide", "/app-tutorials/uu7game-slots-guide"),
      ", ",
      link("Rummy Guide", "/app-tutorials/uu7game-rummy-guide"),
      ", and ",
      link("Aviator Guide", "/app-tutorials/uu7game-aviator-guide"),
      " each cover one category in full depth.",
    ]),
    p(
      "It's also worth checking whether real, named third-party studios are actually integrated — a mix of well-known providers, rather than a single in-house engine dressed up under different titles, is a reasonable signal that the platform has real licensing relationships rather than running everything through one unverified system. UU7GAME's own app integrates named studios including Evolution, Ezugi, JILI, PG, Microgaming, JDB, and SABA Sports across its casino and slot categories specifically — covered in more depth in our Mobile App guide.",
    ),
    p(
      "A useful quick test: open the app's game lobby and count how many distinctly-branded provider logos actually appear across its casino and slot sections. A single unbranded engine repeated under different titles is a weaker signal than five or six named studios each contributing their own titles — the latter means the platform has real commercial relationships with established providers, not just a reskinned template pretending to offer more than it actually does.",
    ),

    h2("Payout Speed: Deposits and Withdrawals, Not Just Marketing Copy"),
    mixedPara([
      "How fast a platform actually moves money matters more than how fast its homepage claims it does. Two numbers worth checking specifically: typical deposit credit time, and typical withdrawal processing time, plus whether the app is upfront about what happens when a payment runs past the normal window rather than leaving you guessing. UU7GAME's own deposit screen states deposits typically credit within 1–5 minutes, with a documented path (submitting the payment's UTR) if a deposit runs past that; our ",
      link("Deposit and Withdrawal Guide", "/app-tutorials/uu7game-deposit-and-withdrawal-guide"),
      " covers processing times and payment methods in full.",
    ]),
    p(
      "A platform that explicitly states a compensation policy for withdrawal timeouts is giving you something concrete to hold it to, rather than a vague \"fast withdrawals\" claim with no fallback if something goes wrong — worth checking for on any platform's own deposit/withdrawal screen before assuming speed claims are reliable.",
    ),
    p(
      "Two other details worth checking on the deposit screen specifically: whether the platform states a minimum and maximum deposit clearly (rather than leaving you to discover limits only after a transaction fails), and whether it warns against reusing a saved QR code or payment account for a later transaction — a small detail, but one that suggests the platform has actually thought through common payment-failure scenarios rather than just building a generic payment form.",
    ),

    h2("Fairness and Licensing Signals to Actually Check"),
    mixedPara([
      "Three concrete things to look for rather than take on faith: a stated ",
      link("provably fair", "https://www.webopedia.com/crypto/learn/provably-fair/", true),
      " system for RNG-driven or crash-format games (a cryptographic method letting a result be independently verified rather than just trusted), a phone-verification step tied to account security rather than just marketing signup, and named game providers rather than an entirely unbranded, unverifiable game engine. UU7GAME's Aviator game states it runs on a provably fair system, with a corresponding badge on its live betting screen, and the app requires phone number verification (+91, SMS OTP) explicitly framed as a funds-security step — both covered in our Aviator Guide and Mobile App guide respectively.",
    ]),
    p(
      "None of this replaces independent regulatory licensing where it applies — it's a set of visible, checkable signals you can look for on any platform's own interface before depositing real money, not a substitute for doing your own research on a platform you haven't used before.",
    ),
    mixedPara([
      "Rummy specifically has its own legal-status backdrop worth understanding regardless of which platform you use: Indian courts have repeatedly classified rummy as a ",
      link("game of skill", "https://en.wikipedia.org/wiki/Rummy#Rummy_as_a_game_of_skill", true),
      " rather than a game of chance, the legal basis most Indian real-money rummy platforms operate under — though a small number of states maintain their own specific restrictions worth checking independently of any single app's own claims. Our ",
      link("Rummy Guide", "/app-tutorials/uu7game-rummy-guide"),
      " covers this in more depth.",
    ]),

    h2("Bonus Terms: Read the Wagering Requirement, Not Just the Headline Number"),
    p(
      "A \"100% deposit match\" headline means nothing on its own without the wagering requirement attached to it — how many times the bonus (or the deposit, depending on the platform) needs to be wagered before it converts to withdrawable balance. UU7GAME's own first-deposit bonus is a 100% match credited to a separate bonus wallet, carrying a stated 3x wagering requirement, and explicitly cancellable if you don't want it — real, specific terms rather than a vague promotional percentage with no attached conditions.",
    ),
    p(
      "Treat the wagering multiple as the actual number to compare across platforms, not the headline percentage — a smaller match with a lower wagering requirement can be genuinely easier to actually withdraw than a larger match buried under a much steeper requirement.",
    ),
    p(
      "It's also worth checking whether a bonus is credited to a separate wallet distinct from your main withdrawable balance, and whether the platform lets you decline or cancel a bonus you don't want. A bonus you can't decline, forced onto every deposit regardless of preference, is a meaningfully worse structure than one that's opt-in and clearly separated from your real cash balance — the latter gives you actual control over whether a wagering requirement applies to your funds at all.",
    ),
    p(
      "Beyond the first-deposit match, worth checking what ongoing loyalty structure exists: a VIP tier system tied to cumulative deposit or turnover progress, and a separate referral/agent structure with its own rebate percentages, are both common on well-developed platforms and worth comparing on their own stated numbers (rebate percentage, tier thresholds) rather than a vague \"great rewards\" claim with nothing concrete behind it.",
    ),

    h2("Customer Support: Reachable Before You Need It, Not Just After"),
    p(
      "The easiest way to evaluate support quality before you actually need it: check whether a live support option is visible directly from the account/profile area, rather than buried behind a generic contact-us form, and whether the platform gives a clear escalation path (like submitting a payment reference number) for a specific problem such as a delayed deposit or withdrawal, rather than a one-size-fits-all \"contact support\" link.",
    ),
    p(
      "A quick, practical test: before ever depositing, open the app's support section and see how many taps it takes to reach an actual live-support entry point from the home screen. A platform that surfaces this in one or two taps from the profile area is telling you support is a first-class feature, not an afterthought bolted on for compliance reasons — and it's worth doing this check during the account-setup stage, well before you'd ever need to actually use it under pressure.",
    ),

    h2("How UU7GAME Measures Up Against This Framework"),
    bulletList([
      bulletItem([bold("Game variety: "), "eight categories spanning card games, slots, live casino, fishing games, and sports betting, with named third-party providers integrated across casino and slot content."]),
      bulletItem([bold("Payout speed: "), "deposits stated to credit within 1–5 minutes, with a documented UTR-based path for delays and a stated withdrawal-timeout compensation policy."]),
      bulletItem([bold("Fairness signals: "), "a stated provably fair system on its Aviator game, plus phone-verification tied explicitly to account security."]),
      bulletItem([bold("Bonus terms: "), "a 100% first-deposit match with a stated 3x wagering requirement, explicitly cancellable."]),
      bulletItem([bold("Support: "), "a Live Support option reachable directly from the account/profile area."]),
    ]),
    p(
      "None of this is a substitute for doing your own first-hand check before depositing real money on any platform, UU7GAME included — treat this as a starting framework for what to look for, not a final verdict. Applying the same five checks to any other app you're considering gives you a consistent basis for comparison, rather than judging one platform against a headline claim and another against a different one.",
    ),

    h2("Red Flags Worth Checking on Any Real-Money Gaming App"),
    bulletList([
      bulletItem(["A downloadable app file (APK) from anywhere other than the platform's own official site — a common vector for modified, malicious copies of a legitimate app."]),
      bulletItem(["Bonus offers advertised beyond what the platform's own official promotions page lists — a common scam pattern that doesn't reflect the platform's real terms."]),
      bulletItem(["No visible fairness or licensing information anywhere in the app — not a guarantee of a problem by itself, but a reason to dig further before depositing."]),
      bulletItem(["Withdrawal or support complaints with no platform response mechanism at all, versus a platform that at least provides a documented escalation path."]),
      bulletItem(["Vague or missing minimum/maximum deposit and withdrawal figures — a platform confident in its own numbers states them plainly rather than leaving you to discover limits by trial and error."]),
    ]),
    p(
      "None of these red flags are unique to any single platform — they're general warning signs worth checking for on any real-money gaming app before depositing, UU7GAME included.",
    ),

    h2("Common Questions"),
    mixedPara([bold("What makes a real money gaming app trustworthy?"), " Visible fairness signals (like a stated provably fair system), account-security steps like phone verification, transparent payout times, and honest bonus terms that state the actual wagering requirement rather than just a headline percentage."]),
    mixedPara([bold("How fast should deposits and withdrawals be?"), " A well-run platform typically credits deposits within a few minutes and states a clear escalation path (like a payment reference number) if a transaction runs past its normal window — UU7GAME states 1–5 minutes for deposits, for example."]),
    mixedPara([bold("What does a wagering requirement mean on a bonus?"), " How many times the bonus (or deposit, depending on the platform) must be wagered before it converts into withdrawable balance — the number that actually determines how easily a bonus converts, not the headline match percentage."]),
    mixedPara([bold("Is it safe to download a real-money gaming app's APK directly?"), " Only from the platform's own official website — third-party mirrors and unofficial download sources are a common vector for modified, malicious app files."]),
    mixedPara([bold("Does game variety matter more than any single feature?"), " Genuine variety across structurally different formats is a stronger signal than any one standout feature, since it shows the platform has invested broadly rather than optimizing one area while neglecting the rest."]),

    mixedPara([
      "For UU7GAME specifically, our ",
      link("UU7GAME Review 2026", "/app-tutorials/uu7game-review-2026-is-it-legit"),
      " covers its legitimacy in full depth, our ",
      link("Mobile App", "/app-tutorials/uu7game-mobile-app"),
      " guide walks through the actual app interface, and our ",
      link("Deposit and Withdrawal Guide", "/app-tutorials/uu7game-deposit-and-withdrawal-guide"),
      " covers payment methods and processing times. Whatever platform you choose, our ",
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
    heading: "Ready to Apply This Framework?",
    description: "See how UU7GAME measures up against these five criteria firsthand.",
    buttonText: "Visit UU7GAME",
    buttonUrl: OFFICIAL_URL,
    position: 0,
  });

  await db.insert(postQuickAnswer).values({
    postId: post.id,
    text: "The best real-money gaming apps hold up against five criteria: genuine game variety across formats, fast and transparent payout times, visible fairness/licensing signals, honest bonus terms (the wagering requirement matters more than the headline percentage), and reachable customer support. UU7GAME is used here as a worked example against each, not a blanket \"best app\" claim.",
  });

  await db.insert(postAiSummary).values({
    postId: post.id,
    summary:
      "Evaluating a real-money gaming app in India comes down to five checkable criteria: game variety (genuinely different formats — card games, slots, live casino, crash games — not one genre re-skinned), payout speed (how quickly deposits and withdrawals actually process, and whether the platform states a clear escalation path for delays), fairness/licensing signals (a stated provably fair system, phone/KYC verification tied to security, named third-party game providers), bonus terms (the wagering requirement multiple matters more than the headline match percentage), and customer support reachability. UU7GAME is used as a worked example: eight game categories with named providers (Evolution, Ezugi, JILI, PG, Microgaming, JDB, SABA Sports), deposits stated to credit within 1–5 minutes with a UTR-based delay path and a withdrawal-timeout compensation policy, a provably fair system on its Aviator game, phone verification tied to funds security, a 100% first-deposit match with a stated 3x wagering requirement, and a Live Support option reachable from the account area.",
  });

  await db.insert(postKeyTakeaways).values(
    [
      "Evaluate any real-money gaming app on five criteria: game variety, payout speed, fairness/licensing signals, bonus terms, and support reachability.",
      "Genuine game variety means structurally different formats (cards, slots, live casino, crash games), not one genre repeated under different titles.",
      "A platform's stated deposit/withdrawal times and delay-escalation path matter more than a vague 'fast payouts' marketing claim.",
      "The wagering requirement multiple on a bonus determines how easily it converts to withdrawable balance — more important than the headline match percentage.",
      "Visible fairness signals (provably fair systems, phone/KYC verification, named game providers) are worth checking directly in the app before depositing.",
      "Only download a real-money gaming app's APK from its own official website — third-party mirrors are a common vector for malicious modified copies.",
    ].map((text, position) => ({ postId: post.id, text, position })),
  );

  await db.insert(postFaqs).values(
    [
      { question: "What makes a real money gaming app trustworthy?", answer: "Visible fairness signals (like a stated provably fair system), account-security steps like phone verification, transparent payout times, and honest bonus terms that state the actual wagering requirement rather than just a headline percentage." },
      { question: "How fast should deposits and withdrawals be?", answer: "A well-run platform typically credits deposits within a few minutes and states a clear escalation path (like a payment reference number) if a transaction runs past its normal window — UU7GAME states 1–5 minutes for deposits, for example." },
      { question: "What does a wagering requirement mean on a bonus?", answer: "How many times the bonus (or deposit, depending on the platform) must be wagered before it converts into withdrawable balance — the number that actually determines how easily a bonus converts, not the headline match percentage." },
      { question: "Is it safe to download a real-money gaming app's APK directly?", answer: "Only from the platform's own official website — third-party mirrors and unofficial download sources are a common vector for modified, malicious app files." },
    ].map((f, position) => ({ postId: post.id, ...f, position })),
  );

  console.log("Created post:", post.id);
  process.exit(0);
}
main();
