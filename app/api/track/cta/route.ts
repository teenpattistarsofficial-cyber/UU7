import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ctaClicks } from "@/lib/db/schema";

export const runtime = "nodejs";

const VISITOR_COOKIE = "uu7_vid";

// Fired by the client-side CtaBlock/SiteCta components on click — best
// effort (via navigator.sendBeacon, which this route's shape matches: no
// response body needed, "did it arrive" doesn't matter to the caller since
// the CTA's own <a> navigation is what the visitor actually cares about).
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const ctaId = typeof body?.ctaId === "string" ? body.ctaId : null;
  const ctaLabel = typeof body?.ctaLabel === "string" ? body.ctaLabel : null;
  const path = typeof body?.path === "string" ? body.path : null;
  if (!ctaId || !path) {
    return new Response(null, { status: 400 });
  }

  try {
    await db.insert(ctaClicks).values({
      ctaId,
      ctaLabel,
      path,
      visitorId: request.cookies.get(VISITOR_COOKIE)?.value ?? null,
    });
  } catch {
    // best-effort — never let tracking failures surface to the visitor
  }

  return new Response(null, { status: 204 });
}
