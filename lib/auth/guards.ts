import "server-only";
import { headers } from "next/headers";
import { auth, type Role } from "@/lib/auth";

const ROLE_RANK: Record<Role, number> = { author: 0, editor: 1, admin: 2 };

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Authoritative auth check — does a real DB-backed session lookup, unlike
 * proxy.ts's cheap cookie-presence gate. Every server action / route handler
 * that mutates content must call this rather than relying on proxy.ts alone,
 * per Next.js's own guidance that Proxy is a perimeter check, not a
 * substitute for per-request authorization.
 */
export async function requireRole(minRole: Role) {
  const result = await auth.api.getSession({ headers: await headers() });
  if (!result?.user) {
    throw new UnauthorizedError("Not signed in");
  }
  const role = result.user.role as Role;
  if (ROLE_RANK[role] < ROLE_RANK[minRole]) {
    throw new UnauthorizedError(`Requires ${minRole} role`);
  }
  return result;
}
