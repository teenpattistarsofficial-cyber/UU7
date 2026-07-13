# UU7.io — Development Log

A running log of work completed on this project, grouped by date. Newest entries at the top. Every work session should append a new dated section (or add to today's section if one already exists) rather than editing past entries.

---

## 2026-07-11

### First production deployment
- Deployed to the production VPS (aaPanel + Docker Compose, `/www/wwwroot/uu7.io`) for the first time, pulling the full day's accumulated work (commit `9af09a8`, "Full CMS dashboard built").
- Found and fixed a real build bug uncovered during this deploy: many admin pages (analytics, media, redirects, all Settings sub-pages, and — despite using `searchParams` — posts, pages, categories, authors, comments, users) were getting statically prerendered by `next build` instead of rendering dynamically, because `searchParams` usage alone isn't a reliable dynamic-rendering signal under this Next.js/Turbopack build. This crashed the build with `Error: DATABASE_URL is not set` (intentionally absent at build time — see the Dockerfile's own comment on this failure mode).
  - Fixed at the shared layout level (`app/(admin)/admin/(dashboard)/layout.tsx` now has `export const dynamic = "force-dynamic"`), which covers every page underneath in one place, plus explicit exports added to the remaining leaf pages and `app/not-found.tsx` for the same reason.
  - Verified with a full local `DATABASE_URL="" npx next build` before pushing — confirmed every route renders `ƒ` (dynamic) instead of failing prerender.
- Applied the day's accumulated DB migrations (`0012`–`0016`) on the production database — added `contact_channels`, `site_settings`, `openai_api_key` column, `audit_log`, `cta_clicks`, `page_views`, and `comments`/`comment_status` — after discovering the first migration attempt had silently done nothing (the `migrate` Docker image was stale from before the code pull, since `docker compose run` doesn't rebuild automatically).
- Documented the real update workflow for this deployment going forward: pull → rebuild `migrate` with `--build` → apply migrations → rebuild `app` → recreate — with the `--build` flag being the detail that had been missing.
- Stopped the bundled `docker-compose` `nginx`/`certbot` services entirely — aaPanel's own web server is what actually reverse-proxies `https://uu7.io` to the app container on `127.0.0.1:3006`, per the docker-compose.yml's own aaPanel-specific guidance; the bundled `nginx` container was crash-looping (Docker DNS couldn't resolve the `app` upstream) without ever actually serving live traffic.

### Media upload bug hunt
- Diagnosed and fixed a 4-layer cascading bug that made every production media upload 500: `pnpm-workspace.yaml` blocked sharp's install script → fixing that exposed corepack fetching an unpinned pnpm version → fixing that exposed a bogus `--trust-lockfile` flag that had never been real (previously masked by Docker's layer cache) → fixing that finally exposed the real root cause: Next's `output: "standalone"` file tracing misses sharp's dynamically-`dlopen`'d libvips shared library, fixed via `outputFileTracingIncludes` in `next.config.ts`.
- Found a second, separate bug once uploads stopped 500ing: uploaded files still 404'd until the container was restarted. Root cause: uploads lived under `public/uploads`, and the standalone server resolves `public/` static files against a list built once at boot, so anything written to the volume-mounted uploads directory after that never became servable. Fixed by moving uploads out of `public/` entirely and adding `app/uploads/[filename]/route.ts`, a route handler that reads the file from disk on every request instead.

### PageSpeed Insights & agentic browsing fixes
- Fixed the hero search button having no accessible name (icon-only, no `aria-label`) — the one failing "Agentic Browsing" audit.
- Added long-lived `Cache-Control` headers for static assets and uploaded media, and `images.formats`/`minimumCacheTTL` in `next.config.ts` — addressed the "efficient cache lifetimes" and "improve image delivery" audits.

### Admin dashboard navigation lag
- Added a `loading.tsx` under the admin `(dashboard)` route group so navigating between admin pages shows a fallback instead of sitting frozen on the old page.
- Bumped the postgres.js connection pool from its default of 10 to 20 — the main dashboard page alone fires ~20 queries in one `Promise.all`, so roughly half were queuing for a free connection instead of running concurrently.

### Publish-validation errors silently swallowed in production
- Trying to publish a post blocked by a real validation rule (e.g. a featured image missing alt text) showed a useless generic "Server Components render" error instead of the actual message. Root cause: Next redacts thrown Server Action errors in production regardless of client-side `try/catch`. Fixed by having `createPost`/`updatePost`/`bulkSetPostStatus` return `{ error }` instead of throwing for this expected case, since return values aren't subject to that redaction.

### SEO score + Internal Linking Assistant extended to Categories and Pages
- Categories and Pages only had partial SEO tooling compared to Posts. Added the same live `SeoScorePill` to both edit forms, and added the Internal Linking Assistant (search/auto-suggest + insert-link-at-cursor) to Pages, reusing the existing posts-only implementation as-is since none of it actually required post-specific fields.
- Fixed the Internal Linking Assistant silently looking unresponsive when a genuine search/suggest returns zero results (common for Pages, which have no tags/category to score against) — added an explicit "No related posts found" state instead of falling back to the same idle placeholder text.

