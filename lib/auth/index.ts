import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { user, session, account, verification } from "@/lib/db/schema";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "author",
        // Never settable through the public auth API — role changes only
        // happen via a direct DB write (seed script) or a future
        // admin-only Users screen, so a signed-up user can never grant
        // themselves elevated access.
        input: false,
      },
    },
  },
  // Must run last so its cookie-setting hooks see the final response.
  plugins: [nextCookies()],
});

export type Role = "admin" | "editor" | "author";
