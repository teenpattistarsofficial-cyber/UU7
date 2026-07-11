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
