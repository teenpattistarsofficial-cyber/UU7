import { z } from "zod";
import { siteUrl, publishToken } from "../config.js";

export const listExistingContentSchema = {
  keyword: z
    .string()
    .optional()
    .describe(
      "The keyword/topic you're about to write about. When given, the response includes a keywordOverlap list of existing posts ranked by title/focus-keyword overlap — treat any non-trivial overlap as a signal to check semantically before drafting, not just a raw score to compare against a threshold.",
    ),
};

export async function listExistingContent(args: { keyword?: string }) {
  const url = new URL("/api/publish/context", siteUrl());
  if (args.keyword) url.searchParams.set("keyword", args.keyword);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${publishToken()}` },
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`list_existing_content failed (${res.status}): ${JSON.stringify(body)}`);
  }
  return body;
}
