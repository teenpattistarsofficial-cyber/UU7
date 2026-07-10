"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, Pencil, Trash2, RotateCcw } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/admin/form-select";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { AuthorAvatar } from "@/components/site/author-avatar";
import {
  bulkDeleteAuthors,
  bulkPermanentlyDeleteAuthors,
  bulkRestoreAuthors,
  deleteAuthor,
  permanentlyDeleteAuthor,
  restoreAuthor,
} from "@/lib/actions/authors";

export type AuthorRow = {
  id: string;
  displayName: string;
  slug: string;
  roleTitle: string | null;
  avatarUrl: string | null;
  postCount: number;
  deletedAt: Date | null;
};

const BULK_ACTIONS = [{ value: "delete", label: "Move to trash" }];
const TRASH_BULK_ACTIONS = [
  { value: "restore", label: "Restore" },
  { value: "delete-permanently", label: "Delete permanently" },
];

export function AuthorsTable({ rows, isTrashView = false }: { rows: AuthorRow[]; isTrashView?: boolean }) {
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
          await bulkDeleteAuthors(ids);
        } else if (bulkAction === "restore") {
          await bulkRestoreAuthors(ids);
        } else if (bulkAction === "delete-permanently") {
          await bulkPermanentlyDeleteAuthors(ids);
        }
        toast.success(`Applied "${actionOptions.find((a) => a.value === bulkAction)?.label}" to ${ids.length} author(s)`);
        setSelected(new Set());
        setBulkAction("");
        setBulkConfirmOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Bulk action failed");
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
      await deleteAuthor(id);
      toast.success("Author moved to trash");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to move author to trash");
    }
  }

  async function handleRestore(id: string) {
    try {
      await restoreAuthor(id);
      toast.success("Author restored");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to restore author");
    }
  }

  function handlePermanentDelete() {
    if (!permanentDeleteTarget) return;
    const id = permanentDeleteTarget;
    startTransition(async () => {
      try {
        await permanentlyDeleteAuthor(id);
        toast.success("Author permanently deleted");
        setPermanentDeleteTarget(null);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete author");
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
        title="Delete authors permanently?"
        description={`This will permanently delete ${selected.size} author(s). This cannot be undone.`}
        confirmLabel="Delete permanently"
        pending={pending}
        onConfirm={runBulkAction}
      />

      <ConfirmDialog
        open={permanentDeleteTarget !== null}
        onOpenChange={(open) => !open && setPermanentDeleteTarget(null)}
        title="Delete author permanently?"
        description="This will permanently delete this author. Any post they wrote simply loses its byline. This cannot be undone."
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
              <TableHead className="h-11 px-4">Author</TableHead>
              <TableHead className="px-4">Role</TableHead>
              <TableHead className="px-4">Posts</TableHead>
              <TableHead className="w-28 px-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((author) => (
              <TableRow key={author.id}>
                <TableCell className="px-4 py-3 align-top">
                  <input
                    type="checkbox"
                    checked={selected.has(author.id)}
                    onChange={() => toggleOne(author.id)}
                    aria-label={`Select ${author.displayName}`}
                    className="size-4 rounded border-input accent-primary"
                  />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <AuthorAvatar displayName={author.displayName} avatarUrl={author.avatarUrl} size="size-10" />
                    <div className="min-w-0">
                      <div className="max-w-[240px] truncate font-medium" title={author.displayName}>
                        {author.displayName}
                      </div>
                      <div className="text-xs text-muted-foreground">/{author.slug}</div>
                      {author.deletedAt && (
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          Deleted {author.deletedAt.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">{author.roleTitle ?? "—"}</TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">{author.postCount}</TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {isTrashView ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleRestore(author.id)}
                          className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          title="Restore"
                        >
                          <RotateCcw className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPermanentDeleteTarget(author.id)}
                          className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Delete permanently"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href={`/authors/${author.slug}`}
                          target="_blank"
                          className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          title="View on site"
                        >
                          <Eye className="size-4" />
                        </Link>
                        <Link
                          href={`/admin/authors/${author.id}/edit`}
                          className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          title="Edit"
                        >
                          <Pencil className="size-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleSingleDelete(author.id)}
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
                  No authors match these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
