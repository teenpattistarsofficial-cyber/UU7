import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, pages } from "@/lib/db/schema";
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

  if (!slug || (type !== "post" && type !== "page")) {
    return NextResponse.json({ error: "slug and type=post|page are required" }, { status: 400 });
  }

  const table = type === "post" ? posts : pages;
  const conditions = excludeId
    ? and(eq(table.slug, slug), ne(table.id, excludeId))
    : eq(table.slug, slug);

  const existing =
    type === "post"
      ? await db.query.posts.findFirst({ where: conditions })
      : await db.query.pages.findFirst({ where: conditions });

  return NextResponse.json({ available: !existing });
}
