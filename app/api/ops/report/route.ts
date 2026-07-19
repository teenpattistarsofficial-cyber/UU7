import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { analyticsSnapshots, searchQueriesSnapshot } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { verifyPublishToken } from "@/lib/publish/auth";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { isAnalyticsConfigured } from "@/lib/analytics/config";
import {
  getVisitorStats,
  getDailyPageViews,
  getTopPages,
  getTopCtaEvents,
  getDeviceBreakdown,
  getContentStats,
  getContentIntelligence,
  getSiteHealthCounts,
  getPublishedThisMonth,
  getRecentPosts,
  getMonthlyPublishingActivity,
  getTopCategoriesByPosts,
  getTopAuthorsByPosts,
  getCommentStats,
  getMostCommentedPosts,
  getActivityLog,
  type VisitorRange,
} from "@/lib/dashboard/queries";

export const runtime = "nodejs";

// Read-only, same bearer-token auth as the other /api/ops/* and
// /api/publish/* routes. Every function called here already exists in
// lib/dashboard/queries.ts to power the admin dashboard — this route is
// just a thin aggregation layer over data that already exists, not new
// query logic, so an ops-agent conversation can pull the same picture the
// admin sees without logging in.
export async function GET(request: NextRequest) {
  if (!process.env.PUBLISH_API_TOKEN) {
    return NextResponse.json({ error: "PUBLISH_API_TOKEN not configured on server" }, { status: 500 });
  }
  if (!verifyPublishToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!checkRateLimit("publish-api")) {
    return NextResponse.json({ error: "Rate limit exceeded, try again shortly" }, { status: 429 });
  }

  const trafficRangeParam = request.nextUrl.searchParams.get("trafficRange");
  const trafficRange: VisitorRange =
    trafficRangeParam === "today" || trafficRangeParam === "30d" ? trafficRangeParam : "7d";

  const [
    visitorStats30d,
    visitorStatsRange,
    dailyPageViews,
    topPages,
    topCtaEvents,
    deviceBreakdown,
    contentStats,
    contentIntelligence,
    siteHealthCounts,
    publishedThisMonth,
    recentPosts,
    monthlyPublishingActivity,
    topCategories,
    topAuthors,
    commentStats,
    mostCommentedPosts,
    activityLog,
    latestAnalyticsSnapshots,
    latestSearchQueries,
  ] = await Promise.all([
    getVisitorStats("30d"),
    getVisitorStats(trafficRange),
    getDailyPageViews(14),
    getTopPages(trafficRange, 10),
    getTopCtaEvents(trafficRange, 5),
    getDeviceBreakdown(),
    getContentStats(),
    getContentIntelligence(),
    getSiteHealthCounts(),
    getPublishedThisMonth(),
    getRecentPosts(5),
    getMonthlyPublishingActivity(6),
    getTopCategoriesByPosts(5),
    getTopAuthorsByPosts(5),
    getCommentStats(),
    getMostCommentedPosts(5),
    getActivityLog(25),
    db.select().from(analyticsSnapshots).orderBy(desc(analyticsSnapshots.date)).limit(14),
    db.select().from(searchQueriesSnapshot).orderBy(desc(searchQueriesSnapshot.date)).limit(50),
  ]);

  return NextResponse.json({
    traffic: {
      range: trafficRange,
      last30Days: visitorStats30d,
      rangeStats: visitorStatsRange,
      dailyPageViews,
      topPages,
      topCtaEvents,
      deviceBreakdown,
    },
    content: {
      stats: contentStats,
      seoHealth: contentIntelligence,
      siteHealthCounts,
      publishedThisMonth,
      recentPosts,
      monthlyPublishingActivity,
      topCategories,
      topAuthors,
    },
    comments: {
      stats: commentStats,
      mostCommentedPosts,
    },
    activityLog,
    analytics: {
      configured: isAnalyticsConfigured(),
      dailySnapshots: latestAnalyticsSnapshots,
      topSearchQueries: latestSearchQueries,
      note: isAnalyticsConfigured()
        ? latestAnalyticsSnapshots.length === 0
          ? "GA4/Search Console are configured but scripts/jobs/sync-analytics.ts hasn't run yet — no snapshots synced."
          : undefined
        : "GA4/Search Console aren't configured on this server (GOOGLE_SERVICE_ACCOUNT_CREDENTIALS/GSC_SITE_URL/GA4_PROPERTY_ID unset) — this section is empty, not just quiet.",
    },
  });
}
