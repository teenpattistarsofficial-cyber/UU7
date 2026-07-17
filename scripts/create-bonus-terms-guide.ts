import { db } from "@/lib/db";
import { posts, categories, authors, seoMeta, postQuickAnswer, postAiSummary, postKeyTakeaways, postFaqs, postCtas } from "@/lib/db/schema";
import { extractText } from "@/lib/editor/text";
import type { JSONContent } from "@tiptap/core";
import { slugify } from "@/lib/seo/slugify";
import { eq } from "drizzle-orm";

const TITLE = "UU7GAME Bonus Terms and Wagering Requirements Explained";
const SLUG = slugify(TITLE);
const CATEGORY_SLUG = "bonuses";
const AUTHOR_SLUG = "rohan-kapoor";
const IMAGE_URL = "https://images.pexels.com/photos/3678384/pexels-photo-3678384.jpeg?cs=srgb&dl=pexels-aperture-pro-2032212-3678384.jpg&fm=jpg";
const FOCUS_KEYWORD = "uu7game bonus terms";
const SEO_TITLE = "UU7GAME Bonus Terms: How to Actually Read Them";
const META_DESCRIPTION = "How to read any bonus's fine print — wagering requirements, game weighting, expiry, and opt-in rules — using UU7GAME's own stated terms as the worked example.";
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
      "Every bonus mentioned across our ",
      link("UU7GAME Bonus Guide", "/bonuses/uu7game-bonus-guide"),
      ", ",
      link("Welcome Bonus Guide", "/bonuses/uu7game-welcome-bonus-guide"),
      ", ",
      link("VIP Program", "/bonuses/uu7game-vip-program-and-rebates-explained"),
      ", and ",
      link("Referral Program", "/bonuses/uu7game-referral-program-guide"),
      " guides carries fine print underneath the headline number. This guide is the dedicated deep dive on reading UU7GAME bonus terms specifically — the general concepts every bonus's terms cover, and UU7GAME's own stated numbers as the worked example against each one.",
    ]),

    h2("What Bonus Terms Actually Cover"),
    mixedPara([
      "Across the real-money gaming category generally, a bonus's terms cover roughly six things: the wagering requirement multiple, which games count toward clearing it (and at what rate), an expiry window to clear it, any maximum bet size allowed while a bonus is active, any cap on how much can be withdrawn from bonus-derived winnings, and whether the bonus is automatic or requires opting in. This is the same category of document as a platform's broader ",
      link("terms of service", "https://en.wikipedia.org/wiki/Terms_of_service", true),
      ", just scoped to one specific promotion — reading a bonus fully means checking all six items, not just the headline match percentage.",
    ]),

    h2("The Wagering Requirement, in Detail"),
    p(
      "UU7GAME's first-deposit bonus states a 3x wagering requirement on the bonus amount specifically — a ₹1,000 bonus needs ₹3,000 in eligible wagers before it converts to withdrawable balance. This is one of two common formats across the industry: some platforms base the multiple on the bonus amount alone (UU7GAME's stated structure), while others base it on the deposit plus bonus combined, which produces a meaningfully larger wagering target for the same headline multiple. Checking which base a specific bonus's multiple applies to changes the real number significantly, even when the multiplier itself looks identical on paper.",
    ),
    p(
      "Worked comparison: a 3x requirement on a ₹1,000 bonus alone means ₹3,000 to clear. A 3x requirement on the combined ₹2,000 (deposit plus matching bonus) means ₹6,000 to clear — double the wagering for the same stated multiplier, simply because of which base it's calculated against. UU7GAME's own stated language (\"the bonus amount and any winnings from it\") points to the bonus-only base, but confirming this against the exact terms shown at the point of opting in is worth doing rather than assuming either format applies by default. This single distinction is the most consequential number in a bonus's entire terms, and the one most likely to be glossed over when only the headline multiplier is read.",
    ),

    h2("Game Weighting: Not Every Game Counts Equally"),
    p(
      "Across the industry, it's common for different game categories to contribute toward a wagering requirement at different rates — slots often count at or near 100% of wagered amount, while live-dealer table games or skill-based formats sometimes count at a reduced rate or are excluded entirely from a specific bonus's eligible games. UU7GAME's own guidance states that not every game category necessarily contributes evenly, without publishing a single fixed weighting table in the interface reviewed for this guide — the practical takeaway is to check a specific bonus's own terms for which categories count, rather than assuming a rummy session and a slots session clear the same wagering requirement at the same pace.",
    ),
    p(
      "The general industry logic behind reduced weighting for some formats is house-edge related: a game with a lower house edge or a skill component contributes less toward the wagering requirement per rupee wagered specifically because it's a less profitable format for the platform to have wagering cleared through, compared to a higher house-edge format. This isn't unique to any single platform's policy — it's a standard reason many bonus terms industry-wide differentiate between game categories rather than treating all wagering as equal regardless of format.",
    ),
    mixedPara([
      "This is the same caveat covered in our ",
      link("Deposit and Withdrawal Guide", "/app-tutorials/uu7game-deposit-and-withdrawal-guide"),
      "'s turnover section — worth cross-referencing if you're actively tracking wagering progress toward a specific bonus.",
    ]),

    h2("Expiry Windows"),
    p(
      "Most bonuses across the category carry a time limit to clear their wagering requirement — deposit today, and the bonus (or the wagering progress toward it) can expire if not cleared within a stated window, commonly anywhere from a few days to a month depending on the platform and specific promotion. This guide doesn't have a single confirmed expiry figure for UU7GAME's first-deposit bonus specifically to state as fact; the practical approach is to check the exact window shown at the point the bonus credits, and treat \"no visible expiry mentioned anywhere\" as worth confirming with support directly rather than assuming indefinite validity.",
    ),
    p(
      "An expiry window interacts directly with the pace of the format being played to clear it: a fast-resolving format like slots or Aviator can clear a given wagering target in considerably less real time than a slower format like a full rummy hand or a live-dealer table round, simply because more individual wagers fit into the same stretch of time. Factoring the expiry window into which format you play while clearing a bonus's wagering requirement — not just how much you're willing to wager overall — is a practical way to avoid running out of time on a requirement that was otherwise achievable.",
    ),

    h2("Maximum Bet While a Bonus Is Active"),
    p(
      "Some platforms cap the maximum single bet allowed while wagering a bonus is in progress — placing a bet above that cap can void the bonus and any progress toward clearing it, even if the bet itself would otherwise have been a normal, allowed wager on a real-balance basis. This is a genuine industry-wide practice worth checking for specifically, since it's easy to overlook if a platform's general bet limits (not bonus-specific ones) are the only figures checked beforehand.",
    ),
    p(
      "The reasoning behind this restriction, where it exists, is straightforward from the platform's side: a small number of very large bets could clear a wagering requirement in one or two rounds rather than through the sustained play the requirement is meant to represent, which is the specific behavior a bonus-specific bet cap is designed to prevent. Understanding the rationale doesn't change the practical advice, though — checking whether a specific bonus's terms mention a bet cap distinct from the platform's general limits remains the useful step regardless of why the restriction exists.",
    ),

    h2("Maximum Cashout Caps"),
    p(
      "A separate, distinct restriction some bonuses carry is a cap on how much can actually be withdrawn from bonus-derived winnings, even after the wagering requirement is fully cleared — for example, a bonus capped at 10x its own value in withdrawable winnings, regardless of how much was actually won during play. This is different from the wagering requirement itself (which gates whether winnings become withdrawable at all) — a cashout cap instead limits how much of an unusually large win specifically converts to real, withdrawable money. Checking for this specific term, separate from the wagering multiple, avoids an unpleasant surprise on the rare session where a bonus-funded bet produces a large win.",
    ),
    p(
      "This distinction matters most in exactly the scenario a player would otherwise be celebrating: a small bonus-funded bet that happens to produce an unusually large win. Without a cashout cap, that full win becomes withdrawable once the wagering requirement clears. With one, only a portion up to the cap converts, and the remainder is typically forfeited rather than carried forward. Neither structure is inherently dishonest — a cashout cap is a legitimate way for a platform to limit its own exposure on bonus-funded play — but it changes the realistic upside of a bonus in a way the headline match percentage never communicates on its own, and it's precisely the kind of term that only surfaces by reading the fine print rather than the promotional banner.",
    ),

    h2("Opt-In vs. Automatic Bonuses"),
    p(
      "UU7GAME's first-deposit bonus is automatic — it credits at the point of a qualifying deposit without a separate claim step — but explicitly cancellable, giving a genuine opt-out rather than forcing the bonus and its wagering requirement onto every deposit regardless of preference. This is a meaningfully better structure than a bonus that's both automatic and non-cancellable, which removes the choice entirely. Checking whether a specific bonus is opt-in, automatic-but-cancellable, or automatic-with-no-opt-out is itself a useful signal about how much control a platform gives a player over their own funds.",
    ),

    h2("Common Mistakes Reading Bonus Terms"),
    bulletList([
      bulletItem(["Assuming the wagering multiple applies to the deposit-plus-bonus combined figure when a platform actually bases it on the bonus alone, or vice versa — leading to either an unpleasant surprise or unnecessarily cautious play."]),
      bulletItem(["Assuming every game category clears wagering at the same rate, then discovering a preferred format was contributing slowly or not at all toward the requirement."]),
      bulletItem(["Not checking for an expiry window until a bonus has already lapsed, forfeiting wagering progress that could have been completed with more deliberate session planning."]),
      bulletItem(["Placing a single large bet while a bonus is active without checking for a max-bet restriction, risking voiding the bonus entirely on a bet that would have been fine using real balance alone."]),
      bulletItem(["Treating a cleared wagering requirement as the final step, without checking for a separate maximum cashout cap on bonus-derived winnings specifically."]),
    ]),

    h2("A Practical Checklist Before Accepting Any Bonus"),
    bulletList([
      bulletItem(["What's the wagering multiple, and is it based on the bonus alone or the deposit plus bonus combined?"]),
      bulletItem(["Which games count toward clearing it, and at what rate — do slots, live casino, and card games all contribute equally?"]),
      bulletItem(["Is there an expiry window to clear the wagering requirement, and what happens if it isn't cleared in time?"]),
      bulletItem(["Is there a maximum bet size allowed while the bonus is active, and what happens if it's exceeded?"]),
      bulletItem(["Is there a cap on how much can be withdrawn from bonus-derived winnings specifically?"]),
      bulletItem(["Is the bonus automatic or opt-in, and can it be declined or cancelled if unwanted?"]),
    ]),
    p(
      "Running through these six questions takes a few minutes against any specific bonus's own displayed terms, and applies equally whether you're evaluating UU7GAME's own offers or any other platform's promotion, real-money gaming or otherwise.",
    ),

    h2("UU7GAME's Terms as a Worked Example"),
    bulletList([
      bulletItem([bold("Wagering multiple: "), "3x, stated on the bonus amount specifically."]),
      bulletItem([bold("Game weighting: "), "not evenly disclosed as a single fixed table — check the specific bonus's own terms for which categories count."]),
      bulletItem([bold("Expiry: "), "not independently confirmed for this guide — verify the specific window shown when a bonus credits."]),
      bulletItem([bold("Max bet cap: "), "not independently confirmed for this guide — a general industry practice worth checking regardless of platform."]),
      bulletItem([bold("Max cashout cap: "), "not independently confirmed for this guide — check for this separately from the wagering multiple."]),
      bulletItem([bold("Opt-in structure: "), "automatic on qualifying deposit, explicitly cancellable."]),
    ]),
    p(
      "The gaps in this table aren't a criticism of UU7GAME specifically — they reflect what wasn't independently verifiable in the interface screens reviewed for this guide, not a claim that no such terms exist. Checking the exact wording shown at the point a specific bonus credits remains the authoritative source, on this platform and any other, and this same six-item structure works as a template for evaluating that source directly.",
    ),

    h2("Common Questions"),
    mixedPara([bold("What do UU7GAME's bonus terms actually require?"), " A stated 3x wagering requirement on the first-deposit bonus amount, credited automatically but explicitly cancellable — check the app's own bonus screen for the full current terms, including expiry and eligible games."]),
    mixedPara([bold("Does every game count the same toward a wagering requirement?"), " Not necessarily — game categories can contribute at different rates industry-wide, and UU7GAME's own guidance notes contribution isn't necessarily even across categories, without a single published weighting table."]),
    mixedPara([bold("What's the difference between a wagering requirement and a cashout cap?"), " A wagering requirement gates whether bonus winnings become withdrawable at all; a cashout cap separately limits how much of a win specifically converts to withdrawable money, even after the wagering requirement clears."]),
    mixedPara([bold("Is UU7GAME's bonus based on the deposit or the bonus amount?"), " The stated language points to the bonus amount specifically (3x the bonus, not the combined deposit-plus-bonus figure) — confirm against the exact terms shown when a specific bonus credits."]),
    mixedPara([bold("Can I decline a UU7GAME bonus if I don't want the wagering requirement?"), " Yes — the first-deposit bonus is explicitly stated as cancellable, letting a deposit credit normally with no bonus or wagering requirement attached."]),

    mixedPara([
      "For the platform's individual bonus mechanics, see our ",
      link("UU7GAME Bonus Guide", "/bonuses/uu7game-bonus-guide"),
      ", ",
      link("Welcome Bonus Guide", "/bonuses/uu7game-welcome-bonus-guide"),
      ", ",
      link("VIP Program", "/bonuses/uu7game-vip-program-and-rebates-explained"),
      ", and ",
      link("Referral Program", "/bonuses/uu7game-referral-program-guide"),
      " guides. Whatever bonus you're considering, our ",
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
    heading: "Ready to Read the Terms Yourself?",
    description: "Check the current bonus terms directly on UU7GAME before you deposit.",
    buttonText: "Visit UU7GAME",
    buttonUrl: OFFICIAL_URL,
    position: 0,
  });

  await db.insert(postQuickAnswer).values({
    postId: post.id,
    text: "UU7GAME's bonus terms include a 3x wagering requirement (stated on the bonus amount specifically), automatic-but-cancellable crediting, and game contribution that isn't necessarily even across categories. A full bonus-terms check covers six things: the wagering multiple and its base, game weighting, expiry window, max bet cap, max cashout cap, and opt-in structure.",
  });

  await db.insert(postAiSummary).values({
    postId: post.id,
    summary:
      "This guide explains what bonus terms generally cover (wagering multiple and its base, game weighting, expiry window, max bet cap while wagering, max cashout cap, opt-in structure) and applies each to UU7GAME's own stated terms as a worked example. UU7GAME's first-deposit bonus: 3x wagering requirement stated on the bonus amount specifically (not the combined deposit-plus-bonus figure), automatic crediting on qualifying deposit but explicitly cancellable, and game contribution toward wagering that isn't necessarily even across categories per the platform's own guidance, without a single published weighting table. The guide is explicit about what wasn't independently verifiable (expiry window, max bet cap, max cashout cap) rather than fabricating figures, framing those gaps as items to confirm against the app's own displayed terms rather than assumed facts. Provides a six-question practical checklist applicable to any platform's bonus, not just UU7GAME's.",
  });

  await db.insert(postKeyTakeaways).values(
    [
      "A full bonus-terms check covers six things: wagering multiple and its base, game weighting, expiry window, max bet cap, max cashout cap, and opt-in structure.",
      "UU7GAME's stated 3x wagering requirement applies to the bonus amount specifically, not the combined deposit-plus-bonus figure — a meaningful distinction that changes the real wagering target.",
      "Game categories don't necessarily contribute toward a wagering requirement at the same rate — check a specific bonus's own terms rather than assuming even contribution.",
      "A wagering requirement and a maximum cashout cap are different restrictions — clearing the wagering requirement doesn't necessarily mean there's no separate limit on withdrawable winnings.",
      "UU7GAME's first-deposit bonus is automatic but explicitly cancellable — a meaningfully better structure than a bonus that's both automatic and non-cancellable.",
      "Some figures (expiry window, max bet cap, max cashout cap) weren't independently verifiable for this guide — check the exact terms shown when a specific bonus credits rather than assuming any figure by default.",
    ].map((text, position) => ({ postId: post.id, text, position })),
  );

  await db.insert(postFaqs).values(
    [
      { question: "What do UU7GAME's bonus terms actually require?", answer: "A stated 3x wagering requirement on the first-deposit bonus amount, credited automatically but explicitly cancellable — check the app's own bonus screen for the full current terms, including expiry and eligible games." },
      { question: "Does every game count the same toward a wagering requirement?", answer: "Not necessarily — game categories can contribute at different rates industry-wide, and UU7GAME's own guidance notes contribution isn't necessarily even across categories, without a single published weighting table." },
      { question: "What's the difference between a wagering requirement and a cashout cap?", answer: "A wagering requirement gates whether bonus winnings become withdrawable at all; a cashout cap separately limits how much of a win specifically converts to withdrawable money, even after the wagering requirement clears." },
      { question: "Is UU7GAME's bonus based on the deposit or the bonus amount?", answer: "The stated language points to the bonus amount specifically (3x the bonus, not the combined deposit-plus-bonus figure) — confirm against the exact terms shown when a specific bonus credits." },
      { question: "Can I decline a UU7GAME bonus if I don't want the wagering requirement?", answer: "Yes — the first-deposit bonus is explicitly stated as cancellable, letting a deposit credit normally with no bonus or wagering requirement attached." },
    ].map((f, position) => ({ postId: post.id, ...f, position })),
  );

  console.log("Created post:", post.id);
  process.exit(0);
}
main();
