"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, Pencil, Trash2, StickyNote } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/admin/form-select";
import { SeoScoreBadge, StatusBadge } from "@/components/admin/list-badges";
import { bulkDeletePages, bulkSetPageStatus, deletePage } from "@/lib/actions/pages";

export type PageRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  template: string;
  seoScore: number;
};

const BULK_ACTIONS = [
  { value: "publish", label: "Publish" },
  { value: "draft", label: "Move to draft" },
  { value: "archive", label: "Archive" },
  { value: "delete", label: "Delete" },
];

export function PagesTable({ rows }: { rows: PageRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [pending, startTransition] = useTransition();

  const allSelected = rows.length > 0 && selected.size === rows.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function applyBulkAction() {
    if (!bulkAction || selected.size === 0) return;
    const ids = [...selected];
    startTransition(async () => {
      try {
        if (bulkAction === "delete") {
          await bulkDeletePages(ids);
        } else if (bulkAction === "publish") {
          await bulkSetPageStatus(ids, "published");
        } else if (bulkAction === "draft") {
          await bulkSetPageStatus(ids, "draft");
        } else if (bulkAction === "archive") {
          await bulkSetPageStatus(ids, "archived");
        }
        toast.success(`Applied "${BULK_ACTIONS.find((a) => a.value === bulkAction)?.label}" to ${ids.length} page(s)`);
        setSelected(new Set());
        setBulkAction("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Bulk action failed");
      }
    });
  }

  async function handleSingleDelete(id: string) {
    try {
      await deletePage(id);
      toast.success("Page deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete page");
    }
  }

  return (
    <div>
      <div className="mb-4 flex w-fit items-stretch overflow-hidden rounded-lg border border-input">
        <div className="w-48">
          <FormSelect
            value={bulkAction || "none"}
            onValueChange={(v) => setBulkAction(v === "none" ? "" : v)}
            placeholder="Bulk actions"
            options={[{ value: "none", label: "Bulk actions" }, ...BULK_ACTIONS]}
            triggerClassName="rounded-none border-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <Button
          className="rounded-none border-l border-input"
          disabled={!bulkAction || selected.size === 0 || pending}
          onClick={applyBulkAction}
        >
          {pending ? "Applying…" : `Apply${selected.size ? ` (${selected.size})` : ""}`}
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10 px-4">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all"
                  className="size-4 rounded border-input accent-primary"
                />
              </TableHead>
              <TableHead className="h-11 px-4">Page</TableHead>
              <TableHead className="px-4">SEO score</TableHead>
              <TableHead className="px-4">Template</TableHead>
              <TableHead className="px-4">Status</TableHead>
              <TableHead className="w-28 px-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((page) => (
              <TableRow key={page.id}>
                <TableCell className="px-4 py-3 align-top">
                  <input
                    type="checkbox"
                    checked={selected.has(page.id)}
                    onChange={() => toggleOne(page.id)}
                    aria-label={`Select ${page.title}`}
                    className="size-4 rounded border-input accent-primary"
                  />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <StickyNote className="size-4 text-muted-foreground" />
                    </div>
                    <div className="max-w-[280px] truncate font-medium" title={page.title}>
                      {page.title}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <SeoScoreBadge score={page.seoScore} />
                </TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground capitalize">{page.template}</TableCell>
                <TableCell className="px-4 py-3">
                  <StatusBadge status={page.status} />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {page.status === "published" ? (
                      <Link
                        href={`/${page.slug}`}
                        target="_blank"
                        className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        title="View on site"
                      >
                        <Eye className="size-4" />
                      </Link>
                    ) : (
                      <span
                        className="flex size-8 items-center justify-center text-muted-foreground/30"
                        title="Not published yet"
                      >
                        <Eye className="size-4" />
                      </span>
                    )}
                    <Link
                      href={`/admin/pages/${page.id}/edit`}
                      className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      title="Edit"
                    >
                      <Pencil className="size-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleSingleDelete(page.id)}
                      className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No pages match these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
