import { db } from "@/lib/db";
import { posts, categories, authors, seoMeta, postStatsTables, postQuickAnswer, postAiSummary, postKeyTakeaways, postFaqs, postCtas } from "@/lib/db/schema";
import { extractText } from "@/lib/editor/text";
import type { JSONContent } from "@tiptap/core";
import { slugify } from "@/lib/seo/slugify";
import { eq } from "drizzle-orm";

const TITLE = "UU7GAME Official Site Guide";
const SLUG = slugify(TITLE);
const CATEGORY_SLUG = "app-tutorials";
const AUTHOR_SLUG = "rohan-kapoor";
const IMAGE_URL = "https://images.pexels.com/photos/11391947/pexels-photo-11391947.jpeg?cs=srgb&dl=pexels-towfiqu-barbhuiya-3440682-11391947.jpg&fm=jpg";
const FOCUS_KEYWORD = "uu7game official site";
const SEO_TITLE = "UU7GAME Official Site Guide: Spot Fakes & Phishing Clones";
const META_DESCRIPTION = "How to confirm you're on UU7GAME's real official site — spotting fake clones, phishing pages, and unofficial APK sources before you deposit or log in.";
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
    p(
      "Real-money gaming brands are one of the most commonly cloned categories of website — fake login pages, lookalike domains, and cloned APK download sites specifically designed to steal credentials or deposits. Our Login and APK Download guides both already warn about this in passing; this page is the full breakdown of how to actually confirm you're on the real UU7GAME official site before you register, log in, or deposit anywhere.",
    ),
    h2("UU7GAME's Official Website"),
    mixedPara([
      "UU7GAME's confirmed official website is ",
      link(OFFICIAL_URL.replace(/\/$/, ""), OFFICIAL_URL, true),
      ". This is the source we've verified directly and the one our own ",
      link("APK Download Guide", "/app-tutorials/uu7game-apk-download-guide"),
      " points to for the actual app download. Bookmark it directly rather than relying on search results or links shared elsewhere — that alone avoids most of the risk covered in this guide.",
    ]),
    p(
      "Bookmarking matters more than it might seem: once a genuine bookmark exists, there's simply no reason to ever click a UU7GAME link from anywhere else again — a message, an ad, or a search result. Removing the need to re-find the site each time removes most of the opportunities a fake site has to intercept you in the first place.",
    ),
    h2("Why Fake UU7GAME Sites Exist"),
    p(
      "Cloning a popular real-money gaming site is a low-effort, high-reward scam: copy the visual design, register a similar-looking domain, and either harvest login credentials directly or trick people into \"depositing\" into an account that isn't actually connected to the real platform at all. This isn't specific to UU7GAME — it's a standing risk for any gaming or fintech brand with real money attached, which is exactly why verification habits matter regardless of which platform you're using.",
    ),
    p(
      "The economics are simple: building a convincing clone takes a few hours of copying an existing design, while the potential payout is every deposit or credential harvested before the site gets taken down or word spreads that it's fake. That asymmetry — low cost to build, meaningful potential reward — is exactly why popular real-money gaming brands specifically attract this kind of clone, far more than a low-traffic hobby site would.",
    ),
    p(
      "A site's own growing popularity is, somewhat perversely, exactly what makes it a more attractive clone target over time — more people searching for it and more people willing to click an unfamiliar link claiming to be it. That's not a reason to worry about a specific platform's legitimacy; it's simply a reason the verification habit becomes more relevant, not less, the more established a real-money brand gets.",
    ),
    h2("How Fake Sites Get Distributed"),
    p(
      "Fake UU7GAME sites rarely rank highly enough to appear at the top of an organic Google search, so they typically spread through other channels: paid social media ads (which can slip past ad-review checks with a convincing enough landing page), SMS or WhatsApp messages claiming to offer a \"new bonus\" or \"exclusive link,\" fake listings on third-party app marketplaces, and links shared in gaming-focused Telegram or Discord groups by accounts posing as other players. Recognizing that the fake almost never comes from a plain organic search result is itself a useful piece of context — the more unsolicited or too-convenient the way you encountered a link, the more scrutiny it deserves before you click it. A message that arrives out of nowhere promising something better than what you already know the platform offers is, on its own, reason enough to slow down before clicking through.",
    ),
    h2("How to Spot a Fake or Cloned Site"),
    bulletList([
      bulletItem([bold("Check the domain carefully, not just the page design."), " A cloned site can copy every visual detail perfectly while running on a domain that's one letter off from the real one — a classic ", link("typosquatting", "https://en.wikipedia.org/wiki/Typosquatting", true), " tactic. Read the URL character by character rather than skimming it."]),
      bulletItem([bold("Look for a valid HTTPS connection."), " A padlock icon and \"https://\" don't guarantee legitimacy on their own, but their absence is a hard red flag — no real financial platform operates without basic transport encryption."]),
      bulletItem([bold("Be suspicious of unusually generous bonus offers."), " A \"deposit and get 10x back\" style offer that's dramatically better than anything on the real platform's own promotions is a common lure to get a first deposit onto a fake site."]),
      bulletItem([bold("Watch for immediate requests for sensitive information."), " A genuine site doesn't need your password, OTP, or full bank details just to load the homepage — that request pattern is a phishing signal, not normal onboarding."]),
      bulletItem([bold("Check for consistent branding and basic polish."), " Slightly-off logos, inconsistent fonts, or obvious spelling and grammar mistakes are common in rushed clone sites, even when the overall layout is copied convincingly."]),
      bulletItem([bold("Look for real support and company information."), " A legitimate platform has actual, reachable support channels — see the next section. A site with no support contact beyond a single chat widget of unclear origin is worth treating cautiously."]),
    ]),
    h2("Checking the App Itself"),
    mixedPara([
      "The same verification logic applies to the app, not just the website. Our ",
      link("APK Download Guide", "/app-tutorials/uu7game-apk-download-guide"),
      " covers this in full, but the short version: download the APK only from the official website above, never from a third-party app store, a search-result ad, or a link shared in a message or forum post. A modified APK distributed outside official channels is one of the most common ways malware ends up on a device, and it's a completely separate risk from a fake website even though both exploit the same instinct to trust something that looks familiar.",
    ]),
    p(
      "Once installed, a genuine app should ask for only the permissions its actual functionality requires — storage access for downloads, network access to connect, and similar. A modified APK bundled with unrelated permission requests (reading contacts or SMS without a stated reason, for instance) is a signal worth taking seriously even after the file has already downloaded successfully, not just before.",
    ),
    p(
      "If anything about the install feels off after the fact — permissions that seem excessive, unexpected pop-ups, or behavior that doesn't match what our own guides describe — uninstalling and redownloading directly from the confirmed official site costs a few minutes and removes any doubt, rather than continuing to use an app you're not fully confident in.",
    ),
    h2("What Legitimate UU7GAME Communications Look Like"),
    mixedPara([
      "According to our ",
      link("UU7GAME Review 2026", "/app-tutorials/uu7game-review-2026-is-it-legit"),
      ", official support runs through three channels: 24/7 live chat inside the app, a Telegram support channel, and email. Legitimate support through any of these channels will never ask for your password or OTP — that rule holds regardless of how official the request sounds or how urgent it's framed. An unsolicited message claiming to be UU7GAME support, arriving outside these three channels, should be treated as a phishing attempt by default rather than given the benefit of the doubt.",
    ]),
    p(
      "A useful habit: if you're contacted first — by SMS, WhatsApp, or a social media message claiming to be from UU7GAME — rather than reaching out yourself, treat that as reason for extra caution regardless of channel. Legitimate platforms generally respond to support requests you initiate; they don't typically cold-message users about account issues, bonus offers, or \"verification\" requirements. If you're ever unsure whether a message is genuine, close it and reach out through the app's own support channel directly instead of replying to the message itself.",
    ),
    h2("Why This Matters More for Real-Money Platforms"),
    mixedPara([
      "A fake clone of a content-only website is mostly just annoying. A fake clone of a real-money gaming platform is a direct financial risk — every deposit made through it goes to whoever built the clone, not to any real account, and every credential entered can be reused elsewhere. This is exactly the same category of risk our ",
      link("Login Guide", "/app-tutorials/uu7game-login-guide"),
      " and ",
      link("Deposit and Withdrawal Guide", "/app-tutorials/uu7game-deposit-and-withdrawal-guide"),
      " both touch on from different angles — this page is the single place that pulls the verification habit itself together, rather than a footnote in guides about something else.",
    ]),
    h2("Quick Verification Checklist"),
    p("Before entering any login details or making a deposit, confirm all of the following:"),
    bulletList([
      bulletItem(["The domain matches the official site exactly, with no extra characters, misspellings, or unfamiliar subdomains."]),
      bulletItem(["The connection shows a valid HTTPS padlock."]),
      bulletItem(["You reached the site by typing the address or a bookmark yourself, not by clicking a link from a message, ad, or unfamiliar search result."]),
      bulletItem(["Bonus offers look consistent with what's described in our own coverage, not dramatically more generous."]),
      bulletItem(["No one is asking for your password, OTP, or full card/bank details before you've even logged in."]),
      bulletItem(["The support channels match what's documented — 24/7 live chat, Telegram, and email — rather than a single unfamiliar contact method."]),
      bulletItem(["If it's the app rather than the browser, the permissions requested match what a gaming app actually needs, with nothing unrelated bundled in."]),
    ]),
    p(
      "None of these checks take more than a minute individually, and running through all of them together before your first login or deposit on any device is a genuinely small time cost against the risk they cover. It's worth repeating this checklist any time you set up UU7GAME on a new device, too, rather than assuming a habit built on one phone automatically carries over to a new one.",
    ),
    h2("What to Do If You Find a Fake Site"),
    p(
      "Don't enter any information — close the tab immediately rather than \"just checking\" what it asks for. If you already entered a password or OTP on a suspected fake site, change that password immediately (and anywhere else you reused it), since credential reuse across sites is exactly what makes phishing profitable beyond a single account. Report the fake site or app listing where you found it if the platform allows it, since that helps get it taken down before the next person lands on it.",
    ),
    p(
      "If you entered payment details specifically — a UPI ID, PIN, or bank details — treat this more seriously than a password reset alone: contact your bank directly, watch your account for unfamiliar transactions over the following days, and consider whether that UPI ID or account needs to be reissued rather than just monitored. Acting within the first few hours matters considerably more than acting a week later, since most fraudulent use of stolen payment details happens quickly.",
    ),
    p(
      "It's also worth telling other players if you found the fake site through a group chat, forum, or social media post — the same link that reached you has likely reached others, and a quick warning in the same place can stop several more people from making the same mistake before the listing or ad actually gets taken down.",
    ),
    h2("Verifying Through Independent Sources"),
    mixedPara([
      "Beyond checking the domain itself, cross-referencing what you're seeing against independent coverage is a useful second layer of verification. Our own ",
      link("UU7GAME Review 2026", "/app-tutorials/uu7game-review-2026-is-it-legit"),
      " describes the platform's actual game catalog, bonus structure, and support channels in detail — if a site claiming to be UU7GAME looks meaningfully different from what's described there (a completely different set of games, an unfamiliar bonus structure, or support channels that don't match), that mismatch is worth treating as a warning sign rather than assuming the platform simply changed recently.",
    ]),
    h2("A Note on Search Engine Results"),
    p(
      "Search engines do attempt to filter out known phishing and clone sites, but this isn't foolproof, especially for a newly registered fake domain that hasn't been reported yet. Appearing in search results, even near the top, is not on its own proof of legitimacy — it just means the domain hasn't been flagged as malicious yet, which is a lower bar than actually being the real site. The domain-matching and HTTPS checks earlier in this guide remain necessary even when a link comes from a search engine rather than a message or ad.",
    ),
    p(
      "Paid search ads deserve particular caution here — an ad slot is bought, not earned through the same trust signals as an organic ranking, and ad review processes don't always catch a well-disguised clone landing page before it goes live. Preferring a genuine organic result or, better, a saved bookmark, over clicking a sponsored ad result is a small habit that meaningfully reduces this specific risk.",
    ),
    mixedPara([
      "Once you're confident you're on the real site, our ",
      link("The Ultimate UU7GAME Guide", "/app-tutorials/the-ultimate-uu7game-guide"),
      " covers getting started end to end, our ",
      link("Login Guide", "/app-tutorials/uu7game-login-guide"),
      " and ",
      link("Registration Guide", "/app-tutorials/uu7game-registration-guide"),
      " cover signing in and creating an account, and our ",
      link("Responsible Gaming", "/responsible-gaming"),
      " guidelines are worth reading before you deposit anything.",
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
    heading: "Ready to Play on the Real Site?",
    description: "Skip the guesswork — go straight to UU7GAME's confirmed official website.",
    buttonText: "Visit UU7GAME",
    buttonUrl: OFFICIAL_URL,
    position: 0,
  });

  await db.insert(postQuickAnswer).values({
    postId: post.id,
    text: "UU7GAME's confirmed official site is uu7stars.com. Fake clones and phishing pages targeting real-money gaming brands are common, so always type the address yourself or use a bookmark, check for a valid HTTPS connection, and never enter your password or OTP on a site you reached through an unfamiliar link.",
  });

  await db.insert(postAiSummary).values({
    postId: post.id,
    summary:
      "UU7GAME's verified official website is uu7stars.com. Fake clone sites and phishing pages are a common risk for real-money gaming brands generally, typically using typosquatted domains, copied visual design, and urgent requests for login credentials or OTPs. Verification signals include checking the domain character by character, confirming a valid HTTPS connection, being suspicious of unusually generous bonus offers, and never entering sensitive information on a site reached via an unsolicited link. The same principle applies to the APK itself — download only from the confirmed official site, never a third-party store or shared link. Legitimate UU7GAME support runs through 24/7 live chat, Telegram, and email, and will never request a password or OTP through any channel.",
  });

  await db.insert(postKeyTakeaways).values(
    [
      "UU7GAME's confirmed official website is uu7stars.com.",
      "Fake clone and phishing sites are a common risk across real-money gaming brands, not unique to UU7GAME.",
      "Check the domain character by character — typosquatted lookalike domains are the most common clone tactic.",
      "A valid HTTPS connection is necessary but not sufficient on its own to confirm legitimacy.",
      "Never enter a password, OTP, or bank details on a site reached through an unsolicited link.",
      "Legitimate support never asks for your password or OTP, through any channel.",
    ].map((text, position) => ({ postId: post.id, text, position })),
  );

  await db.insert(postFaqs).values(
    [
      { question: "What is UU7GAME's official website?", answer: "uu7stars.com is UU7GAME's confirmed official website." },
      { question: "How do I know if a UU7GAME site is fake?", answer: "Check the domain character by character for misspellings, confirm a valid HTTPS connection, and be wary of unusually generous bonus offers or immediate requests for your password or OTP." },
      { question: "Is it safe to download the UU7GAME APK from any website?", answer: "No — download only from the confirmed official website. Third-party app stores, search-result ads, and shared links are common sources of modified, malicious APK files." },
      { question: "Will UU7GAME support ever ask for my password or OTP?", answer: "No, never, through any channel — live chat, Telegram, or email. Treat any request for either as a phishing attempt." },
      { question: "What should I do if I entered my details on a fake site?", answer: "Change that password immediately, and anywhere else you reused it, then avoid the fake site going forward." },
    ].map((f, position) => ({ postId: post.id, ...f, position })),
  );

  console.log("Created post:", post.id);
  process.exit(0);
}
main();
