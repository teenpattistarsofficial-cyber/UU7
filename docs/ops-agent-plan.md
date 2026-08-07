# The uu7-ops Agent — How It Was Built

A retrospective architecture doc for the Claude Desktop ops agent: publishing posts, cover-photo sourcing, content/cannibalization lookup, site health checks, PageSpeed audits, reporting, redirect management, and image alt-text fixes. Written after the fact from the actual code, not from memory — every claim below traces to a specific file.

---

## 1. The core idea

Claude Desktop can run local MCP (Model Context Protocol) servers as subprocesses. `mcp/uu7-ops/` is one such server: a small, standalone Node package (never deployed, never part of the Next.js build) that Claude Desktop launches on your machine. It exposes 10 "tools" — typed functions an AI agent can call — each of which either calls a bearer-token-authenticated API route on the live Next.js app, or (for the two crawl-based tools) does its own HTTP crawling directly against the public site.

This split matters: **not every tool needed a new backend route.** Health checks and performance audits just need to *read* what any visitor's browser would see, so they crawl the live site directly from the MCP process. Publishing, reporting, and redirect/media edits need to *write* to the database, so those go through real authenticated API routes.

```
Claude Desktop
      │  (stdio JSON-RPC)
      ▼
mcp/uu7-ops (local Node subprocess)
      │
      ├─ publish_post ──────────────► POST /api/publish            (writes DB)
      ├─ list_existing_content ─────► GET  /api/publish/context     (reads DB)
      ├─ get_site_report ───────────► GET  /api/ops/report           (reads DB)
      ├─ list/create/delete_redirect► /api/ops/redirects[...]        (writes DB)
      ├─ update_image_alt_text ─────► PATCH /api/ops/media           (writes DB)
      ├─ find_cover_photo ──────────► Pexels API directly (not our backend)
      ├─ run_site_health_check ─────► crawls uu7.io directly + GET /api/ops/redirects
      └─ run_performance_audit ─────► crawls sitemap + Google PageSpeed API directly
```

---

## 2. The MCP server itself (`mcp/uu7-ops/`)

**Stack**: `@modelcontextprotocol/sdk` (official TypeScript SDK, `McpServer` high-level API), `zod` for input schemas, `happy-dom` for parsing crawled HTML without a real browser.

**Structure**:
```
mcp/uu7-ops/
├── README.md            — setup + tool docs, including the Claude Desktop config example
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts          — registers all 10 tools, starts the stdio transport
    ├── config.ts         — lazy env-var getters
    ├── lib/http.ts       — shared fetch/timing/concurrency helpers
    └── tools/            — one file per tool (or small related group)
```

**Registration pattern** (`src/index.ts`):
```ts
const server = new McpServer({ name: "uu7-ops", version: "0.1.0" });
server.registerTool("list_existing_content", { title, description, inputSchema }, async (args) => { ... });
// ...9 more registerTool calls
const transport = new StdioServerTransport();
await server.connect(transport);
```
Every handler returns success via `asToolResult()` (JSON-stringified result as text content) or failure via `asErrorResult()` (`isError: true`). The process just sits on stdin — Claude Desktop drives it entirely.

**Build**: `tsc` compiles `src/` → `dist/index.js` (this is what Claude Desktop actually launches via `node dist/index.js`). `npm run dev` uses `tsx` directly for iteration without a compile step.

**Config** (`src/config.ts`) is deliberately lazy — missing env vars only throw when a tool that actually needs them is called, so the server can still start and list its tools even with an incomplete `.env`:
- `UU7_SITE_URL`, `UU7_PUBLISH_TOKEN` — required for anything touching the app
- `PEXELS_API_KEY` — only `find_cover_photo` needs it
- `PAGESPEED_API_KEY` — optional; PageSpeed works keyless at a lower quota

---

## 3. The 10 tools

| Tool | Input | Backend |
|---|---|---|
| `list_existing_content` | `keyword?` | `GET /api/publish/context` |
| `find_cover_photo` | `query`, `perPage?` | Pexels API directly |
| `publish_post` | title, slug, category, author, Tiptap content, SEO fields, optional AEO blocks (quick answer, AI summary, key takeaways, FAQs, CTA, stats tables), cover image, `mode: create\|replace` | `POST /api/publish` |
| `run_site_health_check` | `maxLinksToCheck?`, `slowThresholdMs?`, `checkExternalLinks?` | Crawls the live site's sitemap + a hardcoded extra-routes list directly; cross-references broken links against `GET /api/ops/redirects` |
| `run_performance_audit` | `maxPages?`, `maxCwvPages?`, `strategy?` | Crawls sitemap directly + calls Google's PageSpeed Insights API directly |
| `get_site_report` | `trafficRange?` | `GET /api/ops/report` |
| `list_redirects` / `create_redirect` / `delete_redirect` | — | `/api/ops/redirects[/:id]` |
| `update_image_alt_text` | `url`, `alt` | `PATCH /api/ops/media` |

