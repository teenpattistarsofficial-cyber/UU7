import Link from "next/link";
import { headers } from "next/headers";
import { Settings, Plus, MessageSquare, ShieldCheck, Image as ImageIcon, Users2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getVisitorStats,
  getDailyPageViews,
  getTopPages,
  getTopCtaEvents,
  getRecentVisitors,
  getDeviceBreakdown,
  getContentStats,
  getContentIntelligence,
  getSiteHealthCounts,
  getPublishedThisMonth,
  getMonthlyPublishingActivity,
  getMonthlyUploadActivity,
  getMonthlyCommentActivity,
  getCommentStats,
  getMostCommentedPosts,
  getRecentPosts,
  getActivityLog,
  getTopCategoriesByPosts,
  getTopAuthorsByPosts,
  getMediaTypeBreakdown,
  getUserRoleBreakdown,
  type VisitorRange,
} from "@/lib/dashboard/queries";
import { VisitorAnalyticsSection } from "@/components/admin/dashboard/visitor-analytics-section";
import { RecentVisitorsSection } from "@/components/admin/dashboard/recent-visitors-section";
import { ContentOverviewSection } from "@/components/admin/dashboard/content-overview-section";
import { IntelligenceHealthSection } from "@/components/admin/dashboard/intelligence-health-section";
import { MonthlyActivityCharts, RecentPostsSection, ActivityLogSection } from "@/components/admin/dashboard/activity-section";
import { TopCategoriesAuthorsSection, MostCommentedMediaTypesSection, UserRolesSnapshotSection } from "@/components/admin/dashboard/top-lists-section";

