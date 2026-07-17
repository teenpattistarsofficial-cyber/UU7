import { db } from "@/lib/db";
import { posts, categories, authors, seoMeta, postQuickAnswer, postAiSummary, postKeyTakeaways, postFaqs, postCtas } from "@/lib/db/schema";
import { extractText } from "@/lib/editor/text";
import type { JSONContent } from "@tiptap/core";
import { slugify } from "@/lib/seo/slugify";
import { eq } from "drizzle-orm";

const TITLE = "UU7GAME Welcome Bonus Guide";
const SLUG = slugify(TITLE);
const CATEGORY_SLUG = "bonuses";
const AUTHOR_SLUG = "rohan-kapoor";
const IMAGE_URL = "https://images.pexels.com/photos/7231804/pexels-photo-7231804.jpeg?cs=srgb&dl=pexels-mart-production-7231804.jpg&fm=jpg";
const FOCUS_KEYWORD = "uu7game welcome bonus";
const SEO_TITLE = "UU7GAME Welcome Bonus Guide: How to Claim It Step by Step";
const META_DESCRIPTION = "How to claim and actually use the UU7GAME welcome bonus — registration to first deposit to clearing the wagering requirement, step by step.";
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
      "\"Welcome bonus\" is the industry-standard term for what UU7GAME's own interface calls its First Deposit Bonus — a 100% match credited the moment you make your first deposit. Our ",
      link("UU7GAME Bonus Guide", "/bonuses/uu7game-bonus-guide"),
      " covers this alongside the platform's other three bonus mechanics (VIP, club/referral, rotating promotions); this guide is the dedicated step-by-step walkthrough of claiming and actually using this one specifically, from registration through clearing the wagering requirement.",
    ]),

    h2("It Triggers on First Deposit, Not Registration"),
    p(
      "A common assumption is that a \"welcome\" bonus credits the moment an account is created. On UU7GAME, it doesn't — the bonus is specifically a First Deposit Bonus, meaning it triggers only once real money is deposited for the first time. Registering an account, verifying your phone number, and browsing the app all happen with no bonus credited yet; the 100% match appears only at the point of that first successful deposit.",
    ),
    p(
      "This distinction matters practically: an account that's registered but never deposited has no bonus sitting anywhere waiting to be claimed later, and there's no separate \"activate welcome bonus\" step beyond simply making that first deposit. If a specific promotional banner or referral link mentions a different welcome offer, treat it the same way any unusually generous claim gets treated — worth verifying against the deposit screen's own displayed terms before assuming it applies.",
    ),

    h2("Step by Step: Claiming It"),
    bulletList([
      bulletItem([bold("1. Register an account. "), "Standard signup, no bonus involved at this stage."]),
      bulletItem([
        bold("2. Complete phone verification. "),
        "UU7GAME requires SMS OTP verification (+91) framed explicitly as a funds-security step, not just onboarding — this has to be done before a deposit can be made at all.",
      ]),
      bulletItem([bold("3. Open the deposit screen and pick an amount. "), "Every quick-select deposit amount displays its own matching bonus tag (for example, a ₹1,000 deposit shows \"+1000\") — the match is visible before you confirm, not a surprise afterward."]),
      bulletItem([bold("4. Complete the deposit via UPI. "), "Deposits typically credit within 1-5 minutes. The matching bonus amount credits to a separate \"Gullak\" wallet at the same time, not to your main balance."]),
      bulletItem([bold("5. Check the Gullak screen to confirm. "), "The bonus wallet balance and its wagering progress are both visible from the account/profile area, separate from your Total Balance and Withdrawable figures."]),
    ]),

    h2("The Numbers: 100% Match, Up to ₹50,000, 3x Wagering"),
    mixedPara([
      "The match is 100% of the deposit amount, advertised up to ₹50,000, with deposits themselves running a ₹100 minimum to ₹50,000 maximum per transaction. The bonus carries a stated 3x wagering requirement before it converts to withdrawable balance. Our ",
      link("Deposit and Withdrawal Guide", "/app-tutorials/uu7game-deposit-and-withdrawal-guide"),
      " covers the deposit mechanics in full; the numbers specific to the welcome bonus are below.",
    ]),
    p(
      "Worked example: deposit ₹1,500 and the matching ₹1,500 credits to Gullak. At a 3x wagering requirement, that ₹1,500 bonus needs ₹4,500 in total eligible wagers placed before it — or any winnings sitting alongside it — becomes withdrawable. Depositing and immediately attempting to withdraw the bonus amount, before placing a single wager, will correctly get blocked; that's the requirement working as intended, not a bug.",
    ),
    p(
      "A second worked example at the higher end: deposit ₹10,000 and the matching ₹10,000 bonus needs ₹30,000 in eligible wagers before clearing. Scaling the deposit up scales the wagering target proportionally — the 3x multiplier stays fixed regardless of deposit size, so a larger first deposit doesn't make the requirement easier or harder relative to the bonus amount itself, only larger in absolute terms.",
    ),

    h2("How This Compares to a Typical Welcome Bonus"),
    p(
      "Across the real-money gaming category generally, a 100% first-deposit match is a common structure — UU7GAME's own offer matches this common pattern rather than being unusually generous or unusually stingy. What varies more between platforms is the wagering multiple attached (anywhere from roughly 1x to 10x or higher is realistic industry-wide) and whether the bonus lands in a separate, cancellable wallet or gets forced onto the main balance regardless of preference.",
    ),
    p(
      "UU7GAME's stated 3x multiple sits on the more moderate end of what's typical, and the separate cancellable Gullak wallet is a meaningfully better structure than a bonus forced onto the main balance with no opt-out. Comparing any other platform's welcome offer on these same two dimensions — the actual wagering multiple, and whether it's opt-in — is a more reliable comparison than the headline match percentage alone, which tends to look similar across most platforms regardless of how the fine print differs.",
    ),
    p(
      "A maximum deposit-match figure (UU7GAME advertises up to ₹50,000) is also worth reading correctly: it's a ceiling on the bonus amount itself, not a minimum deposit required to participate. A ₹200 first deposit still receives its full 100% match at that same rate — the ₹50,000 figure only becomes relevant if a deposit is large enough to approach it.",
    ),

    h2("Tracking Your Wagering Progress"),
    p(
      "Since the app's own screens show Gullak balance and Total Balance separately from Withdrawable balance, the practical way to track progress is periodic, not constant: check the Gullak/bonus screen after a session rather than trying to calculate remaining wagering requirement in your head mid-session. Noting your deposit amount and the 3x target the moment the bonus credits, then checking back after each session, is more reliable than reconstructing the math from memory once you're ready to attempt a withdrawal.",
    ),
    p(
      "If a specific session's games don't count toward the wagering requirement at the same rate as others (not every game category necessarily contributes evenly, per the bonus's own terms), progress may move slower than a simple total-wagered figure would suggest — checking the specific terms shown at the point of opting in avoids assuming a flat, even contribution rate across every format on the platform.",
    ),

    h2("Verification Before Your First Deposit"),
    mixedPara([
      "Phone verification exists as a funds-security measure, similar in spirit to the ",
      link("Know Your Customer", "https://en.wikipedia.org/wiki/Know_your_customer", true),
      " checks financial platforms generally use to confirm an account belongs to who it claims to — completing it before your first deposit means it won't interrupt the claiming process partway through. There's no separate bonus-specific verification step beyond this; the same phone verification required for the platform generally is what gates your first deposit.",
    ]),

    h2("Why It's Credited to Gullak, Not Your Main Balance"),
    p(
      "Crediting the bonus to a separate wallet rather than your main balance is a deliberate structural choice, not a cosmetic detail. It keeps your own deposited cash (once any attached bonus clears, or if you decline it) withdrawable on its own timeline, unaffected by whatever wagering requirement the bonus portion is still working through — and it's what makes the bonus genuinely optional rather than forced onto every deposit regardless of preference.",
    ),
    p(
      "The app explicitly states this bonus can be cancelled if you don't want it. Declining it means your deposit credits normally with no bonus attached and no wagering requirement gating it — a real choice worth considering deliberately rather than defaulting into, covered in the next section.",
    ),
    p(
      "Compare this structure to a platform that credits a bonus directly onto the main balance with no separation at all: every rupee showing in that combined figure becomes ambiguous about whether it's genuinely withdrawable or still tied to an unmet wagering condition. The separate wallet exists specifically to avoid that ambiguity, and it's worth checking for on any other platform's welcome offer as a basic structural signal, not just accepting a single combined balance figure at face value.",
    ),

    h2("Should You Claim It? A Genuine Trade-Off"),
    p(
      "A 100% match sounds like an unambiguous win, but it comes with a real condition: the matched amount (and any winnings from it) is locked behind a 3x wagering requirement until cleared. If your plan is to deposit and withdraw relatively quickly — testing the platform, or playing a single short session — the bonus adds a wagering obligation you may not actually want to work through. If your plan involves playing multiple sessions over time regardless, the match effectively doubles your bankroll for that play with a condition you were likely to satisfy anyway through normal use.",
    ),
    p(
      "There's no universally correct answer — it depends on how you actually intend to use the account. Deciding this before depositing, rather than accepting the bonus by default and discovering the wagering requirement later, is the more deliberate approach either way.",
    ),
    p(
      "A concrete way to decide: estimate roughly how much you'd realistically wager across normal sessions in the near term regardless of any bonus. If that figure already comfortably exceeds 3x your planned deposit, the wagering requirement costs you little beyond bookkeeping — you were going to clear it through ordinary play anyway, and the match is close to free additional value. If your realistic wagering falls well short of that 3x figure, the bonus is asking you to either play more than you'd otherwise plan to, or accept that the bonus portion simply won't convert to withdrawable cash — worth knowing before depositing rather than after.",
    ),
    p(
      "This same framework — comparing realistic wagering volume against the multiple attached to a bonus — applies to any welcome offer on any platform, not just UU7GAME's. It's a more useful decision tool than either automatically accepting every bonus offered or automatically declining all of them on principle.",
    ),

    h2("Common Mistakes First-Time Claimers Make"),
    bulletList([
      bulletItem(["Trying to withdraw the bonus amount (or winnings from it) before the wagering requirement is cleared, then assuming it's a platform error rather than the requirement working as designed."]),
      bulletItem(["Not checking whether specific games count toward the wagering requirement at the rate assumed — not every category necessarily contributes evenly, and the specific bonus's own terms (shown at the point of opting in) are worth reading rather than assumed."]),
      bulletItem(["Confusing Total Balance (which includes uncleared bonus credit) with Withdrawable balance (which doesn't) — the two are tracked separately for exactly this reason."]),
      bulletItem(["Assuming the 100% match applies to every deposit going forward — it's specifically a first-deposit mechanic; later deposits don't trigger it again."]),
      bulletItem(["Depositing more than intended specifically to maximize the match, without factoring in that a larger deposit also means a proportionally larger wagering target to clear."]),
    ]),

    h2("After the Welcome Bonus: What Comes Next"),
    mixedPara([
      "Once the first deposit is made and the welcome bonus has either cleared or been declined, ongoing bonus value comes from two separate mechanics rather than this one repeating: a VIP tier system tracking cumulative deposit/turnover activity, and a club/referral system rewarding invited players' activity. Neither requires any specific action tied to the welcome bonus itself — both run independently and start accruing as soon as an account is active. Our ",
      link("UU7GAME Bonus Guide", "/bonuses/uu7game-bonus-guide"),
      " covers both in full.",
    ]),
    p(
      "This is worth knowing upfront so the welcome bonus isn't mistaken for the platform's only ongoing value — it's specifically the one-time entry point, not a preview of what regular play looks like afterward.",
    ),

    h2("Common Questions"),
    mixedPara([bold("How do I claim the UU7GAME welcome bonus?"), " Register, complete phone verification, then make your first deposit — the matching 100% bonus credits automatically to a separate Gullak wallet at the same time, visible as a \"+\" tag on the deposit screen before you confirm."]),
    mixedPara([bold("Does the welcome bonus apply to every deposit?"), " No — it's specifically a First Deposit Bonus, triggering once on your first deposit only. Later deposits don't re-trigger the 100% match."]),
    mixedPara([bold("What's the wagering requirement on the welcome bonus?"), " A stated 3x multiplier — the bonus amount (and any winnings alongside it) needs to be wagered three times over across eligible games before it converts to withdrawable balance."]),
    mixedPara([bold("Can I decline the welcome bonus?"), " Yes — the app explicitly states it can be cancelled, in which case your deposit credits normally with no wagering requirement attached to it."]),
    mixedPara([bold("Why can't I withdraw my bonus right after depositing?"), " The 3x wagering requirement has to be cleared first — this is a standard anti-abuse measure across the real-money gaming industry, not specific to UU7GAME, and applies regardless of your account's balance."]),

    mixedPara([
      "For the platform's full bonus ecosystem beyond this one mechanic, see our ",
      link("UU7GAME Bonus Guide", "/bonuses/uu7game-bonus-guide"),
      ", and for the deposit mechanics themselves, our ",
      link("Deposit and Withdrawal Guide", "/app-tutorials/uu7game-deposit-and-withdrawal-guide"),
      " covers processing times and payment methods. Whatever you decide, our ",
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
    heading: "Ready to Claim Your Welcome Bonus?",
    description: "Register and make your first deposit to see the 100% match credit on UU7GAME.",
    buttonText: "Visit UU7GAME",
    buttonUrl: OFFICIAL_URL,
    position: 0,
  });

  await db.insert(postQuickAnswer).values({
    postId: post.id,
    text: "UU7GAME's welcome bonus is a 100% first-deposit match, up to ₹50,000, triggered only on your first deposit (not at registration). Claim it by registering, completing phone verification, then depositing — the match credits automatically to a separate Gullak wallet with a 3x wagering requirement, and can be cancelled if you don't want it.",
  });

  await db.insert(postAiSummary).values({
    postId: post.id,
    summary:
      "This guide covers UU7GAME's welcome bonus (called the First Deposit Bonus in-app) step by step. It triggers specifically on the first deposit, not at registration — steps are: register, complete phone/SMS OTP verification, deposit via UPI (every quick-select amount shows its matching bonus tag before confirming), and the 100% match (up to ₹50,000) credits to a separate cancellable 'Gullak' wallet with a stated 3x wagering requirement. A worked example: a ₹1,500 deposit's matching ₹1,500 bonus needs ₹4,500 in eligible wagers before it becomes withdrawable. The guide frames claiming the bonus as a genuine trade-off (locked behind a wagering requirement vs. effectively doubled bankroll for ongoing play) rather than an unambiguous win, and covers common first-time mistakes: trying to withdraw before the requirement clears, assuming the match applies to every deposit (it doesn't — first deposit only), and confusing Total Balance with Withdrawable balance.",
  });

  await db.insert(postKeyTakeaways).values(
    [
      "UU7GAME's welcome bonus triggers on your first deposit specifically, not at registration.",
      "It's a 100% match up to ₹50,000, credited to a separate cancellable 'Gullak' wallet with a 3x wagering requirement.",
      "Claiming steps: register, complete phone verification, then deposit — the match displays on the deposit screen before you confirm.",
      "Whether claiming it is worth it depends on your actual plans: it adds a real wagering obligation, valuable mainly if you were going to play multiple sessions anyway.",
      "The bonus can be declined — your deposit then credits normally with no wagering requirement attached.",
      "The match applies once, to your first deposit only — later deposits don't re-trigger the 100% bonus.",
    ].map((text, position) => ({ postId: post.id, text, position })),
  );

  await db.insert(postFaqs).values(
    [
      { question: "How do I claim the UU7GAME welcome bonus?", answer: "Register, complete phone verification, then make your first deposit — the matching 100% bonus credits automatically to a separate Gullak wallet at the same time, visible as a \"+\" tag on the deposit screen before you confirm." },
      { question: "Does the welcome bonus apply to every deposit?", answer: "No — it's specifically a First Deposit Bonus, triggering once on your first deposit only. Later deposits don't re-trigger the 100% match." },
      { question: "What's the wagering requirement on the welcome bonus?", answer: "A stated 3x multiplier — the bonus amount (and any winnings alongside it) needs to be wagered three times over across eligible games before it converts to withdrawable balance." },
      { question: "Can I decline the welcome bonus?", answer: "Yes — the app explicitly states it can be cancelled, in which case your deposit credits normally with no wagering requirement attached to it." },
      { question: "Why can't I withdraw my bonus right after depositing?", answer: "The 3x wagering requirement has to be cleared first — this is a standard anti-abuse measure across the real-money gaming industry, not specific to UU7GAME, and applies regardless of your account's balance." },
    ].map((f, position) => ({ postId: post.id, ...f, position })),
  );

  console.log("Created post:", post.id);
  process.exit(0);
}
main();
