"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, Pencil, Trash2, RotateCcw, FolderTree } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/admin/form-select";
import { SeoScoreBadge } from "@/components/admin/list-badges";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  bulkDeleteCategories,
  bulkPermanentlyDeleteCategories,
  bulkRestoreCategories,
  deleteCategory,
  permanentlyDeleteCategory,
  restoreCategory,
} from "@/lib/actions/categories";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  deletedAt: Date | null;
  seoScore: number;
};

const BULK_ACTIONS = [{ value: "delete", label: "Move to trash" }];
const TRASH_BULK_ACTIONS = [
  { value: "restore", label: "Restore" },
  { value: "delete-permanently", label: "Delete permanently" },
];

export function CategoriesTable({ rows, isTrashView = false }: { rows: CategoryRow[]; isTrashView?: boolean }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [pending, startTransition] = useTransition();
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<string | null>(null);

  const actionOptions = isTrashView ? TRASH_BULK_ACTIONS : BULK_ACTIONS;
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

  function runBulkAction() {
    if (!bulkAction || selected.size === 0) return;
    const ids = [...selected];
    startTransition(async () => {
      try {
        if (bulkAction === "delete") {
          await bulkDeleteCategories(ids);
        } else if (bulkAction === "restore") {
          await bulkRestoreCategories(ids);
        } else if (bulkAction === "delete-permanently") {
          await bulkPermanentlyDeleteCategories(ids);
        }
        toast.success(`Applied "${actionOptions.find((a) => a.value === bulkAction)?.label}" to ${ids.length} categor${ids.length === 1 ? "y" : "ies"}`);
        setSelected(new Set());
        setBulkAction("");
        setBulkConfirmOpen(false);
      } catch (err) {
        // bulkDeleteCategories can partially succeed and still throw to
        // report which categories were skipped (still have live posts) —
        // that message is worth surfacing as-is, not swallowing.
        toast.error(err instanceof Error ? err.message : "Bulk action failed");
        setSelected(new Set());
        setBulkAction("");
        setBulkConfirmOpen(false);
      }
    });
  }

  function applyBulkAction() {
    if (!bulkAction || selected.size === 0) return;
    if (bulkAction === "delete-permanently") {
      setBulkConfirmOpen(true);
      return;
    }
    runBulkAction();
  }

  async function handleSingleDelete(id: string) {
    try {
      await deleteCategory(id);
      toast.success("Category moved to trash");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to move category to trash");
    }
  }

  async function handleRestore(id: string) {
    try {
      await restoreCategory(id);
      toast.success("Category restored");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to restore category");
    }
  }

  function handlePermanentDelete() {
    if (!permanentDeleteTarget) return;
    const id = permanentDeleteTarget;
    startTransition(async () => {
      try {
        await permanentlyDeleteCategory(id);
        toast.success("Category permanently deleted");
        setPermanentDeleteTarget(null);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete category");
      }
    });
  }

  return (
    <div>
      <div className="mb-4 flex w-fit items-stretch overflow-hidden rounded-lg border border-input">
        <div className="w-48">
          <FormSelect
            value={bulkAction || "none"}
            onValueChange={(v) => setBulkAction(v === "none" ? "" : v)}
            placeholder="Bulk actions"
            options={[{ value: "none", label: "Bulk actions" }, ...actionOptions]}
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

      <ConfirmDialog
        open={bulkConfirmOpen}
        onOpenChange={setBulkConfirmOpen}
        title="Delete categories permanently?"
        description={`This will permanently delete ${selected.size} categor${selected.size === 1 ? "y" : "ies"}. This cannot be undone.`}
        confirmLabel="Delete permanently"
        pending={pending}
        onConfirm={runBulkAction}
      />

      <ConfirmDialog
        open={permanentDeleteTarget !== null}
        onOpenChange={(open) => !open && setPermanentDeleteTarget(null)}
        title="Delete category permanently?"
        description="This will permanently delete this category and its SEO metadata. Any post still referencing it will simply lose its category. This cannot be undone."
        confirmLabel="Delete permanently"
        pending={pending}
        onConfirm={handlePermanentDelete}
      />

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
              <TableHead className="h-11 px-4">Category</TableHead>
              <TableHead className="px-4">SEO score</TableHead>
              <TableHead className="px-4">Posts</TableHead>
              <TableHead className="w-28 px-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="px-4 py-3 align-top">
                  <input
                    type="checkbox"
                    checked={selected.has(category.id)}
                    onChange={() => toggleOne(category.id)}
                    aria-label={`Select ${category.name}`}
                    className="size-4 rounded border-input accent-primary"
                  />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
                      <FolderTree className="size-4 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="max-w-[280px] truncate font-medium" title={category.name}>
                        {category.name}
                      </div>
                      <div className="text-xs text-muted-foreground">/{category.slug}</div>
                      {category.deletedAt && (
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          Deleted {category.deletedAt.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <SeoScoreBadge score={category.seoScore} />
                </TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">{category.postCount}</TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {isTrashView ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleRestore(category.id)}
                          className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          title="Restore"
                        >
                          <RotateCcw className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPermanentDeleteTarget(category.id)}
                          className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Delete permanently"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href={`/${category.slug}`}
                          target="_blank"
                          className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          title="View on site"
                        >
                          <Eye className="size-4" />
                        </Link>
                        <Link
                          href={`/admin/categories/${category.id}/edit`}
                          className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          title="Edit"
                        >
                          <Pencil className="size-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleSingleDelete(category.id)}
                          className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Move to trash"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No categories match these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
