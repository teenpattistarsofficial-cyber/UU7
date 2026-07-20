import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { listExistingContentSchema, listExistingContent } from "./tools/list-content.js";
import { findCoverPhotoSchema, findCoverPhoto } from "./tools/find-cover-photo.js";
import { publishPostSchema, publishPost } from "./tools/publish-post.js";
import { runSiteHealthCheckSchema, runSiteHealthCheck } from "./tools/health-check.js";
import { runPerformanceAuditSchema, runPerformanceAudit } from "./tools/performance-audit.js";
import { getSiteReportSchema, getSiteReport } from "./tools/report.js";
import { listRedirectsSchema, listRedirects, createRedirectSchema, createRedirect, deleteRedirectSchema, deleteRedirect } from "./tools/redirects.js";
import { updateImageAltTextSchema, updateImageAltText } from "./tools/media.js";

const server = new McpServer({ name: "uu7-ops", version: "0.1.0" });

function asToolResult(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function asErrorResult(err: unknown) {
  return {
    isError: true,
    content: [{ type: "text" as const, text: err instanceof Error ? err.message : String(err) }],
  };
}

server.registerTool(
  "list_existing_content",
  {
    title: "List existing uu7.io content",
    description:
      "Fetches every non-deleted post's title, slug, category, focus keyword, tags, and status from the live site. " +
      "Call this BEFORE drafting a new post so you can check the requested keyword against what already exists — " +
      "if there's meaningful overlap, tell the user and ask whether to proceed, target a different angle, or update " +
      "the existing post instead of creating a near-duplicate. Also use it to pick a valid authorSlug.",
    inputSchema: listExistingContentSchema,
  },
  async (args) => {
    try {
      return asToolResult(await listExistingContent(args));
    } catch (err) {
      return asErrorResult(err);
    }
  },
);

server.registerTool(
  "find_cover_photo",
  {
    title: "Find a free stock cover photo",
    description:
      "Searches Pexels (free-to-use, no attribution required) for candidate cover photos. Returns imageUrl/pageUrl/" +
      "photographer for each candidate — pass the chosen imageUrl as coverImage.sourceUrl and credit the " +
      "photographer in coverImage.credit when calling publish_post.",
    inputSchema: findCoverPhotoSchema,
  },
  async (args) => {
    try {
      return asToolResult(await findCoverPhoto(args));
    } catch (err) {
      return asErrorResult(err);
    }
  },
);

server.registerTool(
  "publish_post",
  {
    title: "Publish a post to uu7.io",
    description:
      "Publishes a fully-drafted post directly to the live site. Call list_existing_content first for the " +
      "cannibalization check and to confirm categorySlug/authorSlug, and find_cover_photo first to source a " +
      "coverImage. Returns the created post's id/url and its SEO checklist result.",
    inputSchema: publishPostSchema,
  },
  async (args) => {
    try {
      return asToolResult(await publishPost(args));
    } catch (err) {
      return asErrorResult(err);
    }
  },
);

server.registerTool(
  "run_site_health_check",
  {
    title: "Run a site health check",
    description:
      "Crawls the live site starting from its sitemap, following internal links and images found on each page. " +
      "Reports broken pages/links/images (404s etc.), slow responses, images missing alt text, and any sitemap " +
      "gaps. Broken internal links are cross-referenced against configured redirects — if one already exists for " +
      "that path, it's reported as a lower-priority 'stale link to update' rather than a hard break. Report the " +
      "summary counts first, then the specific items, prioritizing brokenPages and brokenLinks with no redirect " +
      "over everything else. Independent of the publishing tools — call any time.",
    inputSchema: runSiteHealthCheckSchema,
  },
  async (args) => {
    try {
      return asToolResult(await runSiteHealthCheck(args));
    } catch (err) {
      return asErrorResult(err);
    }
  },
);

server.registerTool(
  "run_performance_audit",
  {
    title: "Run a performance audit",
    description:
      "Audits cache headers, image optimization, and real Core Web Vitals (via Google PageSpeed Insights) across " +
      "a set of pages. Lead with the Core Web Vitals performance score and any images missing width/height " +
      "(layout-shift risk), then cache-header/HTTPS notes. Core Web Vitals are automatically skipped with a clear " +
      "reason when baseUrl is localhost, since Google's servers can't reach a local dev server — only cache-header " +
      "and image checks run in that case.",
    inputSchema: runPerformanceAuditSchema,
  },
  async (args) => {
    try {
      return asToolResult(await runPerformanceAudit(args));
    } catch (err) {
      return asErrorResult(err);
    }
  },
);

server.registerTool(
  "get_site_report",
  {
    title: "Get a site report",
    description:
      "Pulls traffic (first-party page views/CTA clicks), content/SEO health, comment stats, recent publishing " +
      "activity, and the admin audit log. Returns raw numbers, not pre-baked advice — use your own judgment on " +
      "what's worth flagging (stale drafts, missing SEO fields, a comment backlog, unusual traffic patterns, etc). " +
      "The `analytics` section (GA4/Search Console) is only populated if configured and synced on the server — " +
      "check `analytics.configured` and `analytics.note` and say plainly if it's empty rather than guessing why. " +
      "This tool doesn't crawl the live site — call run_site_health_check or run_performance_audit too if the user " +
      "wants to know about broken links, images, or page performance.",
    inputSchema: getSiteReportSchema,
  },
  async (args) => {
    try {
      return asToolResult(await getSiteReport(args));
    } catch (err) {
      return asErrorResult(err);
    }
  },
);

server.registerTool(
  "list_redirects",
  {
    title: "List configured redirects",
    description: "Returns every configured redirect (id, fromPath, toPath, statusCode). Call before delete_redirect to find a redirect's id.",
    inputSchema: listRedirectsSchema,
  },
  async () => {
    try {
      return asToolResult(await listRedirects());
    } catch (err) {
      return asErrorResult(err);
    }
  },
);

server.registerTool(
  "create_redirect",
  {
    title: "Create a redirect",
    description:
      "Adds a redirect — the direct fix for a broken internal link found by run_site_health_check (one reported " +
      "with redirectExists: false). Same-site only; an external origin in toPath gets stripped down to a bare path. " +
      "After adding, re-run run_site_health_check to confirm the link now resolves.",
    inputSchema: createRedirectSchema,
  },
  async (args) => {
    try {
      return asToolResult(await createRedirect(args));
    } catch (err) {
      return asErrorResult(err);
    }
  },
);

server.registerTool(
  "delete_redirect",
  {
    title: "Delete a redirect",
    description: "Removes a redirect by id (from list_redirects) — e.g. once the source link that needed it has been fixed directly.",
    inputSchema: deleteRedirectSchema,
  },
  async (args) => {
    try {
      return asToolResult(await deleteRedirect(args));
    } catch (err) {
      return asErrorResult(err);
    }
  },
);

server.registerTool(
  "update_image_alt_text",
  {
    title: "Update an image's alt text",
    description:
      "Sets the alt text for an image by its URL — the direct fix for a run_site_health_check missingAltText or " +
      "run_performance_audit finding. Only affects genuinely unmanaged/missing alt text; write a real description " +
      "of what the image shows, not a generic placeholder.",
    inputSchema: updateImageAltTextSchema,
  },
  async (args) => {
    try {
      return asToolResult(await updateImageAltText(args));
    } catch (err) {
      return asErrorResult(err);
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
