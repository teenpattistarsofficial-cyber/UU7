import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { analyticsSnapshots, searchQueriesSnapshot } from "@/lib/db/schema";
import { isAnalyticsConfigured, getGscSiteUrl, getGa4PropertyId } from "@/lib/analytics/config";
import { fetchDailyTraffic } from "@/lib/analytics/ga4-client";
import { fetchSearchQueries } from "@/lib/analytics/gsc-client";

// Meant to run nightly (cron/systemd timer on the VPS, per the Phase 8
// deployment plan) for the previous UTC day — GSC/GA4 data for "today" is
// still partial while the day is in progress.
function yesterdayUtc(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

async function main() {
  if (!isAnalyticsConfigured()) {
    console.error(
      "Analytics isn't configured — set GOOGLE_SERVICE_ACCOUNT_CREDENTIALS, GSC_SITE_URL, and GA4_PROPERTY_ID.",
    );
    process.exit(1);
  }

  const date = yesterdayUtc();
  const siteUrl = getGscSiteUrl();
  const propertyId = getGa4PropertyId();

  const [traffic, queries] = await Promise.all([
    fetchDailyTraffic(propertyId, date, date),
    fetchSearchQueries(siteUrl, date, date),
  ]);

  await db
    .insert(analyticsSnapshots)
    .values({ date, ...traffic })
    .onConflictDoUpdate({ target: analyticsSnapshots.date, set: traffic });

  // Full-replace for the day, same pattern as every other sync function in
  // this codebase — safe to rerun the job for a given date without
  // duplicating rows.
  await db.delete(searchQueriesSnapshot).where(eq(searchQueriesSnapshot.date, date));
  if (queries.length > 0) {
    await db.insert(searchQueriesSnapshot).values(queries.map((q) => ({ date, ...q })));
  }

  console.log(`Synced analytics for ${date}: ${traffic.sessions} sessions, ${queries.length} query rows.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
