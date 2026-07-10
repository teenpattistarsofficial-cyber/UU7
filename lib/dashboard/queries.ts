import "server-only";
import { and, asc, desc, eq, gte, inArray, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  posts,
  pages,
  categories,
  authors,
  media,
  user,
  seoMeta,
  postFaqs,
  postCtas,
  redirects,
  contactChannels,
  pageViews,
  ctaClicks,
  auditLog,
  comments,
} from "@/lib/db/schema";
import { computeSeoScore } from "@/lib/seo/score";
import { toTiptapDoc } from "@/lib/editor/doc";

export type VisitorRange = "today" | "7d" | "30d";

function rangeStart(range: VisitorRange): Date {
  const now = new Date();
  if (range === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  const days = range === "7d" ? 7 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

// --- Visitor analytics (first-party, lib/tracking/log-page-view.ts) ---

export async function getVisitorStats(range: VisitorRange) {
  const since = rangeStart(range);
  const rows = await db.select({ visitorId: pageViews.visitorId }).from(pageViews).where(gte(pageViews.createdAt, since));
  const uniqueSessions = new Set(rows.map((r) => r.visitorId)).size;
  const [ctaCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(ctaClicks)
    .where(gte(ctaClicks.createdAt, since));
  return { pageViews: rows.length, uniqueSessions, ctaClicks: ctaCount?.count ?? 0 };
}

// Daily page-view counts for the last 7 calendar days (including today) —
// used for the "views over time" bar chart regardless of which range tab
// is active, so there's always a stable week-over-week shape to look at.
export async function getDailyPageViews(days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);
  const rows = await db
    .select({ day: sql<string>`to_char(${pageViews.createdAt}, 'YYYY-MM-DD')`, count: sql<number>`count(*)::int` })
    .from(pageViews)
    .where(gte(pageViews.createdAt, since))
    .groupBy(sql`1`)
    .orderBy(sql`1`);
  const byDay = new Map(rows.map((r) => [r.day, r.count]));
  const result: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, count: byDay.get(key) ?? 0 });
  }
  return result;
}

export async function getTopPages(range: VisitorRange, limit = 5) {
  const since = rangeStart(range);
  const rows = await db
    .select({ path: pageViews.path, count: sql<number>`count(*)::int` })
    .from(pageViews)
    .where(gte(pageViews.createdAt, since))
    .groupBy(pageViews.path)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
  return rows;
}

export async function getTopCtaEvents(range: VisitorRange, limit = 5) {
  const since = rangeStart(range);
  const rows = await db
    .select({ label: ctaClicks.ctaLabel, count: sql<number>`count(*)::int` })
    .from(ctaClicks)
    .where(gte(ctaClicks.createdAt, since))
    .groupBy(ctaClicks.ctaLabel)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
  return rows;
}

export async function getRecentVisitors(limit = 8) {
  // Most-recent row per visitor, plus their total visit count — a plain
  // GROUP BY can't give "last page" alongside an aggregate cleanly, so this
  // pulls a generous recent window and reduces it in JS instead of a
  // window-function query, which is plenty fast at this data volume.
  const rows = await db
    .select({
      visitorId: pageViews.visitorId,
      path: pageViews.path,
      ip: pageViews.ip,
      device: pageViews.device,
      createdAt: pageViews.createdAt,
    })
    .from(pageViews)
    .orderBy(desc(pageViews.createdAt))
    .limit(500);

  const byVisitor = new Map<string, { path: string; ip: string | null; device: string; lastSeen: Date; visits: number }>();
  for (const row of rows) {
    const existing = byVisitor.get(row.visitorId);
    if (existing) {
      existing.visits += 1;
    } else {
      byVisitor.set(row.visitorId, { path: row.path, ip: row.ip, device: row.device, lastSeen: row.createdAt, visits: 1 });
    }
  }
  return [...byVisitor.entries()].slice(0, limit).map(([visitorId, v]) => ({ visitorId, ...v }));
}

export async function getDeviceBreakdown() {
  const rows = await db
    .select({ device: pageViews.device, count: sql<number>`count(*)::int` })
    .from(pageViews)
    .groupBy(pageViews.device)
    .orderBy(desc(sql`count(*)`));
  const total = rows.reduce((sum, r) => sum + r.count, 0);
  return rows.map((r) => ({ device: r.device, count: r.count, pct: total > 0 ? Math.round((r.count / total) * 100) : 0 }));
}

// --- Content stats ---

