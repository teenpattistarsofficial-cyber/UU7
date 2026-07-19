import { z } from "zod";
import { siteUrl, publishToken } from "../config.js";

export const getSiteReportSchema = {
  trafficRange: z
    .enum(["today", "7d", "30d"])
    .optional()
    .describe("Range for the traffic-related figures (topPages, topCtaEvents, rangeStats). Default 7d."),
};

export async function getSiteReport(args: { trafficRange?: "today" | "7d" | "30d" }) {
  const url = new URL("/api/ops/report", siteUrl());
  if (args.trafficRange) url.searchParams.set("trafficRange", args.trafficRange);

  const res = await fetch(url, { headers: { Authorization: `Bearer ${publishToken()}` } });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`get_site_report failed (${res.status}): ${JSON.stringify(body)}`);
  }
  return body;
}
