"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";
import { auth } from "@/lib/auth";

// Deliberately best-effort and narrow in scope — covers login plus the
// highest-signal content actions (create/delete), not a blanket log of
// every mutation (bulk actions and updates aren't wired in). A logging
// failure must never break the action it's attached to, so errors are
// swallowed rather than thrown.
export async function logActivity({
  action,
  entityType,
  entityId,
  entityLabel,
}: {
  action: string;
  entityType?: string;
  entityId?: string;
  entityLabel?: string;
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return;
    await db.insert(auditLog).values({
      userId: session.user.id,
      userName: session.user.name || session.user.email,
      action,
      entityType,
      entityId,
      entityLabel,
    });
  } catch {
    // best-effort
  }
}
