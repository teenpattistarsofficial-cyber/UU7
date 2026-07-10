import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { FilterSelect } from "@/components/admin/filter-select";
import { cn } from "@/lib/utils";

export const ADMIN_PAGE_SIZE = 20;

export const PER_PAGE_OPTIONS = [
  { value: "10", label: "10 / page" },
  { value: "20", label: "20 / page" },
  { value: "50", label: "50 / page" },
  { value: "100", label: "100 / page" },
];

const VALID_PAGE_SIZES = new Set(PER_PAGE_OPTIONS.map((o) => Number(o.value)));

/** Parses a `?perPage=` value against the fixed option set — anything else
 * (missing, garbage, or a number not in PER_PAGE_OPTIONS) falls back to the
 * default rather than letting a crafted URL request an arbitrary page size. */
export function parsePerPage(raw: string | undefined): number {
  const n = Number(raw);
  return VALID_PAGE_SIZES.has(n) ? n : ADMIN_PAGE_SIZE;
}

/** Server-renderable (no client state of its own) — every admin list page
 * already drives its filters through the URL (status/q/range via
 * tabHref()-style helpers), so pagination follows the same GET-param
 * convention rather than introducing a different, client-state-based
 * mechanism just for page number. `params` should be the page's current
 * filter values including `perPage` when it's non-default (everything that
 * must survive a page change) — `page` itself is added/omitted here, never
 * passed in. The per-page FilterSelect is a client component embedded here,
 * same pattern as the range filter each page already uses. */
export function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  perPage,
  basePath,
  params,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  if (totalItems === 0) return null;

  function hrefFor(page: number) {
    const usp = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) usp.set(key, value);
    }
    if (page > 1) usp.set("page", String(page));
    const qs = usp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;
  const rangeStart = (currentPage - 1) * perPage + 1;
  const rangeEnd = Math.min(currentPage * perPage, totalItems);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          Showing {rangeStart}–{rangeEnd} of {totalItems}
        </span>
        <div className="w-32">
          <FilterSelect paramName="perPage" options={PER_PAGE_OPTIONS} defaultValue={String(ADMIN_PAGE_SIZE)} />
        </div>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Link
            href={hrefFor(currentPage - 1)}
            aria-disabled={prevDisabled}
            tabIndex={prevDisabled ? -1 : undefined}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1", prevDisabled && "pointer-events-none opacity-50")}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Link>
          <Link
            href={hrefFor(currentPage + 1)}
            aria-disabled={nextDisabled}
            tabIndex={nextDisabled ? -1 : undefined}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1", nextDisabled && "pointer-events-none opacity-50")}
          >
            Next
            <ChevronRight className="size-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

/** Shared page-number parsing + slicing — identical logic every list page
 * needs after building its filtered `rows` array. Clamps to the valid range
 * so a stale `?page=` from before a filter/perPage change (e.g. FilterSelect,
 * which preserves other params) never 404s or renders an empty page
 * silently. */
export function paginate<T>(rows: T[], rawPage: string | undefined, pageSize = ADMIN_PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const requested = Math.max(1, Number(rawPage) || 1);
  const currentPage = Math.min(requested, totalPages);
  const pageRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  return { pageRows, currentPage, totalPages, totalItems: rows.length };
}
