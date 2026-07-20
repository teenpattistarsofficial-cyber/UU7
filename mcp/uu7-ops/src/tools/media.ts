import { z } from "zod";
import { siteUrl, publishToken } from "../config.js";

export const updateImageAltTextSchema = {
  url: z.string().describe("The image's URL exactly as reported by run_site_health_check's missingAltText or run_performance_audit."),
  alt: z.string().describe("Descriptive alt text for the image (what it shows, not \"image of...\")."),
};

export async function updateImageAltText(args: { url: string; alt: string }) {
  const res = await fetch(new URL("/api/ops/media", siteUrl()), {
    method: "PATCH",
    headers: { Authorization: `Bearer ${publishToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`update_image_alt_text failed (${res.status}): ${JSON.stringify(body)}`);
  }
  return body;
}
