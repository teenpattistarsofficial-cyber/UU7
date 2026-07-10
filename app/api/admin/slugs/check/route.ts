import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, pages, categories } from "@/lib/db/schema";
import { requireRole, UnauthorizedError } from "@/lib/auth/guards";

export async function GET(request: NextRequest) {
  try {
    await requireRole("author");
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    throw err;
  }

  const { searchParams } = request.nextUrl;
  const slug = searchParams.get("slug")?.trim();
  const type = searchParams.get("type");
  const excludeId = searchParams.get("excludeId") || undefined;

  if (!slug || (type !== "post" && type !== "page" && type !== "category")) {
    return NextResponse.json({ error: "slug and type=post|page|category are required" }, { status: 400 });
  }

  if (type === "post") {
    // Posts live at /${categorySlug}/${postSlug} — a different, two-segment
    // namespace from pages/categories below, so they can never collide with
    // either and only need to check themselves.
    const existing = await db.query.posts.findFirst({
      where: excludeId ? and(eq(posts.slug, slug), ne(posts.id, excludeId)) : eq(posts.slug, slug),
    });
    return NextResponse.json({ available: !existing });
  }

  // Pages and categories share the exact same flat "/${slug}" URL —
  // app/(site)/[category]/page.tsx checks `categories` first and only
  // falls back to `pages` if no category matches. Each table's own unique
  // constraint only stops that table from colliding with itself; nothing
  // previously stopped a new page from colliding with an existing category
  // (silently making the page unreachable forever, always shadowed by the
  // category) or a new category from colliding with an existing page
  // (silently taking over — and un-publishing — that page's URL). Checking
  // both tables regardless of which `type` is being edited is what actually
  // prevents either direction of that silent collision.
  const [pageMatch, categoryMatch] = await Promise.all([
    db.query.pages.findFirst({
      where:
        excludeId && type === "page" ? and(eq(pages.slug, slug), ne(pages.id, excludeId)) : eq(pages.slug, slug),
    }),
    db.query.categories.findFirst({
      where:
        excludeId && type === "category"
          ? and(eq(categories.slug, slug), ne(categories.id, excludeId))
          : eq(categories.slug, slug),
    }),
  ]);

  return NextResponse.json({ available: !pageMatch && !categoryMatch });
}
