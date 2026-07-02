import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";

// One-time bootstrap for the first admin account. Role escalation is
// intentionally NOT exposed through the public auth API (see
// lib/auth/index.ts's `input: false` on the role field) — this script is the
// only place that promotes a user to admin, via a direct DB write.
async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@uu7.io";
  const password = process.env.SEED_ADMIN_PASSWORD ?? randomBytes(12).toString("base64url");

  const existing = await db.query.user.findFirst({ where: eq(user.email, email) });
  if (existing) {
    console.log(`User ${email} already exists (role: ${existing.role}). Nothing to do.`);
    process.exit(0);
  }

  const result = await auth.api.signUpEmail({
    body: { name: "Admin", email, password },
  });

  await db.update(user).set({ role: "admin" }).where(eq(user.id, result.user.id));

  console.log("Seeded admin user:");
  console.log(`  email:    ${email}`);
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.log(`  password: ${password}  (generated — save this, it won't be shown again)`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
