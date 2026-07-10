import Link from "next/link";
import { ArrowLeft, Search, SearchX } from "lucide-react";
import { SITE_CATEGORIES } from "@/lib/site-categories";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Shared body for both 404 boundaries — app/(site)/not-found.tsx (the one
 * that actually matters: every real-world case here is a public route
 * explicitly calling `notFound()` for a missing category/post/page, e.g.
 * [category]/[slug]/page.tsx) and the root app/not-found.tsx fallback for
 * the rare path that matches no route pattern at all. Ties into the search
 * feature just shipped (lib/posts/search.ts) rather than just dead-ending
 * the visitor — the same /search form the hero uses, plus quick links to
 * every category so there's always a next step besides hitting back.
 */
export function NotFoundContent() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:py-28">
      <span className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
        <SearchX className="size-8" />
      </span>

      <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-brand uppercase">404</p>
      <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">We couldn&apos;t find that page</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        The guide you&apos;re looking for may have been renamed, moved, or never existed. Try searching for it, or
        head back to the homepage.
      </p>

      <form
        action="/search"
        className="mt-8 flex w-full max-w-md items-center gap-1.5 rounded-full border border-border bg-card p-1.5 shadow-sm"
      >
        <Search className="ml-2 size-4 shrink-0 text-muted-foreground" />
        <Input
          name="q"
          placeholder="Search guides…"
          className="border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
        <Button type="submit" size="icon" className="shrink-0 rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
          <Search className="size-4" />
        </Button>
      </form>

      <Link href="/" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline">
        <ArrowLeft className="size-4" />
        Back to homepage
      </Link>

      <div className="mt-10 flex flex-wrap justify-center gap-2 border-t border-border pt-8">
        {SITE_CATEGORIES.map((category) => (
          <Link
            key={category.href}
            href={category.href}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:border-brand/40 hover:text-brand"
          >
            <category.icon className="size-3.5" />
            {category.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