The two "audit" tools are the ones worth calling out explicitly: **there is no `/api/ops/health` or `/api/ops/performance` route.** All the crawling, HTML parsing, and timing logic lives in the MCP process itself (`src/lib/http.ts`'s `fetchAndMeasure()` — timed fetch with an `AbortController`, `redirect: "manual"` so a real 3xx from the redirect table shows up as a 3xx instead of being silently followed — and `pool()`, a bounded-concurrency runner, `DEFAULT_CONCURRENCY = 8`). This keeps two read-only, exploratory tools from needing any backend surface area at all.

---

## 4. The backend API surface (`app/api/ops/*`, `app/api/publish/*`)

Every one of these six routes shares identical boilerplate:
```ts
if (!process.env.PUBLISH_API_TOKEN) return 500;   // server misconfigured
if (!verifyPublishToken(request)) return 401;      // bad/missing bearer token
if (!checkRateLimit("publish-api")) return 429;    // shared budget across all six routes
```

**Auth** (`lib/publish/auth.ts`): reads `Authorization: Bearer <token>`, compares SHA-256 digests of expected vs. provided via `crypto.timingSafeEqual` (hashing first sidesteps `timingSafeEqual`'s length-mismatch throw and avoids leaking raw-string timing). Deliberately *not* under `/admin` — that's gated by session-cookie middleware for human logins. This is a separate, machine-client auth path.

**Rate limit** (`lib/ai/rate-limit.ts`): an in-memory `Map<string, number[]>`, 8 requests per 60-second window, shared across all six routes under one key. Explicitly a cost guard, not a security control — resets on process restart since this runs as one long-lived VPS process, not serverless.

**Route responsibilities**:
- **`POST /api/publish`** — the real workhorse. Validates required fields, safe-URL-checks any CTA/cover-image URLs, runs the publish-time link-validation guard (§5), tears down and recreates on `mode: "replace"` (mirrors the admin's own delete-post teardown order: dependent rows first, since `seoMeta` is polymorphic and has no `ON DELETE CASCADE`), downloads and re-processes any `coverImage` through the same sharp/WebP pipeline the admin upload path uses, writes an audit-log row, then calls `invalidatePublicPaths(...)` + `revalidateTag("posts", "max")` by hand — because this route bypasses the normal Server Action layer (raw Drizzle inserts), it never gets the cache invalidation those actions carry automatically.
- **`GET /api/publish/context`** — read-only counterpart: every post's slug/title/category/focus-keyword/tags, plus authors and categories, for the agent to check "does this already exist" before publishing. With `?keyword=`, adds a keyword-overlap score (`lib/seo/cannibalization.ts`'s `scoreKeywordOverlap()` — a plain tokenizer/stopword-filter/overlap-count, explicitly documented as "a convenience signal, not the final judgment call," not embeddings).
- **`GET /api/ops/report`** — thin aggregation over the *existing* admin-dashboard query functions (`lib/dashboard/queries.ts`) — visitor stats, top pages/CTAs, content health, activity log, etc. No new query logic; just JSON-shaping what the dashboard already computes.
- **`/api/ops/redirects[/:id]`** — CRUD, validated through the same `normalizePath()`/`VALID_STATUS_CODES` helpers the admin UI's Server Action uses (so a pasted full URL gets stripped to a bare same-site path, `/` itself can't be redirected, duplicate `fromPath` returns a clean `409` instead of a raw 500).
- **`PATCH /api/ops/media`** — updates just the `alt` column by URL lookup, deliberately narrow in scope (not caption/title) to match exactly the gap the health-check tool surfaces.

---

## 5. The publish-time link-validation guard

This exists because of a real incident: an earlier publish batch (via this same `/api/publish` route, before the guard existed) produced 19 broken internal links pointing at a nonexistent `/blog/<slug>` prefix. The fix, once built, generalized to catch two distinct failure modes:

**`lib/editor/links.ts`** — `collectLinkHrefs(doc)` walks a Tiptap JSON tree once, collecting every link mark's `href`. (Previously this walk was copy-pasted three separate times across the codebase; extracted here so all three converge.)

**`lib/seo/validate-internal-links.ts`** — the actual check:
```ts
type LinkValidationContext = {
  validPrefixes: Set<string>;   // single-segment: category/page slugs, "authors", "faq"
  validFullPaths: Set<string>;  // two-segment: "/category/slug", "/authors/slug"
};

function isInvalidInternalLink(href, ctx): boolean {
  // only judges absolute-internal paths — external/anchor/mailto/protocol-relative always pass
  const [, seg1, seg2] = href.match(/^\/([^/?#]+)(?:\/([^/?#]+))?/) ?? [];
  if (!seg2) return !ctx.validPrefixes.has(seg1);       // catches wrong category ("/blog/...")
  return !ctx.validFullPaths.has(`/${seg1}/${seg2}`);   // catches right category, dead slug
}
```

`app/api/publish/route.ts` builds both sets from a **live DB query** on every request (categories + pages + published/non-deleted/categorized posts + non-deleted authors) — deliberately *not* from the static `SITE_CATEGORIES` nav list, which is missing editor-created categories/pages and would falsely reject valid links. Any bad link in the post body or the CTA button URL gets the whole publish rejected with `400` and the offending URLs listed — before any DB write happens.

---

## 6. Maintenance scripts (`scripts/`)

For fixing content that predates the guard, or one-off migrations, all following the same convention: **dry-run by default, `--apply` to write**, and no imports from any `"server-only"`-marked lib (confirmed `tsx` can't resolve those — the image-migration script inlines its own sharp recipe rather than importing the admin upload path's version for this reason).

| Script | Does |
|---|---|
| `audit-link-targets.ts` / `fix-link-targets.ts` | Audits/fixes `target`/`rel` policy on link marks (internal = no target/nofollow, external = `_blank` + `noopener noreferrer`) |
| `fix-blog-prefix-links.ts` | Rewrites the specific `/blog/<slug>` mistake to the real canonical URL, across both Tiptap content *and* the separate `post_ctas.buttonUrl` column |
| `audit-hotlinked-images.ts` / `fix-hotlinked-images.ts` | Finds/fixes posts whose cover image is still a hotlinked external URL (slow, since Next's image optimizer takes a much slower path fetching a remote origin) instead of self-hosted |

**Run via**: production Postgres only binds to `127.0.0.1` on the VPS, so these run on the VPS itself through the `migrate` Docker Compose service (profile-gated, never auto-started):
```bash
docker compose --profile tools run --rm migrate npx tsx scripts/fix-hotlinked-images.ts --apply
```
`migrate` reuses the full `builder` image stage (has devDependencies/`tsx`, unlike the pruned standalone runner) and shares the same `uploads` named volume as `app` — added specifically after discovering a script that writes files as part of its work would otherwise lose them the instant the throwaway `--rm` container exited, while the DB rows it inserted alongside would still point at those now-nonexistent files.

---

## 7. Keeping the edge cache honest

Two layers, two different triggers:

- **Content mutations** (publish, edit, delete — anything going through a Server Action or the `/api/publish` route) call `invalidatePublicPaths(paths)` (`lib/cache/invalidate-public-paths.ts`), which does `revalidatePath()` for Next's own cache plus a background (non-blocking) `purgeCloudflareUrls(paths)` call to Cloudflare's `purge_cache` API, chunked at their 30-URLs-per-call limit. Never throws — a purge failure just means that one page falls back to normal TTL expiry instead of updating instantly.

- **Code deploys** don't run any Server Action, so they never hit the path above — a gap discovered when a shared-component change sat un-served on stale edge nodes for up to an hour after a deploy. Fixed with `instrumentation.ts`'s `register()` hook, which Next.js runs once per server boot:
  ```ts
  export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") void purgeEverything();
  }
  ```
  Purges the *entire* zone (not a path list — a shared-component change isn't scoped to any fixed set of pages), and isn't awaited, since `register()`'s return value blocks the server from handling requests and a hung Cloudflare call must never delay real traffic from reaching a freshly deployed server.

---

## 8. Wiring it into Claude Desktop

Config lives at `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS), documented in `mcp/uu7-ops/README.md`:
```json
{
  "mcpServers": {
    "uu7-ops": {
      "command": "node",
      "args": ["/absolute/path/to/mcp/uu7-ops/dist/index.js"],
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
Recommended rollout order (also in the README): build, smoke-test standalone (`node dist/index.js` with env vars piped in — it should just block on stdin, that's correct), test against local dev (port 3006) before ever pointing `UU7_SITE_URL` at production — `publish_post`'s `mode: "replace"` is destructive — then repoint once a full local round-trip works.

---

## 9. The underlying design choices, if doing this again

- **Bearer token, not session cookies** — a machine client has no browser session to carry; a separate `/api/*` surface (not under `/admin`) with its own token keeps the two auth models from ever tangling.
- **Crawl-based tools need no backend at all** — if a tool only ever reads what a public visitor could already see, let the MCP process fetch it directly. Only build a backend route when the tool needs to see something *not* publicly exposed (redirect table) or needs to *write*.
- **Validate against live data, never a hardcoded list** — any static allowlist (nav categories, etc.) drifts out of sync with what the CMS actually contains; a validation guard built against it will eventually reject something valid.
- **Dry-run by default on every script that writes** — cheap insurance, and it's what actually caught the "3 posts would be affected, but 2 of those hrefs don't resolve to anything" case before it became a live problem.
- **Cache invalidation as its own choke point** — one shared `invalidatePublicPaths()` that every mutation calls, rather than each Server Action reinventing its own revalidation, is what made adding the deploy-time purge (§7) a five-line addition instead of a hunt through a dozen call sites.
