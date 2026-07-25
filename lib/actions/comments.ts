"use server";

import { headers } from "next/headers";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { db } from "@/lib/db";
import { comments, posts, categories } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/guards";
import { logActivity } from "@/lib/actions/audit-log";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { invalidatePublicPaths } from "@/lib/cache/invalidate-public-paths";

const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 200;
const MAX_CONTENT_LENGTH = 2000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type CreateCommentResult = { ok: true } | { ok: false; error: string };

// Public — no requireRole, this is a visitor-facing form. Held for
// moderation (status defaults to "pending" — see the schema comment) so
// nothing appears on the live site without an editor approving it first.
export async function createComment(postId: string, formData: FormData): Promise<CreateCommentResult> {
  // Honeypot — a field hidden from real visitors via CSS that bots
  // routinely auto-fill anyway. A non-empty value here means "not human,"
  // and we return a fake success rather than an error so a scripted
  // submitter has no signal to adapt against.
  if (String(formData.get("website") ?? "").trim()) {
    return { ok: true };
  }

  const name = String(formData.get("authorName") ?? "").trim();
  const email = String(formData.get("authorEmail") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!name || name.length > MAX_NAME_LENGTH) {
    return { ok: false, error: `Name is required (max ${MAX_NAME_LENGTH} characters).` };
  }
  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email)) {
    return { ok: false, error: "A valid email address is required." };
  }
  if (!content || content.length > MAX_CONTENT_LENGTH) {
    return { ok: false, error: `Comment is required (max ${MAX_CONTENT_LENGTH} characters).` };
  }

  const post = await db.query.posts.findFirst({ where: eq(posts.id, postId) });
  if (!post) {
    return { ok: false, error: "This post no longer exists." };
  }

  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(`comment:${ip}`)) {
    return { ok: false, error: "Too many comments submitted — try again in a minute." };
  }

  await db.insert(comments).values({ postId, authorName: name, authorEmail: email, content, ipAddress: ip === "unknown" ? null : ip });
  return { ok: true };
}

// --- Admin moderation — all editor-gated ---

async function commentWithPostInfo(id: string) {
  const row = await db.query.comments.findFirst({ where: eq(comments.id, id) });
  if (!row) return null;
  const post = await db.query.posts.findFirst({ where: eq(posts.id, row.postId) });
  const category = post?.categoryId ? await db.query.categories.findFirst({ where: eq(categories.id, post.categoryId) }) : null;
  return { row, postTitle: post?.title ?? null, postSlug: post?.slug ?? null, categorySlug: category?.slug ?? null };
}

function revalidateCommentedPost(categorySlug: string | null | undefined, postSlug: string | null | undefined) {
  if (categorySlug && postSlug) {
    invalidatePublicPaths([`/${categorySlug}/${postSlug}`]);
    // lib/posts/get-post-page-data.ts's cached bundle includes the post's
    // approved comments — tagged "posts" like everything else it reads, so
    // moderating a comment has to bust the same broad tag, not just this
    // one post's route path.
    updateTag("posts");
  }
  revalidatePath("/admin/comments");
}

// Bulk moderation can touch comments spread across many different posts —
// unlike the single-comment actions above, there's no one post path to
// pass in, so this looks up every affected comment's owning post/category
// and invalidates each, deduped (a batch selected from one post's comment
// list is the common case, but bulk-selecting across the whole queue is
// possible too).
async function revalidateCommentedPosts(ids: string[]) {
  const rows = await db.query.comments.findMany({ where: inArray(comments.id, ids) });
  const postIds = [...new Set(rows.map((r) => r.postId))];
  if (postIds.length === 0) return;

  const affectedPosts = await db.query.posts.findMany({ where: inArray(posts.id, postIds) });
  const categoryIds = [...new Set(affectedPosts.map((p) => p.categoryId).filter((id): id is string => Boolean(id)))];
  const affectedCategories = categoryIds.length > 0 ? await db.query.categories.findMany({ where: inArray(categories.id, categoryIds) }) : [];
  const categorySlugById = new Map(affectedCategories.map((c) => [c.id, c.slug]));

  const paths = affectedPosts
    .map((p) => {
      const categorySlug = p.categoryId ? categorySlugById.get(p.categoryId) : null;
      return categorySlug ? `/${categorySlug}/${p.slug}` : null;
    })
    .filter((path): path is string => Boolean(path));
  if (paths.length > 0) {
    invalidatePublicPaths(paths);
    updateTag("posts");
  }
}

export async function approveComment(id: string) {
  await requireRole("editor");
  const found = await commentWithPostInfo(id);
  if (!found) return;
  await db.update(comments).set({ status: "approved" }).where(eq(comments.id, id));
  await logActivity({ action: "comment.approved", entityType: "comment", entityId: id, entityLabel: found.postTitle ?? undefined });
  revalidateCommentedPost(found.categorySlug, found.postSlug);
}

export async function rejectComment(id: string) {
  await requireRole("editor");
  const found = await commentWithPostInfo(id);
  if (!found) return;
  await db.update(comments).set({ status: "rejected" }).where(eq(comments.id, id));
  await logActivity({ action: "comment.rejected", entityType: "comment", entityId: id, entityLabel: found.postTitle ?? undefined });
  revalidateCommentedPost(found.categorySlug, found.postSlug);
}

export async function deleteComment(id: string) {
  await requireRole("editor");
  const found = await commentWithPostInfo(id);
  if (!found) return;
  await db.delete(comments).where(eq(comments.id, id));
  await logActivity({ action: "comment.deleted", entityType: "comment", entityId: id, entityLabel: found.postTitle ?? undefined });
  revalidateCommentedPost(found.categorySlug, found.postSlug);
}

export async function bulkDeleteComments(ids: string[]) {
  await requireRole("editor");
  if (ids.length === 0) return;
  await revalidateCommentedPosts(ids);
  await db.delete(comments).where(inArray(comments.id, ids));
  revalidatePath("/admin/comments");
}

export async function bulkApproveComments(ids: string[]) {
  await requireRole("editor");
  if (ids.length === 0) return;
  await revalidateCommentedPosts(ids);
  await db.update(comments).set({ status: "approved" }).where(inArray(comments.id, ids));
  revalidatePath("/admin/comments");
}

export async function bulkRejectComments(ids: string[]) {
  await requireRole("editor");
  if (ids.length === 0) return;
  await revalidateCommentedPosts(ids);
  await db.update(comments).set({ status: "rejected" }).where(inArray(comments.id, ids));
  revalidatePath("/admin/comments");
}
