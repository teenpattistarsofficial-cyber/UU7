import type { Metadata } from "next";
import { getPublishedPageBySlug } from "@/lib/pages/get-page";
import { buildMetadata } from "@/lib/seo/metadata";
import { CmsPageBody } from "@/components/site/cms-page";

const SLUG = "about";
const FALLBACK_TITLE = "About UU7";

// No dynamic params here, so without `force-dynamic` Next would try to
// statically prerender this at `next build` time — same class of bug fixed
// on the homepage/authors/sitemap routes (see their comments).
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const result = await getPublishedPageBySlug(SLUG);
  if (!result) return { title: FALLBACK_TITLE };
  return buildMetadata({ seo: result.seo, fallbackTitle: result.page.title, path: `/${SLUG}` });
}

// Falls back to placeholder copy until an editor actually publishes an
// "about" page in the admin — the /admin/pages CRUD only just got wired to
// this route; a fresh install has an empty `pages` table.
export default async function AboutPage() {
  const result = await getPublishedPageBySlug(SLUG);
  if (!result) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-4 text-3xl font-semibold">{FALLBACK_TITLE}</h1>
        <p className="text-muted-foreground">
          Our mission, educational purpose, and editorial methodology will be published here.
        </p>
      </div>
    );
  }
  return <CmsPageBody title={result.page.title} content={result.page.content} />;
}
