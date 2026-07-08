import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Cached on `globalThis` in development so Next's hot-reload re-evaluating
// this module doesn't open a brand-new postgres.js pool every time without
// ever closing the previous one — over a long dev session that silently
// exhausts Postgres's connection limit ("sorry, too many clients already")
// with connections no code still holds a reference to, since it's a
// module-level `const`, not something HMR's disposal hooks can reach. In
// production this file is only evaluated once per process anyway, so the
// cache is a no-op there.
const globalForDb = globalThis as unknown as { __dbClient?: postgres.Sql };

const client = globalForDb.__dbClient ?? postgres(connectionString);
if (process.env.NODE_ENV !== "production") {
  globalForDb.__dbClient = client;
}

export const db = drizzle(client, { schema });
