# UU7.io — Website Structure & Keyword Implementation Plan

**Status:** Approved — decisions locked in §9. Implementation in progress: categories, author personas, and launch-batch content below.

**Purpose recap:** uu7.io is an independent gaming knowledge hub whose entire job is to rank for gaming/gambling-adjacent keywords, build topical authority, become AI-citable, and pass contextual authority to uu7stars.com — without ever looking like a spammy casino affiliate site. Every recommendation below is filtered through that lens: trust-first, educational-first, real-money-content clearly labeled and responsibly framed.

**Target market: India, confirmed.** This was already the working assumption throughout this plan (every keyword in the brief is India-specific: rummy/teen patti as games, INR-denominated bonuses, "India" appearing directly in a third of the keyword list) — this note makes it explicit rather than inferred, and it actually strengthens decision §9.1 rather than changing it: if the *entire site* targets one market, a separate "X India" page next to "X" has even less reason to exist, since there's no second audience to differentiate for. Concrete things this confirmation unlocks:

- **Done now:** added `areaServed: India` to the sitewide Organization JSON-LD (`lib/seo/jsonld.ts`, wired in `app/layout.tsx`) — a minor entity-clarity signal, mainly useful for AI/GEO understanding of who the site is for. Verified rendering on the live homepage. Note this is **not** a proven Google ranking factor by itself — see below.
- **Correction — no Search Console action needed:** Search Console's old country-targeting setting is **deprecated**, confirmed directly against Google's current documentation: *"the ability to target search results to specific countries using Search Console country targeting was determined to have little value for the ecosystem, and is no longer supported."* There is no account-level "target India" toggle anymore, and hreflang (Google's suggested replacement) doesn't apply here either — it's for disambiguating multiple language/region *versions of the same page*, and this site has none. Geographic relevance for a single-market, single-language site like this one is established **entirely through content itself** (India-specific games, ₹, state-level regulation content) — which the plan was already doing from day one. The two real remaining levers are the content itself (already right) and backlinks from India-relevant sites (a months-long outcome of the authority-building work, not a setting).
- **Assumed, flag if wrong:** English-only content. The entire keyword brief is English (no Hindi/transliterated terms), so that's what's been built against. A Hindi (or Hinglish) content track is a real scope decision — bilingual content roughly doubles the production plan — so say so explicitly if that's wanted rather than it being assumed later.
- **New content unlocked, not a doorway page:** "Is Real-Money Gaming Legal in [State]?" — a genuine state-by-state legal-status guide belongs in Statistics & Reports (added to §4.8 below). This is exactly the kind of region-specific content §9.1 said would justify a dedicated page — one comprehensive page with a Stats Table of states, not a page-per-state clone.

---

## 1. Current Build Status vs. Required Pages

Grounding this plan in what's actually live today (checked directly against the CMS, not assumed):

| Required Page | Status | Notes |
|---|---|---|
| Homepage | **Partially built** | Has hero + search bar + "Latest posts" only. Missing: Featured Guides, Trending Articles, Popular Games, FAQs sections. See §8. |
| About | ✅ Built | Reads from the Pages CMS (`slug: about`); currently showing placeholder copy — needs real content. |
| Contact | ✅ Built (page shell only) | No functional contact form yet — out of scope for this content plan. |
| Responsible Gaming | ✅ Built | Placeholder copy — needs real content (see §6, this page is load-bearing for compliance/trust). |
| Editorial Policy | ✅ Built | Placeholder copy — needs real content. |
| Author Pages | ✅ Built | `/authors` directory + `/authors/[slug]` profile, bio, expertise tags, article list, Person schema. |
| Category Pages | **Infra built, taxonomy incomplete** | Only one category exists in the DB today: `Betting Guides`. The other four required categories (Game Guides, Bonuses, App Tutorials, Statistics & Reports) don't exist yet — see §5 for exact rows to create. |

Only one real post exists in the database right now (unrelated test content from earlier development) — content production is starting from zero.

---

## 2. Information Architecture

```
/                           Homepage
/about                      About
/contact                    Contact
/responsible-gaming         Responsible Gaming
/editorial-policy           Editorial Policy
/authors                    Author directory
/authors/[slug]             Author profile

/game-guides                Category: Game Guides
/game-guides/[slug]         Rummy, Teen Patti, Slots, Aviator, Live Casino guides

/betting-guides             Category: Betting Guides
/betting-guides/[slug]      Real-money/wagering-angle, comparisons, "best app" content

/bonuses                    Category: Bonuses
/bonuses/[slug]             Welcome/reload/VIP/referral bonus content

/app-tutorials              Category: App Tutorials
/app-tutorials/[slug]       UU7GAME brand how-tos: login, register, APK, deposit, withdraw

/statistics-reports         Category: Statistics & Reports
/statistics-reports/[slug]  Data-driven content: payout times, RTP tables, comparison reports
```

### The Game Guides vs. Betting Guides split (a rule to apply consistently)

These two categories are the ones most likely to blur together, so fix the rule now:

- **Game Guides** = evergreen, educational — rules, how-to-play, strategy, variations. No real-money angle required. This is the topical-authority backbone.
- **Betting Guides** = real-money/wagering angle — "play for real money," "best app for X," comparisons, where-to-play. This is where the primary CTA to uu7stars.com belongs most naturally.

A single game (e.g. Aviator) legitimately has content in both: "Aviator Game Guide: Rules & Mechanics" (Game Guides) and "Aviator Betting Strategy & Risk Management" (Betting Guides) are different search intents and shouldn't be merged or duplicated.

---

## 3. Content Cluster (Pillar → Spoke) Architecture

Flat category pages aren't enough for topical authority — each vertical needs one comprehensive **pillar** page that every related **spoke** post links back to (and the pillar links out to all of them). This is the single highest-leverage SEO/AEO structural decision in this plan: it's what turns "a pile of gaming articles" into a search engine's and an AI model's confident read of "this site is authoritative on gaming."

This also maps directly onto tooling already built in the CMS: the **Internal Linking Assistant** (live suggestions while writing) and **Related Posts** (auto-scored fallback) should be used to wire every spoke → pillar and spoke → sibling-spoke link as content goes in, not left to chance.

| Cluster | Pillar Post | Category |
|---|---|---|
| A. UU7GAME Brand & Trust | The Ultimate UU7GAME Guide | App Tutorials |
| B. Bonuses & Promotions | UU7GAME Bonus Guide | Bonuses |
| C. Rummy | Online Rummy Guide | Game Guides |
| D. Teen Patti | Teen Patti Guide | Game Guides |
| E. Slots | Online Slots Guide | Game Guides |
| F. Aviator | Aviator Game Guide | Game Guides |
| G. Live Casino | Live Casino Guide | Game Guides |
| H. Statistics & Reports | (no single pillar — cross-cutting data content, see §4.8) | Statistics & Reports |

---

## 4. Full Keyword Mapping

Every keyword from the brief is placed below under the post it targets. **Near-duplicate keyword variants are deliberately consolidated into one post rather than split into separate thin pages** — e.g. "teen patti rules," "teen patti variations," "teen patti joker," "teen patti muflis," "teen patti ak47" all become H2 sections inside *one* comprehensive post, not five posts competing with each other for the same intent (keyword cannibalization — see §6.3). If a genuinely separate page is warranted for one of these later, split it out once the consolidated post is ranking and you can see which section gets the most search demand.

### 4.1 Cluster A — UU7GAME Brand & Trust Hub (`/app-tutorials`)

| Post | Primary keyword | Secondary / consolidated keywords | Intent |
|---|---|---|---|
| **Pillar:** The Ultimate UU7GAME Guide | uu7game | uu7game official site, uu7game official website | Navigational |
| UU7GAME APK Download Guide | uu7game apk download | uu7game apk, uu7game app download, uu7game mobile app, uu7game latest apk, uu7game download, uu7game download guide, uu7game apk installation guide | Navigational/Transactional |
| UU7GAME Login Guide | uu7game login | uu7game login guide, uu7game login india | Navigational |
| UU7GAME Registration Guide | uu7game register | uu7game registration guide | Navigational |
| UU7GAME Review 2026: Is It Legit? | uu7game review 2026 | is uu7game legit, is uu7game safe, uu7game trusted, uu7game review, uu7game review india, uu7game pros and cons, uu7game trustworthiness, uu7game customer reviews | Commercial investigation |
| UU7GAME vs. Other Gaming Apps | uu7game vs other gaming apps | best real money gaming apps, real money gaming app comparison, how to choose a gaming app, gaming apps with instant withdrawal, which gaming app pays fastest | Commercial investigation |
| UU7GAME Deposit Guide | how to deposit on uu7game | uu7game payment methods, uu7game minimum deposit, minimum deposit casino | Transactional |
| UU7GAME Withdrawal Guide | how to withdraw from uu7game | uu7game withdrawal time, uu7game withdrawal limits, uu7game minimum withdrawal, instant withdrawal casino, fast payout casino app | Transactional |
| UU7GAME Security & Safety Guide | uu7game security features | secure gaming platform, real money gaming app (safety angle) | Trust/Informational |
| UU7GAME Customer Support Guide | uu7game customer support | — | Informational |
| UU7GAME VIP Program | uu7game vip | uu7game vip program | Commercial |
| UU7GAME Games Overview | uu7game games | uu7game casino, uu7game slots, uu7game live casino, uu7game aviator, uu7game rummy, uu7game teen patti, best games on uu7game, how to win on uu7game | Navigational/Informational — links out to every game-vertical pillar |

> **Open decision:** `uu7game india` and the India-suffixed brand variants (`uu7game apk india`, `uu7game bonus india`, etc.) are folded into the relevant guide above as a subheading + FAQ entry rather than given standalone pages, to avoid near-duplicate content. If you specifically want India-targeted landing pages (e.g. for local search or a regional campaign), flag it and I'll design those as a separate, deliberately-differentiated tier rather than thin geo-clones.

### 4.2 Cluster B — Bonuses & Promotions (`/bonuses`)

| Post | Primary keyword | Secondary / consolidated keywords |
|---|---|---|
| **Pillar:** UU7GAME Bonus Guide | uu7game bonus | uu7game promotions | 
| UU7GAME Welcome Bonus Guide | uu7game welcome bonus guide | welcome bonus casino, casino welcome bonus, deposit bonus casino |
| UU7GAME Daily & Reload Bonus Guide | uu7game daily bonus guide | daily reload bonus |
| UU7GAME Promotions Explained | uu7game promotions explained | — |
| UU7GAME Bonus Terms & Conditions Explained | uu7game bonus terms | — |
| UU7GAME Referral Program Guide | uu7game referral program | uu7game referral rewards |
| UU7GAME Bonus Comparison | uu7game bonus comparison | uu7game bonus india |
| Cash Reward & Tournament Bonuses | cash rewards gaming app | cash tournament rummy *(cross-link to Rummy cluster)* |

### 4.3 Cluster C — Rummy (`/game-guides`)

| Post | Primary keyword | Secondary / consolidated keywords |
|---|---|---|
| **Pillar:** Online Rummy Guide | online rummy | rummy cash game, real money rummy, play rummy for real money, online rummy cash game, real cash rummy, online rummy india |
| Indian Rummy Rules Explained | rummy rules | indian rummy, indian rummy guide, 13 card rummy |
| Points Rummy vs. Pool Rummy vs. Deals Rummy | points rummy | deals rummy, pool rummy, rummy pool |
| Rummy Strategy & Winning Tips | rummy strategy | rummy tips, best rummy tips, common rummy mistakes |
| Best Rummy Apps Compared | best rummy app | best rummy app india, best online rummy app |
| Rummy Tournaments Guide | rummy tournaments | cash tournament rummy |

### 4.4 Cluster D — Teen Patti (`/game-guides`)

| Post | Primary keyword | Secondary / consolidated keywords |
|---|---|---|
| **Pillar:** Teen Patti Guide | teen patti online | teen patti india, teen patti real money, play teen patti for real money, teen patti with friends, online card games india, real money card games |
| Teen Patti Rules & Sequence List | teen patti rules | teen patti sequence list, classic teen patti |
| Teen Patti Variations Explained | teen patti variations | teen patti joker, teen patti muflis, teen patti ak47, teen patti 999 |
| Teen Patti Strategy for Beginners | teen patti strategy | teen patti beginner guide, teen patti tips |
| Teen Patti Jackpot & High Stakes | teen patti jackpot | high stakes teen patti |
| Best Teen Patti App Compared | best teen patti app | best teen patti app india |

> "Live teen patti" is deliberately handled in the Live Casino cluster (§4.7) rather than here, since it's a live-dealer-format question, not a rules/variation question.

### 4.5 Cluster E — Slots (`/game-guides`)

| Post | Primary keyword | Secondary / consolidated keywords |
|---|---|---|
| **Pillar:** Online Slots Guide | online slots | slot games, slots real money, online slots india, slots india, free slots, video slots, fruit slots, mobile slot games |
| Slot RTP & Volatility Guide | high rtp slots | slot rtp guide, slot volatility guide *(strong Statistics & Reports crosslink — see §4.8)* |
| Jackpot & Progressive Slots Guide | jackpot slots | progressive jackpots, slot jackpots |
| Slot Bonuses & Tournaments | slot bonuses | slot bonus guide, slot tournaments |
| Best Slot Games & Strategies | best slot games | slot strategies, free vs real money slots |
| Best Slots App Compared | best slots app india | — |

### 4.6 Cluster F — Aviator (`/game-guides`, one spoke in `/betting-guides`)

| Post | Primary keyword | Secondary / consolidated keywords | Category |
|---|---|---|---|
| **Pillar:** Aviator Game Guide | aviator game | aviator online, aviator india | Game Guides |
| Aviator Strategy & Tips | aviator strategy | aviator tips, aviator betting tips, aviator beginner guide | Game Guides |
| Aviator Multiplier & Crash Mechanics Explained | aviator multiplier | aviator crash game, aviator crash game explained | Game Guides |
| Aviator Predictor Tools: Myths vs. Facts | aviator predictor | aviator myths vs facts | Game Guides |
| Aviator Betting & Risk Management | aviator betting | aviator betting app, aviator risk management | **Betting Guides** |
| Best Aviator App Compared | best aviator app | — | Betting Guides |

> The "Predictor" post is worth calling out specifically: third-party "Aviator predictor" tools are near-universally scams or non-functional. Writing an honest, skeptical debunking piece here is a genuine E-E-A-T and trust win (it's the opposite of what a spammy affiliate site would publish) and it's exactly the kind of content AI answer engines favor when asked "does X actually work."

### 4.7 Cluster G — Live Casino (`/game-guides`)

| Post | Primary keyword | Secondary / consolidated keywords |
|---|---|---|
| **Pillar:** Live Casino Guide | live casino | live casino real money, live dealer casino, online casino india, casino table games, best live casino app, live teen patti |
| Live Roulette Guide | live roulette | — |
| Live Blackjack Guide | live blackjack | — |
| Live Baccarat Guide | live baccarat | — |
| Live Poker Guide | live poker | — |
| Live Dealer Games Explained | live dealer games explained | casino etiquette |

### 4.8 Statistics & Reports (`/statistics-reports`) — cross-cutting data content

This category doesn't get its own pillar-and-spokes tree; it's a home for data-forward content that other clusters link *into* for credibility. Every post here should lean hard on the **Stats Table** block (real `<table>` markup, not screenshots) — this is exactly the content type both featured snippets and AI answer engines prefer to cite, because the data is structured and directly comparable.

| Post | Primary keyword | Secondary / consolidated keywords |
|---|---|---|
| UU7GAME Payout Review & Withdrawal Time Data | uu7game payout review | uu7game payout proof, which gaming app pays fastest, gaming apps with instant withdrawal |
| Casino Bonus Comparison Report | casino bonus guide | uu7game bonus comparison (data-table version, crosslinked from §4.2) |
| Slot RTP Comparison Report | high rtp slots (data angle) | crosslinked from §4.5 |
| Best Real Money Gaming Apps: Comparison Report 2026 | real money gaming app | online gaming app india, best casino app for beginners |
| Is Real-Money Gaming Legal in Your State? (India) | is real money gaming legal in india | is rummy legal in [state], real money gaming india, online rummy india, teen patti india |

> Added following explicit India-market confirmation — a genuine state-by-state legal-status guide with a Stats Table of states, not a page-per-state clone. Links from the Responsible Gaming page and from every real-money-adjacent post's compliance callout (§6.6).

### 4.9 Keyword coverage check

Every keyword group from the brief maps into the tables above: Brand, High-Intent Transactional, Game-Specific, AI Overview/GEO Long-Tails, Agentic/Research-Focused, Location/GEO-Targeted, and Content Cluster Keywords. The AI Overview/GEO long-tail questions (`is uu7game legit`, `how to deposit on uu7game`, `uu7game bonus terms explained`, etc.) aren't given separate posts — they become **FAQ entries** on the relevant guide above, which is the correct treatment for question-phrased long-tails (see §6.4).

---

## 5. Category Setup (exact rows to create)

Only `Betting Guides` exists today. Create the remaining four through `/admin/categories`:

| Name | Slug | Description (for the archive page) |
|---|---|---|
| Game Guides | `game-guides` | Rules, strategy, and how-to-play guides for rummy, teen patti, slots, aviator, and live casino games. |
| Betting Guides | `betting-guides` | *(exists)* Real-money wagering guides, app comparisons, and where-to-play recommendations. |
| Bonuses | `bonuses` | Welcome bonuses, reload offers, VIP programs, and promotion breakdowns. |
| App Tutorials | `app-tutorials` | Step-by-step UU7GAME how-tos: download, login, registration, deposits, and withdrawals. |
| Statistics & Reports | `statistics-reports` | Data-driven comparisons — payout times, RTP tables, and bonus comparison reports. |

---

## 6. Modern SEO, AEO & GEO Best Practices for This Build

This is the "how to actually use these keywords" layer, written against the CMS modules already built — every tactic below maps to a real, existing tool in the editor, not a hypothetical.

### 6.1 Keyword placement discipline

- **Primary keyword**: title, H1, URL slug, first ~100 words, meta description. Exactly once each — don't repeat it in every H2.
- **Secondary keywords**: distributed across H2s, naturally, as the section headings themselves (this plan's "secondary" column above is literally H2-shaped for a reason).
- **No exact-match stuffing.** Google's ranking systems are semantic/NLP-based now, not string-matching. Write the secondary/consolidated keywords as natural language variants, not the literal search-query string repeated.

### 6.2 Match content structure to intent

| Intent | Example keywords | Content shape |
|---|---|---|
| Navigational | uu7game login, uu7game apk download | Short, direct, step-by-step. Quick Answer block front-loads the exact action. |
| Informational | rummy rules, aviator multiplier | Long-form educational, heading hierarchy carries the structure, FAQ section for PAA capture. |
| Commercial investigation | uu7game review 2026, best rummy app | Comparison framing, Stats Table for objective criteria, honest pros/cons — never a fake "5-star everything" review. |
| Transactional | play rummy for real money, real money casino games | Clear CTA block to uu7stars.com, but only after the content has actually answered the query — never CTA-first. |

### 6.3 Consolidate before you cannibalize

Every cluster table in §4 already applies this, but as a standing rule for anything added later: if two candidate keywords would produce two pages answering essentially the same question for the same reader, they're one page with two H2s, not two pages. Two thin pages targeting the same intent split your own ranking signal and confuse which URL Google should show — a single strong page wins both queries.

### 6.4 AEO tactics (featured snippets / Google's AI Overviews)

- **Quick Answer Block** (already built, 40-60 words): every guide should open with a direct answer to its primary keyword's implicit question, phrased to be liftable as a snippet verbatim.
- **FAQ Builder** (already built, feeds `FAQPage` schema): this is where the entire "AI Overview / GEO-Optimized Long-Tails" keyword list from the brief belongs — they're already phrased as questions (`is uu7game legit`, `how to withdraw from uu7game`, `uu7game bonus terms`). Use them as literal FAQ questions, not paraphrased.
- **Heading hierarchy validator** (already enforced at publish): a clean H1→H2→H3 structure isn't just good UX, it's how Google and LLMs parse a page's topic map. The hard publish gate already blocks skipped heading levels — don't fight it by nesting content flat.

### 6.5 GEO tactics (AI-citability — ChatGPT, Perplexity, Claude, Google AI Overviews)

- **AI Summary Block** (already built, `data-ai-extract` hooks): write this denser and more factual than the main prose — it exists specifically to be the block an AI crawler lifts wholesale. Lead with the fact, not the framing.
- **Stats Tables** (already built, real `<table>` markup): use these anywhere a number is comparable — RTP %, withdrawal times, bonus percentages, minimum deposits. Structured data is dramatically easier for an LLM to extract and cite correctly than prose burying the same number in a sentence.
- **Source Citations** (already built, auto-`nofollow`ed): cite external sources for any factual claim that isn't first-party (regulatory info, RTP disclosures, etc.). AI engines weight citation presence as a trust signal, and it's honest practice regardless.
- **Author & Trust module**: every post should have a real author with expertise tags filled in. E-E-A-T (Experience, Expertise, Authoritativeness, Trust) is explicitly part of how both Google and AI systems assess YMYL-adjacent content — gaming/gambling content qualifies.

### 6.6 E-E-A-T and responsible-gaming compliance layer

This is gambling-adjacent content, which puts it in Google's YMYL (Your Money or Your Life) territory whether or not the site itself processes money. Two concrete rules:

1. **Every real-money-adjacent post** (Betting Guides, Bonuses, and any Game Guide with a "play for real money" angle) should link to the Responsible Gaming page — a short, consistent disclaimer block, not just a footer link.
2. **Editorial Policy and author bios need real content**, not placeholders, before this content ships at volume — they're direct trust/E-E-A-T signals and they're currently placeholder copy (see §1).

### 6.7 Internal linking & anchor text variation

- Every spoke links to its pillar; every pillar links to all its spokes. Use the **Internal Linking Assistant** while writing, not as an afterthought pass.
- **CTA Block** to uu7stars.com: vary the anchor text and framing across posts. A backlink profile where every single page links out with identical anchor text reads as manipulative to both Google's spam systems and to a careful reader — the opposite of the trust-first positioning this whole site is for.
- Informational/rules content can be lighter on CTAs (or omit them); transactional/comparison content is where the CTA belongs most naturally.

### 6.8 Freshness

`publishedAt`/`updatedAt` are already wired into JSON-LD and now correctly trigger cache invalidation on edit. For content whose facts actually change — bonus terms, payout data, "2026" review dates — put these on a real review cadence (quarterly, at minimum) and treat an update as a genuine content refresh, not a timestamp bump.

---

## 7. Phased Publishing Roadmap

Roughly 45 posts across 8 clusters is too much to launch simultaneously and too much to sequence arbitrarily. Suggested waves:

1. **Wave 1 — Foundation & highest-intent** (ship first): UU7GAME Brand pillar + Review/Legitimacy post, UU7GAME Login/Registration/APK guides, UU7GAME Deposit/Withdrawal guides. These most directly support conversions to uu7stars.com and establish the brand-trust cluster the rest of the site leans on.
2. **Wave 2 — One pillar per game vertical**: Online Rummy Guide, Teen Patti Guide, Online Slots Guide, Aviator Game Guide, Live Casino Guide. This gets every cluster's anchor page live so spokes have somewhere to link back to.
3. **Wave 3 — Bonuses cluster + spoke fill-out**: complete the Bonuses category, then fill in remaining spokes across Rummy/Teen Patti/Slots/Aviator/Live Casino.
4. **Wave 4 — Statistics & Reports + long-tail AEO/GEO cleanup**: data-comparison content, plus any FAQ gaps identified once Waves 1-3 are live and you can see actual "People Also Ask" data from Search Console.

---

## 8. Homepage Build Requirements (engineering follow-up, not content work)

The brief's homepage spec needs some CMS additions beyond what exists. Recommended approach for each, favoring the codebase's existing pattern of simple/hardcoded solutions over new abstractions until there's real pressure to change them:

| Section | Recommended approach | New schema? |
|---|---|---|
| **Featured Guides** | Hardcode a curated array of pillar-post slugs (the 6 pillars from §3) directly in the homepage component — same pattern already used for `CANONICAL_PAGE_SLUGS` in `sitemap.ts`. | No |
| **Popular Games** | Link directly to the 5 game-vertical pillar pages (Rummy, Teen Patti, Slots, Aviator, Live Casino) — no separate "games" taxonomy needed. | No |
| **Trending Articles** | **Defer.** A real "trending" signal needs actual pageview data, which means Phase 7 Analytics (currently paused). Shipping a fake/heuristic "trending" label undermines the trust-first design goal. Revisit once analytics is live. | No (for now) |
| **FAQs** | A homepage-level FAQ pulling from the featured pillar posts' existing FAQ entries (reuses `post_faqs`, no new table) — general brand-trust questions like "What is UU7?", "Is this content sponsored?" | No |

None of this is built yet — flagging it here so it's an explicit, sized follow-up rather than a surprise gap discovered later.

---

## 9. Decisions (locked)

1. **No dedicated India-geo landing pages.** Nearly all of this content is already implicitly India-focused (Rummy/Teen Patti, INR bonuses), so a separate "X India" page next to "X" would be a near-duplicate with no unique content — the doorway-page pattern Google's spam policies target. "India" is worked into titles/FAQs naturally where honest to do so. Revisit only if genuinely unique region-specific content emerges (e.g. state-by-state real-money gaming legality).
2. **Revised publishing order** (supersedes the original §7 sequencing — a brand-new domain publishing *only* brand/login/APK content for its first weeks reads as a thin affiliate funnel to spam classifiers):
   - **Launch batch** (this implementation pass): UU7GAME Review 2026, Login Guide, APK Download Guide, Registration Guide — plus the **Online Rummy Guide** pillar, published alongside them for topical breadth from day one.
   - **Next**: remaining brand guides (deposit/withdrawal/security) + Teen Patti and Aviator pillars.
   - **Then**: Bonuses cluster + spoke fill-out across all pillars.
   - **Last**: Statistics & Reports + long-tail AEO/GEO cleanup once there's real Search Console "People Also Ask" data to inform it.
3. **Two author personas, split by expertise area**, honest bios with no fabricated credentials (see §10 for the actual bios): one Game Strategy persona (Rummy/Teen Patti/Slots/Aviator/Live Casino guides), one Reviews & Trust persona (brand reviews, bonuses, payments/security content). These are placeholder editorial personas — rename to real staff whenever you have them; the bios were deliberately written without specific unverifiable claims so swapping the name/photo later doesn't require rewriting the bio.

---

## 10. Launch Batch — Full Content

See the CMS for live status; full text of every launch-batch page is included below for review. **Important scope note on the four UU7GAME brand-specific posts** (Review, Login, APK Download, Registration): I don't have verified access to the actual uu7game platform, so I have not invented specific operational facts — exact deposit/withdrawal figures, the app's actual login/registration screen steps, its actual APK source URL, or a factual legitimacy verdict. Inventing those would be publishing false information about a real money-handling product, which is a real-harm risk (wrong instructions or a fabricated "yes it's legit" claim could cost a reader money or trust). Each of those four posts is a complete, publish-ready draft — structure, SEO/AEO/GEO treatment, FAQ, responsible-gaming framing — with explicit `[VERIFY: ...]` markers at the handful of spots that need a real fact from you before it goes live. The Online Rummy Guide and the three static pages (About/Editorial Policy/Responsible Gaming) needed no such placeholders — they're either generic game-rules content or content about this site's own policies — so those are published in full as-is.

### 10.1 About UU7 — `/about` (published)

> Most gaming content online falls into one of two camps: marketing dressed up as advice, or forum-grade guesswork with no editorial process behind it. UU7 is our attempt at a third option — genuinely useful, accurate, and honestly written content about card games, slots, live casino formats, and the apps people use to play them.
>
> We're not neutral about the fact that gaming should be fun and never a source of financial harm. Everything we publish is written with that as a starting assumption, not an afterthought.
>
> **Our Mission** — *(as above)*
>
> **Educational Purpose**
>
> Our content exists to teach, not just to rank. A guide to Teen Patti variations should leave you actually understanding the variations — not just having skimmed a page optimized for a search engine. Where a topic touches real money (bonuses, deposits, withdrawals, app reviews), we aim to explain how things actually work so you can evaluate a platform on its own terms, rather than take our word for it.
>
> **Our Editorial Methodology**
> - Rules and mechanics are checked against how a game actually plays, not copied from other websites.
> - Claims about a specific platform (bonus terms, deposit and withdrawal processes, security features) are checked against that platform's own published terms and official app before publication. Where we haven't been able to verify a detail, we say so rather than guess.
> - Content is dated and reviewed periodically. Bonus terms, payout processes, and app details change — we update pages rather than leave stale information live.
> - We disclose commercial relationships. Where a page includes a link to a gaming platform we have a relationship with, that's disclosed rather than hidden.
> - Responsible gaming isn't a footer link. Any page discussing real-money play links to our Responsible Gaming page, and none of our content treats gaming as a way to make money.
>
> Read more about how we research and fact-check specific pieces on our Editorial Policy page.

### 10.2 Editorial Policy — `/editorial-policy` (published)

> This page explains how UU7's content gets made — the research process, the review workflow, and how we validate what we publish. We think you should be able to check our work, so here's how it happens.
>
> **Research Process** — Every guide starts from the game or platform itself, not from other articles about it. For game-rules content, that means working from the actual rules of play and standard scoring and format conventions. For platform-specific content, that means checking the platform's own terms, app screens, and published policies directly.
>
> **Review Workflow**
> - A draft is written against a specific target: a keyword, a search intent, and a clear answer to the question a reader actually has.
> - Before publishing, we check the piece against our own heading-structure and content-completeness standards — enforced by our publishing tooling, not just a manual checklist.
> - Any claim about a specific gaming platform is flagged and checked against that platform's current terms before the piece goes live.
> - Published pages carry a visible publish date and last-updated date.
>
> **Source Validation**
> - Primary sources first — a platform's own terms outrank any third-party description of them.
> - External sources are cited, not just linked.
> - We correct mistakes rather than leave stale pages live.
>
> **Commercial Relationships** — UU7 has a relationship with uu7stars.com, and some of our content links there. Where that's the case, it's a clearly marked call-to-action, not a disguised link inside body text — and it never determines whether a review is positive.

### 10.3 Responsible Gaming — `/responsible-gaming` (published)

> Gaming should stay fun. This page covers the basics of playing safely, who shouldn't play at all, and how to recognize when gaming has stopped being a form of entertainment.
>
> **Safe Play Guidelines**
> - Set a budget before you start, and stop when you reach it, regardless of whether you're up or down.
> - Set a time limit too.
> - Never chase losses.
> - Treat it as entertainment spending, not income.
> - Don't play under the influence of alcohol or when stressed, upset, or trying to escape a bad day.
>
> **Age Restrictions** — Real-money gaming is restricted to adults who meet the minimum legal age for online gaming in their jurisdiction — 18 and older in India, with some states restricting or prohibiting real-money gaming entirely regardless of age.
>
> **Recognizing Risk** — spending more money or time than planned, regularly; borrowing money to play; hiding how much you play from people close to you; feeling anxious or preoccupied when not playing; difficulty cutting back despite trying.
>
> **Getting Help** — talking to a trusted friend or family member, a counselor, or a licensed problem-gambling support service in your region helps. Reaching out isn't a sign of failure.

### 10.4 Online Rummy Guide — `/game-guides/online-rummy-guide` (published)

**Quick Answer:** Online rummy is a card game played on a website or app, most commonly 13-card (Indian) rummy: form valid sequences and sets — including one pure sequence — before your opponents do. It can be played free, for real-money cash stakes, or in tournaments.

**AI Summary:** Online rummy moves the traditional 13-card game onto a website or app in three formats: free tables, real-money cash games, and tournaments. A valid hand needs at least two sequences, one of them pure (no joker), with the rest forming valid sequences or sets. The three most common real-money formats — Points, Pool, and Deals Rummy — differ mainly in session length and how scoring carries between hands.

**Key Takeaways:**
- A valid rummy hand needs at least one pure sequence — a hand with no pure sequence cannot be declared, no matter how good the rest of it looks.
- Points Rummy settles each hand immediately; Pool Rummy carries a running score across hands until a points limit eliminates you; Deals Rummy fixes the number of hands upfront.
- Tracking opponents' discards is as important as managing your own hand.
- Rummy's legal status for real-money play varies by state in India — check local rules before playing for stakes.

**Body:**

> Rummy is one of the most widely played card games in India, and "online rummy" now covers everything from free practice tables to real-money cash games and tournaments. This guide covers how the game works, the main formats you'll encounter, basic strategy, and what actually matters when you're comparing where to play.
>
> **What Is Online Rummy?** Rummy is a card game built around forming valid sequences and sets from a hand of cards, faster than your opponents. Online rummy simply moves that same game onto a website or app, usually with three formats on offer: free practice tables, cash games, and tournaments. The core skill is identical whether you're playing with a physical deck or on a screen — what changes online is speed, format variety, and access to cash games or tournaments.
>
> **Rummy Rules: The Basics.** The most common online format is 13-card rummy (Indian Rummy): 13 cards per player, arranged into valid sequences and sets. A sequence is three or more consecutive same-suit cards; a pure sequence uses no joker (at least one is mandatory); a set is three or four same-rank cards across suits. A valid hand needs at least two sequences, one pure. Play proceeds by drawing from the closed deck or discard pile, then discarding, until someone declares a valid hand.
>
> **Points Rummy vs. Pool Rummy vs. Deals Rummy.** Points Rummy is a single hand settled immediately at a fixed rupee-per-point rate — best for short sessions. Pool Rummy strings multiple hands together, eliminating players at 101 or 201 points — rewards consistency over a longer session. Deals Rummy fixes the number of hands upfront, highest chip count wins — the most predictable session length.
>
> **Rummy Strategy: Where to Actually Focus.** Prioritize the pure sequence first; track opponents' discards, not just your own hand; hold high-value cards cautiously; use jokers deliberately rather than on sequences you could complete naturally; know when to first-drop a genuinely bad hand.
>
> **Playing Rummy for Real Money.** Points Rummy assigns a fixed rupee value per point; Pool and Deals formats typically use a fixed entry fee with a defined prize structure for tournaments. Format choice is itself a strategic decision — decide your budget before you sit down, not while playing (links to Responsible Gaming).
>
> **What to Look for in a Rummy App.** Clear published rules and scoring for every format; transparent withdrawal information stated upfront; verifiable licensing for the states it serves; real customer support, not just an automated FAQ bot.

**Stats Table — "Rummy Variants at a Glance":**

| Variant | Format | Typical Length | Best For |
|---|---|---|---|
| Points Rummy | Single hand, settled immediately | A few minutes | Fast, casual sessions |
| Pool Rummy | Multiple hands, eliminated at 101/201 points | 30–60+ minutes | Longer, strategic sessions |
| Deals Rummy | Fixed number of deals | Set, predictable length | A defined session length |

**FAQ:**
- *What are the basic rules of rummy?* In 13-card rummy, each player is dealt 13 cards and must arrange them into valid sequences and sets — at least two sequences, one pure — before anyone else does.
- *What's the difference between Points, Pool, and Deals Rummy?* Points Rummy is a single hand settled immediately; Pool Rummy carries a running score across hands until a limit eliminates you; Deals Rummy fixes the number of hands upfront.
- *Is rummy a game of skill or chance?* Rummy has a genuine skill component, which is why several Indian courts have classified it as a game of skill, though real-money rules still vary by state.
- *How does real-money rummy work?* Points Rummy assigns a fixed rupee value per point; Pool and Deals formats typically use a fixed entry fee with a defined prize structure.
- *What should I check before playing rummy for real money?* Published rules and scoring, transparent withdrawal terms, a verifiable legal operating basis, and real customer support.

**CTA:** "Ready to Play Rummy?" → Visit UU7GAME (uu7stars.com)

---

### 10.5 UU7GAME Review 2026: Is It Legit? — `/app-tutorials/uu7game-review-2026` (**draft — do not publish yet**)

This post is a complete structural draft with every fact-dependent section explicitly marked `[VERIFY]`: What Is UU7GAME, Games Offered, Bonuses and Promotions, Deposits and Withdrawals, Licensing and Security, Customer Support, Pros and Cons, and Our Verdict. None of these sections currently assert a specific figure, term, or legitimacy conclusion — each contains an instruction for what to confirm and against what source (the platform's own terms/app) before it can be written as fact. The Quick Answer, AI Summary, and Key Takeaways are likewise placeholder-marked rather than pre-written, since a review's summary can't be honest before the sections it summarizes are verified. Full text is in the CMS (`/admin/posts`) for editing.

### 10.6 UU7GAME Login Guide — `/app-tutorials/uu7game-login-guide` (**draft — do not publish yet**)

Fully written except the exact login screen steps and field labels, which are marked `[VERIFY]` against the current app. Everything else — troubleshooting common login issues, OTP problems, security tips (never share your password or OTP, log out on shared devices) — is generic, genuinely useful guidance that doesn't depend on unverified platform specifics, and is ready to publish as-is once the `[VERIFY]` step is confirmed.

### 10.7 UU7GAME APK Download Guide — `/app-tutorials/uu7game-apk-download-guide` (**draft — do not publish yet**)

Fully written except the actual official APK download URL, marked `[VERIFY]` at both the intro and the step-by-step instructions — this is deliberately not linked to any URL rather than guessed, since a wrong or invented download link is a real security risk. The generic Android sideload steps, and the "how to tell a genuine APK from a modified one" security guidance, are complete and factually safe as written (standard, well-known Android security practice, not specific to this platform).

### 10.8 UU7GAME Registration Guide — `/app-tutorials/uu7game-registration-guide` (**draft — do not publish yet**)

Fully written except the exact registration screen fields/flow and whether KYC blocks initial play or only withdrawal, both marked `[VERIFY]`. The eligibility/age-requirement section and the generic explanation of why KYC exists industry-wide are complete and safe as written.

---

**Next step once this is reviewed:** work through the `[VERIFY: ...]` markers in the four brand posts (§10.5-10.8) with real product facts, then move to the next publishing wave (§9.2).

---

## 11. Daily Implementation Schedule

One deliverable per day — either one pillar, a small batch of spokes, or one engineering task. Dates start from today (2026-07-06) as Day 1; treat these as working days, not literal calendar days — skip weekends or shift the whole thing without renumbering anything, the sequence is what matters, not the exact date. One gap caught while building this schedule: the Cluster A pillar itself, **"The Ultimate UU7GAME Guide,"** was never actually written during the launch batch (only its four spokes were) — that's folded into Day 3 below.

**Day 2 is the one day that depends on you, not me** — I can't finalize the four `[VERIFY]`-marked drafts without real product facts, so that day is listed as your input, not my output. Everything else is content/engineering I execute.

### Week 1 — Close out Cluster A (App Tutorials) + Homepage engineering

| Day | Date | Deliverable |
|---|---|---|
| 1 | Jul 6 | ✅ **Done.** Homepage engineering: Featured Guides, Popular Games, and FAQs sections (§8) — `lib/home/featured-content.ts` + `components/home/*`, wired into `app/(site)/page.tsx`. Sections resolve from a hardcoded pillar-slug list and auto-populate as each pillar in this schedule gets published — verified today they correctly show only the Rummy pillar (the only one that exists) with no broken links to unpublished pillars. |
| 2 | Jul 7 | **Your input needed:** supply verified facts for the four `[VERIFY]` markers in Review 2026, Login Guide, APK Download Guide, and Registration Guide (§10.5-10.8). |
| 3 | Jul 8 | Finalize + publish the four brand drafts from Day 2, plus write the missing Cluster A pillar ("The Ultimate UU7GAME Guide") and "UU7GAME Games Overview" hub post. |
| 4 | Jul 9 | UU7GAME Deposit Guide + UU7GAME Withdrawal Guide. |
| 5 | Jul 10 | UU7GAME Security & Safety Guide + Customer Support Guide + VIP Program. |
| 6 | Jul 11 | UU7GAME vs. Other Gaming Apps — closes out Cluster A entirely. |

### Week 2 — Teen Patti + Aviator clusters

| Day | Date | Deliverable |
|---|---|---|
| 7 | Jul 13 | Teen Patti Guide (pillar). |
| 8 | Jul 14 | Teen Patti Rules & Sequence List + Teen Patti Variations Explained. |
| 9 | Jul 15 | Teen Patti Strategy for Beginners + Jackpot & High Stakes + Best App Compared — closes out Teen Patti. |
| 10 | Jul 16 | Aviator Game Guide (pillar). |
| 11 | Jul 17 | Aviator Strategy & Tips + Multiplier & Crash Mechanics Explained. |
| 12 | Jul 18 | Aviator Predictor: Myths vs. Facts + Betting & Risk Management + Best App Compared — closes out Aviator. |

### Week 3 — Slots + Live Casino clusters

| Day | Date | Deliverable |
|---|---|---|
| 13 | Jul 20 | Online Slots Guide (pillar). |
| 14 | Jul 21 | Slot RTP & Volatility Guide + Jackpot & Progressive Slots Guide. |
| 15 | Jul 22 | Slot Bonuses & Tournaments + Best Slot Games & Strategies + Best Slots App Compared — closes out Slots. |
| 16 | Jul 23 | Live Casino Guide (pillar). |
| 17 | Jul 24 | Live Roulette Guide + Live Blackjack Guide. |
| 18 | Jul 25 | Live Baccarat Guide + Live Poker Guide + Live Dealer Games Explained — closes out Live Casino. |

### Week 4 — Bonuses cluster + remaining Rummy spokes

| Day | Date | Deliverable |
|---|---|---|
| 19 | Jul 27 | UU7GAME Bonus Guide (pillar) + Welcome Bonus Guide. |
| 20 | Jul 28 | Daily & Reload Bonus Guide + Promotions Explained + Bonus Terms Explained. |
| 21 | Jul 29 | Referral Program Guide + Bonus Comparison + Cash Reward & Tournament Bonuses — closes out Bonuses. |
| 22 | Jul 30 | Indian Rummy Rules Explained + Best Rummy Apps Compared + Rummy Tournaments Guide — closes out Rummy (pillar was done in the launch batch). |

### Week 5 — Statistics & Reports + wrap-up

| Day | Date | Deliverable |
|---|---|---|
| 23 | Aug 3 | UU7GAME Payout Review & Withdrawal Time Data + Is Real-Money Gaming Legal in Your State? (India). |
| 24 | Aug 4 | Casino Bonus Comparison Report + Slot RTP Comparison Report + Best Real Money Gaming Apps Comparison Report — closes out Statistics & Reports and the full 45-post backlog from §7. |
| 25 | Aug 5 | Review day: audit internal linking across everything published (every spoke → pillar, every pillar → spokes — §6.7), check Search Console for real "People Also Ask" data if available by then, and identify any FAQ/content gaps it surfaces. |

That's the full backlog from §4 and §7 in 25 working days. If you want a faster or slower pace — more than one deliverable per day, or spread over more weeks — say so and I'll re-cut the schedule; the sequence (dependencies between pillars and their spokes) matters more than the exact day count.