export async function getContentStats() {
  const [postCounts, pageCount, categoryCount, authorCount, mediaAgg, userCount, faqCount, redirectCount, ctaCount, contactChannelCount] =
    await Promise.all([
      db
        .select({ status: posts.status, count: sql<number>`count(*)::int` })
        .from(posts)
        .where(isNull(posts.deletedAt))
        .groupBy(posts.status),
      db.$count(pages, isNull(pages.deletedAt)),
      db.$count(categories, isNull(categories.deletedAt)),
      db.$count(authors, isNull(authors.deletedAt)),
      db.select({ count: sql<number>`count(*)::int`, totalSize: sql<number>`coalesce(sum(${media.size}), 0)::bigint` }).from(media),
      db.$count(user),
      db.$count(postFaqs),
      db.$count(redirects),
      db.$count(postCtas),
      db.$count(contactChannels),
    ]);

  const published = postCounts.find((p) => p.status === "published")?.count ?? 0;
  const draft = postCounts.find((p) => p.status === "draft")?.count ?? 0;
  const totalPosts = postCounts.reduce((sum, p) => sum + p.count, 0);

  return {
    totalPosts,
    publishedPosts: published,
    draftPosts: draft,
    pageCount,
    categoryCount,
    authorCount,
    mediaCount: Number(mediaAgg[0]?.count ?? 0),
    mediaSizeBytes: Number(mediaAgg[0]?.totalSize ?? 0),
    userCount,
    faqCount,
    redirectCount,
    ctaCount,
    contactChannelCount,
  };
}

// --- Content Intelligence (SEO health) ---

export async function getContentIntelligence() {
  const [livePosts, livePages, postSeoRows, pageSeoRows] = await Promise.all([
    db.query.posts.findMany({ where: isNull(posts.deletedAt) }),
    db.query.pages.findMany({ where: isNull(pages.deletedAt) }),
    db.select().from(seoMeta).where(eq(seoMeta.entityType, "post")),
    db.select().from(seoMeta).where(eq(seoMeta.entityType, "page")),
  ]);

  const postSeoById = new Map(postSeoRows.map((s) => [s.entityId, s]));
  const pageSeoById = new Map(pageSeoRows.map((s) => [s.entityId, s]));

  let missingTitles = 0;
  let missingMeta = 0;
  let missingImages = 0;
  let staleDrafts = 0;
  let scoreSum = 0;
  let scoreCount = 0;

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  for (const p of livePosts) {
    const seo = postSeoById.get(p.id);
    if (!(seo?.seoTitle || p.title)) missingTitles++;
    if (!seo?.metaDescription) missingMeta++;
    if (!p.featuredImageUrl) missingImages++;
    if (p.status === "draft" && p.updatedAt < fourteenDaysAgo) staleDrafts++;
    scoreSum += computeSeoScore({
      title: p.title,
      slug: p.slug,
      content: toTiptapDoc(p.content),
      seo,
      featuredImageUrl: p.featuredImageUrl,
    });
    scoreCount++;
  }

  for (const p of livePages) {
    const seo = pageSeoById.get(p.id);
    if (!(seo?.seoTitle || p.title)) missingTitles++;
    if (!seo?.metaDescription) missingMeta++;
    if (p.status === "draft" && p.updatedAt < fourteenDaysAgo) staleDrafts++;
    scoreSum += computeSeoScore({ title: p.title, slug: p.slug, content: toTiptapDoc(p.content), seo });
    scoreCount++;
  }

  return {
    avgSeoScore: scoreCount > 0 ? Math.round(scoreSum / scoreCount) : 0,
    missingTitles,
    missingMeta,
    missingImages,
    staleDrafts,
  };
}

// --- Site health / engagement ---

export async function getSiteHealthCounts() {
  const [postCounts, totalComments] = await Promise.all([
    db
      .select({ status: posts.status, deletedAt: posts.deletedAt, count: sql<number>`count(*)::int` })
      .from(posts)
      .groupBy(posts.status, posts.deletedAt),
    db.$count(comments),
  ]);

  let published = 0;
  let draft = 0;
  let trashed = 0;
  for (const row of postCounts) {
    if (row.deletedAt) {
      trashed += row.count;
    } else if (row.status === "published") {
      published += row.count;
    } else if (row.status === "draft") {
      draft += row.count;
    }
  }

  return { publishedPosts: published, draftPosts: draft, trashedPosts: trashed, totalComments };
}

// --- Comments ---

export async function getCommentStats() {
  const rows = await db.select({ status: comments.status, count: sql<number>`count(*)::int` }).from(comments).groupBy(comments.status);
  const pending = rows.find((r) => r.status === "pending")?.count ?? 0;
  const approved = rows.find((r) => r.status === "approved")?.count ?? 0;
  const rejected = rows.find((r) => r.status === "rejected")?.count ?? 0;
  const moderated = approved + rejected;
  return {
    pending,
    approved,
    rejected,
    // Undefined (not 0) when nothing's been moderated yet — 0% would read
    // as "every comment got rejected," which isn't true when the real
    // answer is "no data yet."
    approvalRate: moderated > 0 ? Math.round((approved / moderated) * 100) : null,
  };
}

