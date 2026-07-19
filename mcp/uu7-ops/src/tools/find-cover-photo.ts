import { z } from "zod";
import { pexelsApiKey } from "../config.js";

export const findCoverPhotoSchema = {
  query: z.string().describe("Search terms for a relevant, free-to-use stock cover photo (e.g. \"online casino chips table\")."),
  perPage: z.number().int().min(1).max(15).optional().describe("How many candidates to return (default 5)."),
};

// Pexels specifically (not arbitrary web search results) — its license is
// free for commercial use with no attribution required, matching the
// existing convention in scripts/create-*-guide.ts of hotlinking Pexels
// stock photos as post covers. Returns candidates only; publish_post does
// the actual download + processing once one is chosen.
export async function findCoverPhoto(args: { query: string; perPage?: number }) {
  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", args.query);
  url.searchParams.set("per_page", String(args.perPage ?? 5));

  const res = await fetch(url, { headers: { Authorization: pexelsApiKey() } });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`find_cover_photo failed (${res.status}): ${JSON.stringify(body)}`);
  }

  return {
    photos: (body.photos ?? []).map((p: any) => ({
      id: p.id,
      photographer: p.photographer,
      pageUrl: p.url,
      imageUrl: p.src?.large,
      description: p.alt || args.query,
    })),
  };
}