### SerpPreview hydration mismatch
- The SERP preview's description text differed between server and client render. Root cause: pixel-width truncation measures via `<canvas>`, which doesn't exist server-side (falls back to a character-count heuristic there) but does exist client-side from the very first render — a real, deterministic mismatch on any long enough title/description, not a fluke. Fixed by gating canvas use behind a post-mount flag so the client's first render matches the server's heuristic output exactly, then upgrades to accurate measurement right after.

### Content SEO pass across Categories and Posts
- Fixed focus-keyword mismatches on 4 categories (Betting Guides, Statistics & Reports, App Tutorials, Bonuses) by revising each keyword to match its existing slug/title rather than renaming live URLs.
- Expanded and fixed several posts against the SEO checklist: "UU7GAME Games Overview" and "The Ultimate UU7GAME Guide" (word count, focus keyword in content, external citations), "UU7GAME Login Guide" and "UU7GAME Registration Guide" (word count, focus keyword in slug/title/content, internal + external links, dropped `[VERIFY]` placeholders that no longer needed hedging), "UU7GAME APK Download Guide" (same, plus replaced a placeholder download-URL note with a real link to `uu7stars.com` once confirmed), and added an external citation (Wikipedia's Indian Rummy article) to "Online Rummy Guide."

### Site navigation bug
- Fixed three hardcoded links (homepage About section CTA, footer, header nav) still pointing at `/about` after the About page's slug changed to `about-uu7`. Added a `308` redirect from the old URL so any existing bookmarks/indexed links land correctly instead of 404ing.

---

## 2026-07-12

### UU7GAME Review 2026 — full build-out
- Rewrote "UU7GAME Review 2026: Is It Legit?" from a `[VERIFY]`-placeholder draft into a real 800+ word review, using platform data verified directly by the site owner: full game catalog, all 7 bonus/promotion types, deposit/withdrawal minimums and processing times (presented as a real Stats Table, not just prose), and support channels. Licensing and security were deliberately left as an honestly-flagged pending item rather than filled in with unverified specifics, per the site's own editorial policy.
- Added a CTA block ("Ready to Play?" → `uu7stars.com`) — the platform review is the highest-intent page on the site for a direct link to the commercial destination.
- Built out the remaining AEO/GEO modules for the post: a 48-word Quick Answer, a dense AI Summary, 7 Key Takeaways, and an FAQ section — later extended with two more FAQs ("Is UU7GAME legit?", "Is UU7GAME safe to use?") placed first since they directly echo the post's own title question.
- Added an external citation (UPI → Wikipedia's Unified Payments Interface article) and wove the focus keyword into the opening sentence, closing out the post's SEO checklist at 100%.
- Updated the "Is UU7GAME legit?" FAQ answer to a direct "yes" per explicit direction, while keeping the Licensing/Security section's own hedge intact — flagged the resulting inconsistency between a confident FAQ answer and a still-pending verdict section for a later pass.

---

## 2026-07-13

### Cover image editing moved into the post editor
- Fixing a missing alt text on a post's featured image (required to publish — see the earlier publish-blocker fix) meant leaving the post, finding the same image in Media Library, editing it there, and coming back. Added a pencil-edit button directly on the Cover Image preview that opens the same alt/title/caption dialog Media Library uses, calling the same `updateMedia` action without leaving the post; extracted the dialog itself into a shared `edit-media-dialog.tsx` component since it's now used from two places. Added a "Missing alt text" badge so the gap is visible before publish is even attempted.
- Added an explicit remove (✕) button next to it — previously the only way to clear a cover image was manually deleting the text in the "Image URL" field.

### Sitewide bug: every link opened in a new tab
- Root-caused a real bug: Tiptap's Link extension hardcodes `target="_blank"` as its own default `HTMLAttributes`, which silently overrode the `target: null` every link mark in this codebase actually stores — internal navigation links were opening in a new tab site-wide, not just the external citations that were supposed to. Fixed the extension's default in `lib/editor/extensions.ts`, then swept every existing post/page's stored content (locally and in production) so internal links keep `target: null` (same tab) while genuinely external links (Wikipedia citations, the `uu7stars.com` backlink) get `target: "_blank"` explicitly.

### Pillar guide and Games Overview expanded to 2,000+ words
- Expanded "The Ultimate UU7GAME Guide" (728 → 2,030 words) and "UU7GAME Games Overview" (747 → 2,014 words) with genuinely new sections (Skill vs. Luck, Fairness and Game Integrity, session-length comparisons, mini-FAQs) rather than padding. Reconciled both posts' game catalogs to the same verified 8-category list used in the Review (added Andar Bahar, Dragon Tiger, Fishing Games, Sports Betting; dropped Aviator, which wasn't in the verified list) — this had been flagged as an inconsistency earlier and is now resolved everywhere.
- Sourced free-to-use stock cover images (Pexels License) for both posts as a placeholder, then replaced both once real uploaded images were provided — added `images.pexels.com` to `next.config.ts`'s allowed remote image hosts for the interim.

### Local-to-production content sync
- Discovered that an entire day-plus of content work (every word-count expansion, keyword fix, external citation, and the Review's AEO/GEO modules) had only ever been written to the local dev database — git tracks code, not database rows, so none of it had reached production on its own despite multiple `git push` cycles.
- Built a slug-keyed export/import script pair (`export-content-sync.ts` / `apply-content-sync.ts`) to move this content to production correctly despite local dev and production being separate databases with independently generated row IDs. Caught two categories (App Tutorials, Bonuses) that had been missed during an earlier manual edit pass in the process.
- Extended the same approach to uploaded cover images once those were added: committed the actual image files into the repo (`scripts/data/uploads-sync/`, since the uploads directory is a Docker volume git never sees either) plus a script to insert their `media` table rows, then used `docker cp` to place the files into the running app container's volume directly. Hit (and documented) the same "`docker compose run` reuses a stale cached image without `--build`" gotcha from the first production deployment, recurring here for the `migrate` container specifically.

---

## 2026-07-10

### Maintenance mode
- Redesigned the maintenance page to match the site's brand identity (logo, `--brand` color, dark-mode support, auto-refresh).
- Fixed the maintenance page not showing a favicon (the `<link rel="icon">` tag was missing entirely).
- Removed the admin exemption — logged-in admins now see maintenance mode on the public site too; only `/admin` itself stays reachable.

### Admin UI redesign
- Applied the `ControlCard` / brand-pill design system consistently across every admin page: Posts, Pages, Categories, Authors, Media Library, Redirects, Settings, and the Dashboard.

### Command Center dashboard (analytics)
- Built full first-party analytics from scratch: visitor stats, recent visitors, top pages, top CTA events, content overview, SEO/content-health intelligence, monthly activity charts, recent posts, activity log, top categories/authors, media type breakdown, user roles.
- Added first-party page-view logging and CTA-click tracking (no third-party analytics service).
- Added an `audit_log` table powering the dashboard's Activity Log (login, post/page/category/author/user/comment create-delete-role-change events).
- Added pagination (5/page) to the Activity Log widget, since it was the only dashboard section long enough to take over the screen — every other widget is a deliberately capped top-5/top-8 list and didn't need it.

### Comments system
- Built the full comment system: public submission form on posts (honeypot + IP rate-limiting for spam), admin moderation queue (approve/reject/delete, bulk actions, search/status filters).
- Fixed the Comments admin page missing the shared admin layout (sidebar/header) — it had been created outside the `(dashboard)` route group.
- Fixed a hydration-mismatch bug from unlocalized `toLocaleDateString()` calls (server/client rendered different date formats) — added a shared `formatDate()` helper.

### Ask-AI chatbot
- Fixed a real retrieval gap: broad questions like "what is this platform" returned no useful answer. Added priority-chunk injection (About page), lightweight stemming, and system-prompt tuning so generic questions get answered from the About page instead of declining.
- Investigated the claim that the OpenAI key was "hardcoded" — confirmed it's the documented DB-first/env-var-fallback design, not hardcoded credentials; kept as-is per explicit choice.
- Added an admin-manageable OpenAI API key setting (previously env-var only).

### Admin: Profile & User Management
- Built a self-service Profile page (Account settings tab): change display name, profile photo, and password.
- Built full User Management (`/admin/users`, admin-only): create users, assign/change roles, remove accounts — with guards preventing self-demotion and self-deletion (so the system can never end up with zero admins).

### SEO metadata
- Imported exact 60-character SEO titles and 160-character meta descriptions for all Pages and Categories, sourced from the keyword brief in `docs/seo-content-strategy-plan.md`.
- Did the same for 5 key posts: Online Rummy Guide, UU7GAME Login/APK Download/Registration Guides, and the UU7GAME Review 2026 draft.
- Wrote two new posts to close out Cluster A (App Tutorials): "The Ultimate UU7GAME Guide" pillar and "UU7GAME Games Overview" hub post. Recreated the "UU7GAME Review 2026" draft with `[VERIFY]` placeholders (still blocked on real platform facts before it can publish).
- Fixed a bug where the new pillar post's slug didn't match what the homepage's Featured Guides section expected — it would have silently never appeared there.
- Fixed a leftover bug in the "Rohan Kapoor" author bio (still referenced the old name "Neha").
- Set sitewide Global SEO fields (site title, meta description, meta keywords).
- Added a focus keyword ("real-money gaming") to the homepage's H1, meta title, and meta description — previously none of them contained an actual target keyword from the brief.

### Pagination
- Added pagination with a configurable "per page" selector (10/20/50/100) to every admin list page: Posts, Pages, Categories, Authors, Media Library, Comments, and Users.
- Built as a shared `AdminPagination` component + `paginate()` helper, reused across all of them for consistency.
