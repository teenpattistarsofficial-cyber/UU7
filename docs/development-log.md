# UU7.io — Development Log

A running log of work completed on this project, grouped by date. Newest entries at the top. Every work session should append a new dated section (or add to today's section if one already exists) rather than editing past entries.

---

## 2026-07-22

### Ops-agent direct-fix tools (redirects, media alt text)
- Extended the `uu7-ops` MCP server (used from Claude Desktop) with four new tools scoped strictly to bounded data fixes, not code/deploys: `list_redirects`, `create_redirect`, `delete_redirect`, `update_image_alt_text`. Backed by new `app/api/ops/redirects/route.ts` (GET now includes `id`, new POST with 409-on-duplicate handling since drizzle's postgres.js driver wraps the real Postgres error in `err.cause`, not on the Error object directly), `app/api/ops/redirects/[id]/route.ts` (DELETE), and `app/api/ops/media/route.ts` (PATCH alt text by URL). Same bearer-token auth, rate limiting, and audit logging as the existing `/api/publish` route.
- Extracted `normalizePath`/`VALID_STATUS_CODES` out of `lib/actions/redirects.ts` into a new plain module (`lib/redirects/validation.ts`) so the new API route could reuse them — a `"use server"` file can only export async functions, so the original inline constants had to move.

### Author social links
- Added Facebook, Instagram, YouTube, and Telegram fields to the author admin form and public author page (previously only Twitter/X and LinkedIn existed).

### Load More pagination
- Added "Load More" pagination to category pages (bypassed entirely when a search query is active, showing all matches) and a simpler pagination-only version for author pages.

### Custom Scripts admin feature
- Added a head/footer script-injection admin setting (`headScripts`/`footerScripts` columns, new Settings sub-page) and wired in the real GA4 tracking snippet.

### Hero image alt text + health-check false positive
- Fixed the hero image's hardcoded empty `alt=""` (health check couldn't fix it via the ops agent since it's hardcoded in `hero.tsx`, not stored in the CMS) and a `missingAltText` false-positive in the health-check tool caused by not excluding Next's own `data-nimg` attribute images.
- Compressed the hero image (399KB → 188KB via sharp) and renamed the file (`Base image transparent.webp` → `hero-banner-compressed.webp`) rather than replacing in place, since the static-asset `Cache-Control: immutable, max-age=31536000` header meant an in-place replacement would never actually reach visitors.
- Regenerated `favicon.ico` from the real logo (previously a placeholder black-circle/white-triangle image); guided manual Cloudflare cache purge for this one since it can't be renamed (browsers expect the fixed path) and no Cloudflare API token is configured on production for automated purging.

### Leaked credentials, twice
- Removed a leaked `PUBLISH_API_TOKEN` from git history's `docs/Publish token` file and rotated it in production.
- The same file got recreated by the user's own editor workflow mid-session with three live secrets (publish token, Pexels key, PageSpeed key) via a broad `git add -A`. Removed again and permanently blocked via `.gitignore` (`docs/Publish token`, `/docs/scratch*`) plus a dedicated `docs/scratch-notes.md` replacement. Pexels/PageSpeed key rotation deferred by user request.

### The real next/image production bug — three compounding root causes
A month-plus of persistent LCP/performance issues (the actual motivation for tonight's whole investigation) turned out to be `/_next/image` silently serving every image at full original size/format, ignoring all width/quality params, in production only. Three distinct, compounding bugs, only the third of which was the real fix:
1. **`outputFileTracingIncludes`'s `@img/**/*` glob never matched anything, ever.** pnpm's layout never places `@img/*` packages at a top-level `node_modules/@img/` path — they live nested under `.pnpm/sharp@.../node_modules/@img/`, itself a symlink into `.pnpm/@img+sharp-<platform>@.../`. Fixed by adding `publicHoistPattern: ["@img/*"]` to `pnpm-workspace.yaml`, which makes pnpm place a real top-level copy where both the tracer glob and Node's own module resolution (walking up from the flattened standalone build's `node_modules/sharp/`) actually land.
2. **Next.js 16.2.10 bundles its own separate `sharp` dependency** (`^0.34.5` as its own `optionalDependency`), non-overlapping with this project's own `sharp` (`^0.35.3`) — two independent installations, only one of which (ours) worked. Next's internal copy — the one the `/_next/image` route actually uses — crashed at module load (`Cannot read properties of undefined (reading 'output')`, a native-binding/JS-wrapper version mismatch). Fixed by dropping this project's `sharp` to the same `^0.34.5` range so pnpm dedupes to one shared install.
3. **A stale native binary lingered in pnpm's internal cross-hoist cache** (`node_modules/.pnpm/node_modules/@img/...`) even after the version alignment — a plain `pnpm install` doesn't refresh this location on its own. Required a full `node_modules` wipe + reinstall (harmless in CI/Docker, where every build stage starts from a clean image anyway).
- Verified end-to-end at each stage by calling Next's own exported `optimizeImage()` directly against the real production hero image inside the standalone build output, rather than trusting `require('sharp')` succeeding in isolation (which passed even while the actual bug was still live — the failure only showed up through next's own internal, separately-resolved copy).
- Confirmed live in production after deploy: real width-scaled file sizes (24.5KB at `w=384` up to 105KB, capped by the source's native 1023px width) instead of the flat 188KB original at every width.

### Cloudflare Cache Rule for /_next/image
- `/_next/image` was sending a correct `Cache-Control: public, max-age=31536000` from origin but Cloudflare showed `cf-cache-status: DYNAMIC` on every request — Cloudflare's default caching only applies by file extension, and this is a query-string route, so it was never even attempted. Added an explicit Cache Rule (`URI Path starts with /_next/image` → `Eligible for cache`, respecting origin's `Cache-Control`). Confirmed `HIT` with incrementing `age` on repeat requests immediately after.
- Net result, confirmed via the ops agent's performance audit re-run: homepage score 80 → 92, LCP 5.3s → 3.3s, TBT 53ms → 6.5ms.
- Noted but not acted on: `.next/cache/images` isn't a persistent Docker volume, so every redeploy wipes the on-disk image-transform cache, causing a cold-cache penalty on the first request to any given width/quality combo until the next real visitor (or a warm-up script) regenerates it.

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