function isVisitorRange(value: string | undefined): value is VisitorRange {
  return value === "today" || value === "7d" || value === "30d";
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rawRange } = await searchParams;
  const range: VisitorRange = isVisitorRange(rawRange) ? rawRange : "today";

  const session = await auth.api.getSession({ headers: await headers() });

  let dbOk = true;
  let data: {
    visitorStats: Awaited<ReturnType<typeof getVisitorStats>>;
    dailyViews: Awaited<ReturnType<typeof getDailyPageViews>>;
    topPages: Awaited<ReturnType<typeof getTopPages>>;
    topCtaEvents: Awaited<ReturnType<typeof getTopCtaEvents>>;
    recentVisitors: Awaited<ReturnType<typeof getRecentVisitors>>;
    deviceBreakdown: Awaited<ReturnType<typeof getDeviceBreakdown>>;
    contentStats: Awaited<ReturnType<typeof getContentStats>>;
    intelligence: Awaited<ReturnType<typeof getContentIntelligence>>;
    health: Awaited<ReturnType<typeof getSiteHealthCounts>>;
    publishedThisMonth: number;
    publishingActivity: Awaited<ReturnType<typeof getMonthlyPublishingActivity>>;
    uploadActivity: Awaited<ReturnType<typeof getMonthlyUploadActivity>>;
    commentActivity: Awaited<ReturnType<typeof getMonthlyCommentActivity>>;
    commentStats: Awaited<ReturnType<typeof getCommentStats>>;
    mostCommentedPosts: Awaited<ReturnType<typeof getMostCommentedPosts>>;
    recentPosts: Awaited<ReturnType<typeof getRecentPosts>>;
    activityLog: Awaited<ReturnType<typeof getActivityLog>>;
    topCategories: Awaited<ReturnType<typeof getTopCategoriesByPosts>>;
    topAuthors: Awaited<ReturnType<typeof getTopAuthorsByPosts>>;
    mediaTypes: Awaited<ReturnType<typeof getMediaTypeBreakdown>>;
    userRoles: Awaited<ReturnType<typeof getUserRoleBreakdown>>;
  };

  try {
    const [
      visitorStats,
      dailyViews,
      topPages,
      topCtaEvents,
      recentVisitors,
      deviceBreakdown,
      contentStats,
      intelligence,
      health,
      publishedThisMonth,
      publishingActivity,
      uploadActivity,
      commentActivity,
      commentStats,
      mostCommentedPosts,
      recentPosts,
      activityLog,
      topCategories,
      topAuthors,
      mediaTypes,
      userRoles,
    ] = await Promise.all([
      getVisitorStats(range),
      getDailyPageViews(),
      getTopPages("30d"),
      getTopCtaEvents("30d"),
      getRecentVisitors(),
      getDeviceBreakdown(),
      getContentStats(),
      getContentIntelligence(),
      getSiteHealthCounts(),
      getPublishedThisMonth(),
      getMonthlyPublishingActivity(),
      getMonthlyUploadActivity(),
      getMonthlyCommentActivity(),
      getCommentStats(),
      getMostCommentedPosts(),
      getRecentPosts(),
      getActivityLog(),
      getTopCategoriesByPosts(),
      getTopAuthorsByPosts(),
      getMediaTypeBreakdown(),
      getUserRoleBreakdown(),
    ]);
    data = {
      visitorStats,
      dailyViews,
      topPages,
      topCtaEvents,
      recentVisitors,
      deviceBreakdown,
      contentStats,
      intelligence,
      health,
      publishedThisMonth,
      publishingActivity,
      uploadActivity,
      commentActivity,
      commentStats,
      mostCommentedPosts,
      recentPosts,
      activityLog,
      topCategories,
      topAuthors,
      mediaTypes,
      userRoles,
    };
  } catch {
    dbOk = false;
    data = {
      visitorStats: { pageViews: 0, uniqueSessions: 0, ctaClicks: 0 },
      dailyViews: [],
      topPages: [],
      topCtaEvents: [],
      recentVisitors: [],
      deviceBreakdown: [],
      contentStats: {
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        pageCount: 0,
        categoryCount: 0,
        authorCount: 0,
        mediaCount: 0,
        mediaSizeBytes: 0,
        userCount: 0,
        faqCount: 0,
        redirectCount: 0,
        ctaCount: 0,
        contactChannelCount: 0,
      },
      intelligence: { avgSeoScore: 0, missingTitles: 0, missingMeta: 0, missingImages: 0, staleDrafts: 0 },
      health: { publishedPosts: 0, draftPosts: 0, trashedPosts: 0, totalComments: 0 },
      publishedThisMonth: 0,
      publishingActivity: [],
      uploadActivity: [],
      commentActivity: [],
      commentStats: { pending: 0, approved: 0, rejected: 0, approvalRate: null },
      mostCommentedPosts: [],
      recentPosts: [],
      activityLog: [],
      topCategories: [],
      topAuthors: [],
      mediaTypes: [],
      userRoles: [],
    };
  }

  const {
    visitorStats,
    dailyViews,
    topPages,
    topCtaEvents,
    recentVisitors,
    deviceBreakdown,
    contentStats,
    intelligence,
    health,
    publishedThisMonth,
    publishingActivity,
    uploadActivity,
    commentActivity,
    commentStats,
    mostCommentedPosts,
    recentPosts,
    activityLog,
    topCategories,
    topAuthors,
    mediaTypes,
    userRoles,
  } = data;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Command Center</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusPill ok label={dbOk ? "Online" : "Degraded"} />
            <StatusPill ok={dbOk} label={dbOk ? "DB OK" : "DB error"} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Publishing, SEO health &amp; team activity · Signed in as {session?.user?.email}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/settings" className={cn(buttonVariants({ variant: "outline" }), "gap-1.5 rounded-full")}>
            <Settings className="size-4" />
            Settings
          </Link>
          <Link href="/admin/posts/new" className={cn(buttonVariants({ variant: "brand" }), "gap-1.5 rounded-full")}>
            <Plus className="size-4" />
            Write post
          </Link>
        </div>
      </div>

      <VisitorAnalyticsSection range={range} stats={visitorStats} dailyViews={dailyViews} topPages={topPages} topCtaEvents={topCtaEvents} />

      <RecentVisitorsSection visitors={recentVisitors} deviceBreakdown={deviceBreakdown} />

      <ContentOverviewSection
        totalPosts={contentStats.totalPosts}
        publishedPosts={contentStats.publishedPosts}
        draftPosts={contentStats.draftPosts}
        pendingComments={commentStats.pending}
        mediaCount={contentStats.mediaCount}
        mediaSizeBytes={contentStats.mediaSizeBytes}
        userCount={contentStats.userCount}
        faqCount={contentStats.faqCount}
        redirectCount={contentStats.redirectCount}
        ctaCount={contentStats.ctaCount}
        contactChannelCount={contentStats.contactChannelCount}
      />

      <IntelligenceHealthSection
        intelligence={intelligence}
        dbOk={dbOk}
        health={health}
        publishedThisMonth={publishedThisMonth}
        commentApprovalRate={commentStats.approvalRate}
      />

      <MonthlyActivityCharts publishing={publishingActivity} comments={commentActivity} uploads={uploadActivity} />

      <RecentPostsSection posts={recentPosts} />

      <ActivityLogSection entries={activityLog} />

      <TopCategoriesAuthorsSection categories={topCategories} authors={topAuthors} />

      <MostCommentedMediaTypesSection mostCommented={mostCommentedPosts} mediaTypes={mediaTypes} />

      <UserRolesSnapshotSection
        roles={userRoles}
        snapshot={[
          {
            icon: MessageSquare,
            label: `${commentStats.pending} comment${commentStats.pending === 1 ? "" : "s"} awaiting moderation`,
          },
          { icon: ShieldCheck, label: `${intelligence.missingTitles + intelligence.missingMeta} posts missing core SEO fields` },
          { icon: ImageIcon, label: `${contentStats.mediaCount} media items in the library` },
          {
            icon: Users2,
            label: `${contentStats.userCount} active team account${contentStats.userCount === 1 ? "" : "s"} available`,
          },
        ]}
      />
    </div>
  );
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        ok ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600" : "border-destructive/20 bg-destructive/10 text-destructive",
      )}
    >
      <span className={cn("size-1.5 rounded-full", ok ? "bg-emerald-500" : "bg-destructive")} />
      {label}
    </span>
  );
}
