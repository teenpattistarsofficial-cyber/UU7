# uu7-ops MCP server

Gives Claude Desktop six tools for operating uu7.io conversationally:
`list_existing_content` (keyword cannibalization + author/category lookup),
`find_cover_photo` (Pexels stock photo search), `publish_post` (calls the site's
`/api/publish` API), `run_site_health_check` (crawls the site for broken
links/images and slow pages), `run_performance_audit` (cache headers, image
optimization, and real Core Web Vitals via Google PageSpeed Insights), and
`get_site_report` (traffic, content/SEO health, comments, and activity log).

This is a standalone Node package — it is **not** part of the Next.js app's build and
is never deployed to the VPS. It runs locally on your machine as a subprocess Claude
Desktop launches.

## 1. Set up environment variables

You'll need three values, kept only in your local Claude Desktop config (never
committed anywhere):

- `UU7_SITE_URL` — e.g. `http://localhost:3006` for local testing, `https://uu7.io`
  for production.
- `UU7_PUBLISH_TOKEN` — must match the server's `PUBLISH_API_TOKEN` env var.
  **Test against local/dev first.** The current production token was leaked in
  `docs/Publish token` — rotate it on the server before pointing this at production.
- `PEXELS_API_KEY` — free at https://www.pexels.com/api/ (sign up, no cost).
- `PAGESPEED_API_KEY` — optional, but effectively required in practice: PageSpeed
  Insights allows keyless calls at a very low shared quota that's often already
  exhausted (confirmed during testing — a keyless call returned a 429 "quota
  exceeded" from Google's shared default project). Get a free one at
  https://developers.google.com/speed/docs/insights/v5/get-started (enable the
  "PageSpeed Insights API" on a Google Cloud project, no billing required for the
  free tier). Without it, `run_performance_audit`'s cache-header/image checks still
  work fine — only the Core Web Vitals tier is affected.

## 2. Build

```sh
cd mcp/uu7-ops
npm install
npm run build
```

This produces `dist/index.js`. Re-run `npm run build` after any change to `src/`.

## 3. Smoke-test standalone (recommended before wiring up Desktop)

```sh
UU7_SITE_URL=http://localhost:3006 UU7_PUBLISH_TOKEN=<your-dev-token> PEXELS_API_KEY=<your-key> \
  PAGESPEED_API_KEY=<your-key> node dist/index.js
```

The process will sit waiting for MCP JSON-RPC messages on stdin — that's expected,
it's designed to be driven by a client (Desktop, or a test harness), not run
interactively. Ctrl-C to stop.

## 4. Add to Claude Desktop

Edit Claude Desktop's config file:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

Add an entry (adjust the path to match where you cloned this repo):

```json
{
  "mcpServers": {
    "uu7-ops": {
      "command": "node",
      "args": ["/Users/mac/Documents/GitHub/UU7/mcp/uu7-ops/dist/index.js"],
      "env": {
        "UU7_SITE_URL": "http://localhost:3006",
        "UU7_PUBLISH_TOKEN": "<your-dev-token>",
        "PEXELS_API_KEY": "<your-key>",
        "PAGESPEED_API_KEY": "<your-key>"
      }
    }
  }
}
```

Restart Claude Desktop. A new conversation should now have `list_existing_content`,
`find_cover_photo`, `publish_post`, `run_site_health_check`, `run_performance_audit`,
and `get_site_report` available as tools.

## 5. Test against local/dev first

Run `pnpm dev` in the repo root (serves at `http://localhost:3006`) before pointing
`UU7_SITE_URL` at production — this pipeline creates permanent content, and
`publish_post`'s `mode: "replace"` is destructive. Once a real end-to-end prompt
works against local data, rotate the production token, update the config's env
block to point at the live site, and restart Claude Desktop.

## What each tool does

- **`list_existing_content(keyword?)`** — call this first. Returns every live post's
  title/slug/category/focus keyword/tags, plus (when `keyword` is given) a
  `keywordOverlap` ranking to flag likely cannibalization candidates before you draft.
- **`find_cover_photo(query, perPage?)`** — searches Pexels, returns candidates to
  choose a cover image from.
- **`publish_post(payload)`** — publishes. `payload.content` is raw Tiptap
  `JSONContent` (the tool description documents the exact block shapes); `coverImage`
  downloads and self-hosts a photo with required alt text; `tags`, `cta`,
  `statsTables`, `faqs`, etc. all map directly onto the fields the admin editor itself
  supports. Returns the new post's `url` and its SEO checklist pass/fail result.
- **`run_site_health_check(baseUrl?, maxLinksToCheck?, slowThresholdMs?, checkExternalLinks?)`**
  — crawls from `/sitemap.xml` (plus `/faq`, which isn't in the sitemap yet), follows
  every internal link/image found on each page (capped, default 300), and reports
  broken pages/links/images, slow responses, missing image alt text, and sitemap
  gaps. Broken internal links are checked against the site's configured redirects —
  one that already has a redirect is reported as a lower-priority "stale link to
  update" rather than a hard break. Note: the *first* crawl against a freshly-started
  `pnpm dev` server can report false-positive timeouts on pages Next hasn't compiled
  yet — if that happens, just run it again once the dev server's warm.
- **`run_performance_audit(baseUrl?, urls?, maxPages?, maxCwvPages?, strategy?)`** —
  checks cache headers (`cache-control`, `cf-cache-status`, `content-encoding`),
  flags `<img>` tags missing `width`/`height`/`loading="lazy"` (deliberately excludes
  every `next/image`-rendered image, identified via its own `data-nimg` attribute,
  since `next/image` already handles sizing/loading correctly, including `fill`-mode
  images that legitimately have no width/height — only raw, hand-authored `<img>`
  tags get flagged, which in practice means Tiptap article-body images), flags large
  images (>300KB), and notes whether HTTPS is even reachable. Also calls Google's
  PageSpeed Insights API (capped at `maxCwvPages`, default 3, since each call runs a
  real Lighthouse pass and takes 15-30s) for real performance score/LCP/CLS/TBT/Speed
  Index — **automatically skipped** with a clear reason when `baseUrl` is localhost,
  since Google's servers can't reach a local dev server; only testable against the
  real public site (a safe, read-only, unauthenticated call — no different from a
  visitor loading the page).
- **`get_site_report(trafficRange?)`** — traffic (first-party page views/CTA
  clicks), content/SEO health (`avgSeoScore`, missing titles/meta/images, stale
  drafts), comment stats, recent publishing activity, top categories/authors, and
  the last 25 admin audit-log entries. Returns raw numbers, not pre-baked advice —
  the calling model decides what's worth flagging. The `analytics` section (GA4/
  Search Console) only has real data if `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS`/
  `GSC_SITE_URL`/`GA4_PROPERTY_ID` are configured on the server *and*
  `scripts/jobs/sync-analytics.ts` has actually run (it's a VPS cron job, not
  something this repo schedules itself) — `analytics.configured`/`analytics.note`
  say plainly when it's empty rather than pretending there's no data to show.
  Doesn't crawl the live site itself — pair with `run_site_health_check`/
  `run_performance_audit` for that.
