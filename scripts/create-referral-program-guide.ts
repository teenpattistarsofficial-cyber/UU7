import { db } from "@/lib/db";
import { posts, categories, authors, seoMeta, postQuickAnswer, postAiSummary, postKeyTakeaways, postFaqs, postCtas } from "@/lib/db/schema";
import { extractText } from "@/lib/editor/text";
import type { JSONContent } from "@tiptap/core";
import { slugify } from "@/lib/seo/slugify";
import { eq } from "drizzle-orm";

const TITLE = "UU7GAME Referral Program Guide";
const SLUG = slugify(TITLE);
const CATEGORY_SLUG = "bonuses";
const AUTHOR_SLUG = "rohan-kapoor";
const IMAGE_URL = "https://images.pexels.com/photos/6564339/pexels-photo-6564339.jpeg?cs=srgb&dl=pexels-timmoor-6564339.jpg&fm=jpg";
const FOCUS_KEYWORD = "uu7game referral program";
const SEO_TITLE = "UU7GAME Referral Program: Club Rewards Explained";
const META_DESCRIPTION = "How UU7GAME's club/referral system actually works — the invitation bonus, rebate rates, and how it differs from the platform's separate VIP program.";
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
      "UU7GAME's Earn tab runs a \"club\" style referral system — a separate ongoing reward track from the VIP program covered in our ",
      link("UU7GAME VIP Program and Rebates Explained", "/bonuses/uu7game-vip-program-and-rebates-explained"),
      " guide. Where VIP tracks your own personal deposit/turnover activity, the UU7GAME referral program (the club system) tracks activity from players you've invited instead. This guide covers how it actually works: the invitation bonus, the rebate structure, and how to think about whether participating is worth it.",
    ]),

    h2("How the Club System Works"),
    p(
      "A \"My Team Club\" panel on the Earn tab tracks three things at once: Club Stars, a club member count shown as a fraction (for example, 0/5 slots filled), and a club bet target shown as a running total against a fixed goal (for example, ₹0 of a ₹200,000 target). Together, the member-slot count and the collective bet target indicate this system rewards group activity scaling with how many people you've referred and how much they collectively wager — not your own individual play.",
    ),
    p(
      "This structure means a club's progress can move even on a day you personally don't deposit or play at all, as long as referred members are active — a genuinely different mechanic from VIP, which only responds to your own account's activity. Club Stars specifically appear to function as a running tally reflecting overall club standing, distinct from the raw member count and bet target figures shown alongside them, though the interface reviewed for this guide didn't expose a separate conversion rate turning Stars themselves into a specific payout figure.",
    ),

    h2("The Invitation Bonus"),
    p(
      "The Earn tab surfaces a shareable invitation code advertised as \"Get ₹200,\" described in-app as \"no limit\" — meaning there's no stated cap on how many people can be referred using it. One-tap sharing to Telegram, WhatsApp, and Instagram is built directly into the tab, rather than requiring a manually copied link.",
    ),
    p(
      "\"No limit\" describes the number of referrals the code itself will accept, not necessarily an unlimited total payout without any other condition — checking the specific terms shown at the point of sharing avoids assuming the headline phrase covers every detail of how the reward actually pays out.",
    ),
    p(
      "Sharing the code is only the first step; the ₹200 figure and any downstream rebates depend on the referred person actually completing steps of their own (typically registration and a first deposit) rather than crediting the moment a link is merely opened. Treat the share action itself as starting the process, not completing it — the club panel's member-slot count updating from 0/5 toward a higher fraction is the practical confirmation that a referral has actually converted, not just been sent, and is a more reliable signal than assuming a share was successful just because it was sent.",
    ),

    h2("Referral Rebates: The Numbers"),
    bulletList([
      bulletItem([bold("Bet rebate: "), "up to 0.3% on qualifying wagers placed by your referred players, tracked against the club's collective bet target."]),
      bulletItem([bold("First-deposit rebate: "), "2% on a new referral's first deposit, credited to your own rewards balance when they complete it."]),
      bulletItem([bold("Invite rewards: "), "advertised up to ₹6,000 across the full referral structure."]),
    ]),
    p(
      "These figures are distinct from the VIP program's own stated rebates (0.1% and 0.3% at different tiers) — the overlapping 0.3% figure is a coincidence of similar numbers, not the same reward counted twice. Club rebates come specifically from referred players' activity; VIP rebates come specifically from your own.",
    ),
    p(
      "A worked example: a referred player deposits ₹2,000 for the first time — that triggers a 2% first-deposit rebate, or ₹40, credited to your rewards balance. If that same player then wagers ₹10,000 across eligible games over time, the 0.3% bet rebate on that activity adds roughly ₹30 more. Both figures are small individually, but they accrue per referred player, so a club with several active members compounds faster than the same rebate rate applied to a single account's own play — which is the actual mechanism behind the club bet target scaling toward larger cumulative figures like the ₹200,000 example shown on the panel. Five referred players each contributing a similar amount would move that same collective target roughly five times faster than one player alone, without any single referral needing to be unusually large.",
    ),
    p(
      "Because the rebate scales with the number of active referred players as well as their individual activity, a club with five members each wagering a modest amount can out-earn a club with one member wagering heavily, or vice versa — there's no single \"correct\" way to build toward the collective target, only the combined total of whatever your referred members actually do. This is also why the member-slot count and the bet target are shown as two separate figures rather than one combined number: filling every slot with inactive accounts moves the member count without moving the bet target at all, so the two together give a fuller picture than either alone.",
    ),

    h2("How Club Rewards Are Tracked"),
    p(
      "Rewards from the club system split into a withdrawable balance (with its own Claim/Detail actions) and running Total Rewards / Today's Rewards figures, visible on the Earn tab separately from your main account balance and separately from any VIP-tier rebate figures shown elsewhere. Checking each screen individually — Gullak (first-deposit bonus), VIP progress, and club rewards — rather than assuming one Total Balance figure explains everything is the most reliable way to understand exactly where a specific reward came from.",
    ),

    h2("Club vs. VIP: Two Independent Tracks"),
    p(
      "A useful way to keep these straight: VIP asks how much you've personally deposited and wagered; the club system asks how much the people you've invited have deposited and wagered. Both can run simultaneously on the same account, both can sit at zero, and neither one's progress affects the other's threshold or rebate rate. A single account can hold VIP tier progress from personal play and club rewards from referred players' activity at the same time, each tracked through its own screen.",
    ),
    p(
      "This distinction also means the two systems reward genuinely different behavior: VIP rewards your own continued engagement with the platform, while the club system rewards successfully bringing in and retaining other active players. A player who never refers anyone can still reach high VIP tiers purely through personal play; a player who refers many people but rarely plays personally can still see meaningful club rewards purely from referred activity. Neither system requires participating in the other to make progress, and a player genuinely uninterested in one can simply ignore that screen without missing out on the other.",
    ),

    h2("Checking Your Club Progress"),
    p(
      "The practical habit here mirrors the one worth building for VIP: check the Earn tab periodically rather than only right after sending an invitation. Since club rewards depend on referred players' ongoing activity (not a one-time event), the member-slot fraction and collective bet target are live figures that move as your referred players continue playing, not fixed the moment they first sign up. A referral that shows little initial activity might still contribute meaningfully later, and one that starts strong might slow down — checking periodically gives a more accurate picture than a single early look, the same way a single snapshot of any live figure tends to undersell how much it moves over a longer stretch of normal use.",
    ),

    h2("Is Referring Others Worth It?"),
    p(
      "The honest answer depends on whether you'd naturally be sharing the platform with people who'd genuinely want to use it anyway, versus pressuring acquaintances into signing up purely to unlock a rebate. The former is a reasonable way to earn a passive rebate from people who were going to play regardless of your referral; the latter risks encouraging real-money gaming participation in someone who might not have otherwise chosen to, which runs counter to treating gaming as a deliberate, self-directed choice rather than something to recruit others into for personal benefit.",
    ),
    mixedPara([
      "If you do refer someone, sharing our ",
      link("Responsible Gaming", "/responsible-gaming"),
      " guidelines alongside the invitation is a reasonable practice — someone joining through a referral deserves the same access to bankroll-management basics as anyone finding the platform independently.",
    ]),
    p(
      "It's also worth being honest with yourself about the actual scale of the incentive: a 2% first-deposit rebate and a 0.3% bet rebate are genuinely modest figures relative to the ₹200 invitation bonus's headline number. The real value in the club system accrues slowly, from ongoing referred-player activity over time, not from the act of referring itself — treating it as a quick way to a large payout misreads how the mechanic is actually structured, and expecting otherwise is a common source of disappointment for new participants.",
    ),

    h2("Common Mistakes With the Club System"),
    bulletList([
      bulletItem(["Confusing club rebates with VIP rebates — both use similarly-sized percentages in places, but they're calculated from entirely different activity and shown on separate screens."]),
      bulletItem(["Assuming the ₹200 invitation bonus and the ongoing rebates are the same reward — the flat invitation amount and the percentage-based rebates are separate components of the same broader system."]),
      bulletItem(["Referring people primarily to fill club member slots, rather than because they'd genuinely want to use the platform — a referral that doesn't lead to real activity contributes nothing to the collective bet target regardless of how many slots show as filled."]),
      bulletItem(["Not checking the Earn tab's Total Rewards / Today's Rewards figures separately from other balances, leading to confusion about which reward came from which system."]),
    ]),

    h2("How This Compares to a Typical Referral Program"),
    mixedPara([
      "A shareable invite code with a flat signup bonus plus an ongoing percentage rebate on referred activity is a fairly standard ",
      link("referral marketing", "https://en.wikipedia.org/wiki/Referral_marketing", true),
      " structure, used across many platforms and industries beyond real-money gaming specifically. What's worth comparing across platforms is whether the rebate is disclosed as a clear percentage (as UU7GAME's stated 0.3% bet rebate and 2% first-deposit rebate are) versus a vague \"earn rewards\" promise with no attached number, and whether there's a genuine cap or \"no limit\" claim that holds up against the platform's own fine print.",
    ]),
    p(
      "A club/team structure that shows real-time progress — member slots filled, collective bet target reached — the way UU7GAME's Earn tab does, gives a considerably more checkable picture than a referral program that only shows a final payout with no visibility into how it's being calculated along the way.",
    ),
    p(
      "One more comparison point worth checking on any platform's referral program: whether the referred player also receives a benefit from using the code, or whether the entire reward flows only to the referrer. UU7GAME's structure ties the referrer's rebates to the referred player's own deposit and wagering activity, meaning the referred player is simply using the platform normally rather than being asked to accept worse terms than a direct signup would offer — worth confirming on any other platform's program before assuming referral links never carry a hidden cost to the person being referred.",
    ),

    h2("Common Questions"),
    mixedPara([bold("How does the UU7GAME referral/club system work?"), " It tracks activity from players you've invited, not your own personal play — a \"My Team Club\" panel shows member slots filled (e.g., 0/5) and a collective bet target (e.g., ₹0 of ₹200,000), separate from the VIP program's tracking of your own account."]),
    mixedPara([bold("What is the UU7GAME invitation bonus?"), " A shareable code advertised as \"Get ₹200,\" described as \"no limit\" on the number of referrals it accepts, with one-tap sharing built into the Earn tab for Telegram, WhatsApp, and Instagram."]),
    mixedPara([bold("What rebates does the club system offer?"), " A bet rebate up to 0.3% on referred players' qualifying wagers, a 2% first-deposit rebate on a new referral's first deposit, and invite rewards advertised up to ₹6,000 across the full structure."]),
    mixedPara([bold("Is the club system the same as the VIP program?"), " No — the club system tracks activity from players you've referred; VIP tracks your own personal deposit/turnover activity. They run independently and are tracked on separate screens, even though both use similarly-sized rebate percentages in places."]),
    mixedPara([bold("Should I pressure friends to sign up through my referral link?"), " No — a referral is more reasonable when shared with people who'd genuinely want to use the platform anyway. Encouraging someone to join purely to unlock your own rebate works against treating real-money gaming as a deliberate, self-directed choice."]),

    mixedPara([
      "For the platform's other bonus mechanics, see our ",
      link("UU7GAME Bonus Guide", "/bonuses/uu7game-bonus-guide"),
      " and our ",
      link("UU7GAME VIP Program and Rebates Explained", "/bonuses/uu7game-vip-program-and-rebates-explained"),
      " guide. Whatever you share, our ",
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
    heading: "Ready to Share Your Invite Code?",
    description: "Find your referral link and club progress directly on UU7GAME.",
    buttonText: "Visit UU7GAME",
    buttonUrl: OFFICIAL_URL,
    position: 0,
  });

  await db.insert(postQuickAnswer).values({
    postId: post.id,
    text: "UU7GAME's club/referral system tracks activity from players you've invited, not your own play — a shareable invite code ('Get ₹200,' no limit) plus ongoing rebates: up to 0.3% bet rebate and 2% first-deposit rebate on referrals, with invite rewards advertised up to ₹6,000. It's separate from the VIP program, which tracks your own personal deposit/turnover activity instead.",
  });

  await db.insert(postAiSummary).values({
    postId: post.id,
    summary:
      "UU7GAME's Earn tab runs a club/referral system tracking activity from invited players rather than the account holder's own play. A 'My Team Club' panel shows Club Stars, a member-slot fraction (e.g. 0/5), and a collective bet target (e.g. ₹0 of ₹200,000). The invitation mechanic is a shareable code advertised as 'Get ₹200' with no stated limit on referral count, with one-tap sharing to Telegram, WhatsApp, and Instagram. Rebates: up to 0.3% bet rebate on referred players' wagers, 2% first-deposit rebate on a referral's first deposit, and invite rewards up to ₹6,000. Rewards track separately as a withdrawable balance plus Total Rewards/Today's Rewards figures. Explicitly distinguished from the VIP program (which tracks personal activity, not referred players') despite an overlapping 0.3% rebate figure in both systems. The guide frames referring others as reasonable when shared with people who'd genuinely want to use the platform anyway, cautioning against pressuring people to sign up purely for personal rebate gain.",
  });

  await db.insert(postKeyTakeaways).values(
    [
      "UU7GAME's club/referral system tracks activity from invited players, not your own personal play — a separate track from VIP.",
      "The invitation bonus is a shareable code advertised as 'Get ₹200' with no stated limit on referral count, shareable via Telegram, WhatsApp, and Instagram.",
      "Referral rebates: up to 0.3% bet rebate on referred players' wagers, 2% first-deposit rebate on a referral's first deposit, up to ₹6,000 in invite rewards.",
      "Club and VIP rebates both use similarly-sized percentages in places, but come from entirely different activity and are tracked on separate screens.",
      "Club rewards track as a withdrawable balance plus running Total Rewards/Today's Rewards figures, separate from Gullak and VIP balances.",
      "Referring others is more reasonable when shared with people who'd genuinely want to use the platform anyway, not pressured into signing up for personal rebate gain.",
    ].map((text, position) => ({ postId: post.id, text, position })),
  );

  await db.insert(postFaqs).values(
    [
      { question: "How does the UU7GAME referral/club system work?", answer: "It tracks activity from players you've invited, not your own personal play — a \"My Team Club\" panel shows member slots filled (e.g., 0/5) and a collective bet target (e.g., ₹0 of ₹200,000), separate from the VIP program's tracking of your own account." },
      { question: "What is the UU7GAME invitation bonus?", answer: "A shareable code advertised as \"Get ₹200,\" described as \"no limit\" on the number of referrals it accepts, with one-tap sharing built into the Earn tab for Telegram, WhatsApp, and Instagram." },
      { question: "What rebates does the club system offer?", answer: "A bet rebate up to 0.3% on referred players' qualifying wagers, a 2% first-deposit rebate on a new referral's first deposit, and invite rewards advertised up to ₹6,000 across the full structure." },
      { question: "Is the club system the same as the VIP program?", answer: "No — the club system tracks activity from players you've referred; VIP tracks your own personal deposit/turnover activity. They run independently and are tracked on separate screens, even though both use similarly-sized rebate percentages in places." },
      { question: "Should I pressure friends to sign up through my referral link?", answer: "No — a referral is more reasonable when shared with people who'd genuinely want to use the platform anyway. Encouraging someone to join purely to unlock your own rebate works against treating real-money gaming as a deliberate, self-directed choice." },
    ].map((f, position) => ({ postId: post.id, ...f, position })),
  );

  console.log("Created post:", post.id);
  process.exit(0);
}
main();
