import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { searchPosts } from "@/lib/posts/search";
import { PostCard } from "@/components/home/post-card";
import { Breadcrumb } from "@/components/site/breadcrumb";

// Query-driven, no canonical content of its own — kept out of the index
// (matching the existing `/search` disallow in app/robots.ts) so a thin,
// ever-changing results page never competes with the actual guide it's
// pointing to.
export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query ? await searchPosts(query) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Search" }]} />

      <div className="mb-10 flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <Search className="size-6" />
        </span>
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {query ? `Results for “${query}”` : "Search"}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {query
              ? `${results.length} guide${results.length === 1 ? "" : "s"} found.`
              : "Type something into the search bar to find a guide."}
          </p>
        </div>
      </div>

      {query && results.length === 0 ? (
        <p className="text-muted-foreground">
          No guides matched “{query}”. Try a different term, or browse{" "}
          <Link href="/" className="text-brand underline hover:no-underline">
            all guides
          </Link>
          .
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((post, i) => (
            <PostCard key={post.id} post={post} priority={i === 0} />
          ))}
        </div>
      )}
    </div>
  );
}
