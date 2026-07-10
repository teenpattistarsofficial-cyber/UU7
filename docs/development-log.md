# UU7.io — Development Log

A running log of work completed on this project, grouped by date. Newest entries at the top. Every work session should append a new dated section (or add to today's section if one already exists) rather than editing past entries.

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
