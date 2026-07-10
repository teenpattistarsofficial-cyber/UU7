"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { hashPassword } from "better-auth/crypto";
import { db } from "@/lib/db";
import { user, account } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/guards";
import { logActivity } from "@/lib/actions/audit-log";
import type { Role } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export async function createUser(formData: FormData) {
  await requireRole("admin");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "author") as Role;

  if (!name) throw new Error("Name is required.");
  if (!EMAIL_RE.test(email)) throw new Error("A valid email address is required.");
  if (password.length < MIN_PASSWORD_LENGTH) throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  if (!["admin", "editor", "author"].includes(role)) throw new Error("Invalid role.");

  const existing = await db.query.user.findFirst({ where: eq(user.email, email) });
  if (existing) throw new Error("A user with this email already exists.");

  // Mirrors Better-Auth's own sign-up route (better-auth/dist/api/routes/sign-up.mjs):
  // a "credential" account row holding the hashed password, keyed by user id — this is
  // what lets the account created here sign in through the normal email/password flow,
  // same as any self-signed-up user.
  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  const [row] = await db.insert(user).values({ id, name, email, role }).returning();
  await db.insert(account).values({
    id: crypto.randomUUID(),
    accountId: id,
    providerId: "credential",
    userId: id,
    password: passwordHash,
  });

  await logActivity({ action: "user.created", entityType: "user", entityId: id, entityLabel: `${name} (${role})` });
  revalidatePath("/admin/users");
  return row;
}

export async function setUserRole(userId: string, role: Role) {
  const session = await requireRole("admin");
  if (!["admin", "editor", "author"].includes(role)) throw new Error("Invalid role.");
  if (userId === session.user.id) throw new Error("You can't change your own role.");

  const target = await db.query.user.findFirst({ where: eq(user.id, userId) });
  if (!target) throw new Error("User not found.");

  await db.update(user).set({ role, updatedAt: new Date() }).where(eq(user.id, userId));
  await logActivity({ action: "user.role_changed", entityType: "user", entityId: userId, entityLabel: `${target.name} → ${role}` });
  revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
  const session = await requireRole("admin");
  if (userId === session.user.id) throw new Error("You can't delete your own account.");

  const target = await db.query.user.findFirst({ where: eq(user.id, userId) });
  if (!target) throw new Error("User not found.");

  await db.delete(user).where(eq(user.id, userId));
  await logActivity({ action: "user.deleted", entityType: "user", entityId: userId, entityLabel: target.name });
  revalidatePath("/admin/users");
}
