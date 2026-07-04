import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// This site's entire purpose is AI-citability/backlink authority (see
// AGENTS.md / the project plan) — full allow for every major AI crawler,
// not the training-opt-out/search-only split some publishers use.
const AI_AND_SEARCH_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/search"] },
      ...AI_AND_SEARCH_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
