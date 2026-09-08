import { z } from "zod";
import { siteUrl, publishToken } from "../config.js";

export const getPostContentSchema = {
  slug: z.string().describe("The post's URL slug (e.g. 'cricket-betting-india-guide')."),
};

export async function getPostContent(args: { slug: string }) {
  const url = new URL("/api/ops/post", siteUrl());
  url.searchParams.set("slug", args.slug);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${publishToken()}` },
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`get_post_content failed (${res.status}): ${JSON.stringify(body)}`);
  }
  return body;
}