export async function getMonthlyCommentActivity(months = 6) {
  const buckets = lastNMonths(months);
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const rows = await db
    .select({ month: sql<string>`to_char(${comments.createdAt}, 'YYYY-MM')`, count: sql<number>`count(*)::int` })
    .from(comments)
    .where(gte(comments.createdAt, since))
    .groupBy(sql`1`);

  const byMonth = new Map(rows.map((r) => [r.month, r.count]));
  return buckets.map((b) => ({ label: b.label, count: byMonth.get(b.key) ?? 0 }));
}

export async function getMostCommentedPosts(limit = 5) {
  const rows = await db
    .select({ postId: comments.postId, count: sql<number>`count(*)::int` })
    .from(comments)
    .groupBy(comments.postId)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
  if (rows.length === 0) return [];
  const postIds = rows.map((r) => r.postId);
  const postRows = await db.select({ id: posts.id, title: posts.title }).from(posts).where(inArray(posts.id, postIds));
  const titleById = new Map(postRows.map((p) => [p.id, p.title]));
  return rows.map((r) => ({ title: titleById.get(r.postId) ?? "Unknown post", count: r.count }));
}

export async function getPublishedThisMonth() {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const rows = await db
    .select({ id: posts.id })
    .from(posts)
    .where(and(eq(posts.status, "published"), gte(posts.publishedAt, start), isNull(posts.deletedAt)));
  return rows.length;
}

// --- Monthly activity (last 6 months) ---

function lastNMonths(n: number): { key: string; label: string }[] {
  const result: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: d.toLocaleString("en-US", { month: "short" }) });
  }
  return result;
}

export async function getMonthlyPublishingActivity(months = 6) {
  const buckets = lastNMonths(months);
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const rows = await db
    .select({ month: sql<string>`to_char(${posts.publishedAt}, 'YYYY-MM')`, count: sql<number>`count(*)::int` })
    .from(posts)
    .where(and(eq(posts.status, "published"), gte(posts.publishedAt, since)))
    .groupBy(sql`1`);

  const byMonth = new Map(rows.map((r) => [r.month, r.count]));
  return buckets.map((b) => ({ label: b.label, count: byMonth.get(b.key) ?? 0 }));
}

export async function getMonthlyUploadActivity(months = 6) {
  const buckets = lastNMonths(months);
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const rows = await db
    .select({ month: sql<string>`to_char(${media.createdAt}, 'YYYY-MM')`, count: sql<number>`count(*)::int` })
    .from(media)
    .where(gte(media.createdAt, since))
    .groupBy(sql`1`);

  const byMonth = new Map(rows.map((r) => [r.month, r.count]));
  return buckets.map((b) => ({ label: b.label, count: byMonth.get(b.key) ?? 0 }));
}

// --- Recent posts / activity log ---

export async function getRecentPosts(limit = 5) {
  const rows = await db.query.posts.findMany({
    where: isNull(posts.deletedAt),
    orderBy: (p, { desc: d }) => d(p.updatedAt),
    limit,
  });
  const authorIds = rows.map((r) => r.authorId).filter((id): id is string => Boolean(id));
  const authorRows = authorIds.length ? await db.select().from(authors).where(inArray(authors.id, authorIds)) : [];
  const authorById = new Map(authorRows.map((a) => [a.id, a]));
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    status: r.status,
    updatedAt: r.updatedAt,
    authorName: r.authorId ? (authorById.get(r.authorId)?.displayName ?? null) : null,
  }));
}

export async function getActivityLog(limit = 25) {
  return db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(limit);
}

// --- Top lists ---

export async function getTopCategoriesByPosts(limit = 5) {
  const rows = await db
    .select({ id: categories.id, name: categories.name, count: sql<number>`count(${posts.id})::int` })
    .from(categories)
    .leftJoin(posts, and(eq(posts.categoryId, categories.id), isNull(posts.deletedAt)))
    .where(isNull(categories.deletedAt))
    .groupBy(categories.id, categories.name)
    .orderBy(desc(sql`count(${posts.id})`))
    .limit(limit);
  return rows;
}

export async function getTopAuthorsByPosts(limit = 5) {
  const rows = await db
    .select({ id: authors.id, name: authors.displayName, count: sql<number>`count(${posts.id})::int` })
    .from(authors)
    .leftJoin(posts, and(eq(posts.authorId, authors.id), isNull(posts.deletedAt)))
    .where(isNull(authors.deletedAt))
    .groupBy(authors.id, authors.displayName)
    .orderBy(desc(sql`count(${posts.id})`))
    .limit(limit);
  return rows;
}

export async function getMediaTypeBreakdown() {
  const rows = await db
    .select({ mimeType: media.mimeType, count: sql<number>`count(*)::int` })
    .from(media)
    .groupBy(media.mimeType)
    .orderBy(desc(sql`count(*)`));
  return rows;
}

export async function getUserRoleBreakdown() {
  const rows = await db.select({ role: user.role, count: sql<number>`count(*)::int` }).from(user).groupBy(user.role).orderBy(asc(user.role));
  return rows;
}
