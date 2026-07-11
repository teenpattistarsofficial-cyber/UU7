import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Cached on `globalThis` in development so Next's hot-reload re-evaluating
// this module doesn't open a brand-new postgres.js pool every time without
// ever closing the previous one — over a long dev session that silently
// exhausts Postgres's connection limit ("sorry, too many clients already")
// with connections no code still holds a reference to, since it's a
// module-level `const`, not something HMR's disposal hooks can reach. In
// production this file is only evaluated once per process anyway, so the
// cache is a no-op there.
const globalForDb = globalThis as unknown as { __dbClient?: postgres.Sql };

function createDb(): PostgresJsDatabase<typeof schema> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  // Default pool size (10) is narrower than the dashboard actually needs —
  // its page.tsx fires ~20 queries in one Promise.all, plus the admin
  // layout's own session+settings lookup on every navigation, so roughly
  // half of that page's "concurrent" queries were queuing for a free
  // connection instead of actually running in parallel.
  const client = globalForDb.__dbClient ?? postgres(connectionString, { max: 20 });
  if (process.env.NODE_ENV !== "production") {
    globalForDb.__dbClient = client;
  }
  return drizzle(client, { schema });
}

// Lazy behind a Proxy, not constructed eagerly at module scope — `next
// build`'s "Collecting page data" step imports every route module
// (including API routes, regardless of `force-dynamic`) to read its
// exports, which would otherwise throw here on the very first import since
// the build stage intentionally runs with no DATABASE_URL (see the
// Dockerfile comment). Deferring construction to first property access
// means the connection is only ever attempted once a request actually
// queries the database at runtime, when the env var is really set.
let realDb: PostgresJsDatabase<typeof schema> | undefined;

export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    if (!realDb) realDb = createDb();
    return Reflect.get(realDb as object, prop, receiver);
  },
});
