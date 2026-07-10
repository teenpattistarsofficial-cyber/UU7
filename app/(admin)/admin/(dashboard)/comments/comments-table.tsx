"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, X, Trash2, ExternalLink } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/admin/form-select";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { AuthorAvatar } from "@/components/site/author-avatar";
import { cn, formatDate } from "@/lib/utils";
import {
  approveComment,
  rejectComment,
  deleteComment,
  bulkApproveComments,
  bulkRejectComments,
  bulkDeleteComments,
} from "@/lib/actions/comments";

export type CommentRow = {
  id: string;
  authorName: string;
  authorEmail: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  postTitle: string;
  postSlug: string | null;
};

const STATUS_STYLE: Record<CommentRow["status"], string> = {
  pending: "bg-amber-500/10 text-amber-600",
  approved: "bg-emerald-500/10 text-emerald-600",
  rejected: "bg-destructive/10 text-destructive",
};

const BULK_ACTIONS = [
  { value: "approve", label: "Approve" },
  { value: "reject", label: "Reject" },
  { value: "delete", label: "Delete" },
];

export function CommentsTable({ rows }: { rows: CommentRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [pending, startTransition] = useTransition();
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const allSelected = rows.length > 0 && selected.size === rows.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function runBulkAction() {
    if (!bulkAction || selected.size === 0) return;
    const ids = [...selected];
    startTransition(async () => {
      try {
        if (bulkAction === "approve") await bulkApproveComments(ids);
        else if (bulkAction === "reject") await bulkRejectComments(ids);
        else if (bulkAction === "delete") await bulkDeleteComments(ids);
        toast.success(`Applied "${BULK_ACTIONS.find((a) => a.value === bulkAction)?.label}" to ${ids.length} comment${ids.length === 1 ? "" : "s"}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Bulk action failed");
      } finally {
        setSelected(new Set());
        setBulkAction("");
        setBulkConfirmOpen(false);
      }
    });
  }

  function applyBulkAction() {
    if (!bulkAction || selected.size === 0) return;
    if (bulkAction === "delete") {
      setBulkConfirmOpen(true);
      return;
    }
    runBulkAction();
  }

  async function handleApprove(id: string) {
    try {
      await approveComment(id);
      toast.success("Comment approved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve comment");
    }
  }

  async function handleReject(id: string) {
    try {
      await rejectComment(id);
      toast.success("Comment rejected");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reject comment");
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget;
    startTransition(async () => {
      try {
        await deleteComment(id);
        toast.success("Comment deleted");
        setDeleteTarget(null);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete comment");
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

      <ConfirmDialog
        open={bulkConfirmOpen}
        onOpenChange={setBulkConfirmOpen}
        title="Delete comments?"
        description={`This will permanently delete ${selected.size} comment${selected.size === 1 ? "" : "s"}. This cannot be undone.`}
        confirmLabel="Delete"
        pending={pending}
        onConfirm={runBulkAction}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete comment?"
        description="This will permanently delete this comment. This cannot be undone."
        confirmLabel="Delete"
        pending={pending}
        onConfirm={handleDelete}
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10 px-4">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" className="size-4 rounded border-input accent-primary" />
              </TableHead>
              <TableHead className="h-11 px-4">Comment</TableHead>
              <TableHead className="px-4">Post</TableHead>
              <TableHead className="px-4">Status</TableHead>
              <TableHead className="px-4">Date</TableHead>
              <TableHead className="w-32 px-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="px-4 py-3 align-top">
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() => toggleOne(c.id)}
                    aria-label={`Select comment from ${c.authorName}`}
                    className="size-4 rounded border-input accent-primary"
                  />
                </TableCell>
                <TableCell className="max-w-md px-4 py-3">
                  <div className="flex items-start gap-3">
                    <AuthorAvatar displayName={c.authorName} size="size-10" className="mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-medium">
                        {c.authorName} <span className="font-normal text-muted-foreground">({c.authorEmail})</span>
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{c.content}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 align-top">
                  {c.postSlug ? (
                    <Link href={`/${c.postSlug}`} target="_blank" className="flex items-center gap-1 text-sm text-brand hover:underline">
                      <span className="max-w-[160px] truncate">{c.postTitle}</span>
                      <ExternalLink className="size-3 shrink-0" />
                    </Link>
                  ) : (
                    <span className="text-sm text-muted-foreground">{c.postTitle}</span>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3 align-top">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", STATUS_STYLE[c.status])}>
                    <span className="size-1.5 rounded-full bg-current" />
                    {c.status[0].toUpperCase() + c.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 align-top text-sm text-muted-foreground">{formatDate(c.createdAt)}</TableCell>
                <TableCell className="px-4 py-3 align-top">
                  <div className="flex justify-end gap-1">
                    {c.status !== "approved" && (
                      <button
                        type="button"
                        onClick={() => handleApprove(c.id)}
                        className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600"
                        title="Approve"
                      >
                        <Check className="size-4" />
                      </button>
                    )}
                    {c.status !== "rejected" && (
                      <button
                        type="button"
                        onClick={() => handleReject(c.id)}
                        className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600"
                        title="Reject"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(c.id)}
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
                  No comments match these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
