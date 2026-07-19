import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

// SHA-256 both sides first so timingSafeEqual always compares equal-length
// digests — comparing the raw strings directly would throw on a length
// mismatch instead of just failing closed, and a plain !== compare leaks
// timing information about how many leading bytes matched. Callers are
// expected to check `process.env.PUBLISH_API_TOKEN` themselves first if they
// want to distinguish "not configured" (500) from "wrong token" (401).
export function verifyPublishToken(request: NextRequest): boolean {
  const expectedToken = process.env.PUBLISH_API_TOKEN;
  if (!expectedToken) return false;

  const authHeader = request.headers.get("authorization");
  const providedToken = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
  if (!providedToken) return false;

  const expectedHash = createHash("sha256").update(expectedToken).digest();
  const providedHash = createHash("sha256").update(providedToken).digest();
  return timingSafeEqual(expectedHash, providedHash);
}
