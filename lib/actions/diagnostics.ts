"use server";

import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";

export async function runSystemDiagnostics() {
  await requireRole("admin");

  const dbStart = Date.now();
  let dbOk = true;
  try {
    await db.execute(sql`select 1`);
  } catch {
    dbOk = false;
  }
  const dbLatencyMs = Date.now() - dbStart;

  return {
    nodeVersion: process.version,
    env: process.env.NODE_ENV ?? "development",
    dbOk,
    dbLatencyMs,
    // Node process uptime, not host/container uptime — resets on every
    // restart/deploy, which is the actually useful signal ("has this
    // process been running long enough to trust", not "has the VM").
    uptimeSeconds: process.uptime(),
  };
}
