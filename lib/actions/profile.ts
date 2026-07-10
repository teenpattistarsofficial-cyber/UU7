"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

/**
 * Self-service profile edit — deliberately no requireRole() gate beyond
 * "is signed in", since every role (author/editor/admin) manages their own
 * name/image/password. Role itself is never editable here (Better-Auth's
 * `role` additionalField has `input: false` — see lib/auth/index.ts).
 */
async function requireSession() {
  const result = await auth.api.getSession({ headers: await headers() });
  if (!result?.user) throw new Error("Not signed in");
  return result;
}

export async function updateProfile(values: { name: string; image?: string | null }) {
  await requireSession();
  const requestHeaders = await headers();
  const name = values.name.trim();
  if (!name) throw new Error("Name is required.");

  await auth.api.updateUser({
    headers: requestHeaders,
    body: { name, image: values.image ?? undefined },
  });

  revalidatePath("/admin", "layout");
}

export async function changeOwnPassword(values: { currentPassword: string; newPassword: string }) {
  await requireSession();
  if (values.newPassword.length < 8) throw new Error("New password must be at least 8 characters.");

  await auth.api.changePassword({
    headers: await headers(),
    body: {
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      revokeOtherSessions: true,
    },
  });
}
