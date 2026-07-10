import "server-only";
import { db } from "@/lib/db";
import { pageViews } from "@/lib/db/schema";

function detectDevice(userAgent: string): "mobile" | "tablet" | "desktop" {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua)) return "tablet";
  if (/mobile|iphone|android/.test(ua)) return "mobile";
  return "desktop";
}

// Called directly from proxy.ts for every real public-page request — never
// throws, since a tracking failure must not break the actual page response
// it's piggybacking on.
export async function logPageView({
  path,
  visitorId,
  ip,
  userAgent,
}: {
  path: string;
  visitorId: string;
  ip: string | null;
  userAgent: string | null;
}) {
  try {
    await db.insert(pageViews).values({
      path,
      visitorId,
      ip,
      userAgent,
      device: detectDevice(userAgent ?? ""),
    });
  } catch {
    // best-effort
  }
}
