"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Eye, Pencil, Trash2, User, ImageOff } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/admin/form-select";
import { SeoScoreBadge, StatusBadge } from "@/components/admin/list-badges";
import { bulkDeletePosts, bulkSetPostStatus, deletePost } from "@/lib/actions/posts";

export type PostRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  featuredImageUrl: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  authorName: string | null;
  tagNames: string[];
  seoScore: number;
};

const BULK_ACTIONS = [
  { value: "publish", label: "Publish" },
  { value: "draft", label: "Move to draft" },
  { value: "archive", label: "Archive" },
  { value: "delete", label: "Delete" },
];

export function PostsTable({ rows }: { rows: PostRow[] }) {
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
          await bulkDeletePosts(ids);
        } else if (bulkAction === "publish") {
          await bulkSetPostStatus(ids, "published");
        } else if (bulkAction === "draft") {
          await bulkSetPostStatus(ids, "draft");
        } else if (bulkAction === "archive") {
          await bulkSetPostStatus(ids, "archived");
        }
        toast.success(`Applied "${BULK_ACTIONS.find((a) => a.value === bulkAction)?.label}" to ${ids.length} post(s)`);
        setSelected(new Set());
        setBulkAction("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Bulk action failed");
      }
    });
  }

  async function handleSingleDelete(id: string) {
    try {
      await deletePost(id);
      toast.success("Post deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete post");
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
              <TableHead className="h-11 px-4">Article</TableHead>
              <TableHead className="px-4">SEO score</TableHead>
              <TableHead className="px-4">Tags</TableHead>
              <TableHead className="px-4">Category</TableHead>
              <TableHead className="px-4">Status</TableHead>
              <TableHead className="w-28 px-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="px-4 py-3 align-top">
                  <input
                    type="checkbox"
                    checked={selected.has(post.id)}
                    onChange={() => toggleOne(post.id)}
                    aria-label={`Select ${post.title}`}
                    className="size-4 rounded border-input accent-primary"
                  />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                      {post.featuredImageUrl ? (
                        <Image
                          src={post.featuredImageUrl}
                          alt=""
                          width={40}
                          height={40}
                          unoptimized
                          className="size-10 object-cover"
                        />
                      ) : (
                        <ImageOff className="size-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="max-w-[220px] truncate font-medium" title={post.title}>
                        {post.title}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="size-3" />
                        {post.authorName ?? "Unassigned"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <SeoScoreBadge score={post.seoScore} />
                </TableCell>
                <TableCell className="max-w-[220px] px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {post.tagNames.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="font-normal">
                        #{tag}
                      </Badge>
                    ))}
                    {post.tagNames.length > 2 && (
                      <Badge variant="outline" className="font-normal">
                        +{post.tagNames.length - 2}
                      </Badge>
                    )}
                    {post.tagNames.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">{post.categoryName ?? "—"}</TableCell>
                <TableCell className="px-4 py-3">
                  <StatusBadge status={post.status} />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {post.status === "published" && post.categorySlug ? (
                      <Link
                        href={`/${post.categorySlug}/${post.slug}`}
                        target="_blank"
                        className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        title="View on site"
                      >
                        <Eye className="size-4" />
                      </Link>
                    ) : (
                      <span
                        className="flex size-8 items-center justify-center text-muted-foreground/30"
                        title={
                          post.status !== "published"
                            ? "Not published yet"
                            : "Assign a category to view on site — the public URL is /category/slug"
                        }
                      >
                        <Eye className="size-4" />
                      </span>
                    )}
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      title="Edit"
                    >
                      <Pencil className="size-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleSingleDelete(post.id)}
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
                <TableCell colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  No posts match these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
