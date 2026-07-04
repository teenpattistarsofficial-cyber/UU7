"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { UploadCloud, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { updateMedia, deleteMedia, bulkDeleteMedia } from "@/lib/actions/media";
import { cn } from "@/lib/utils";

export type MediaRow = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  width: number;
  height: number;
  size: number;
  alt: string;
  caption: string | null;
  title: string | null;
  createdAt: Date;
};

export function MediaGrid({ initialRows }: { initialRows: MediaRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<MediaRow | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  const needle = query.trim().toLowerCase();
  const filtered = rows.filter(
    (r) =>
      !needle ||
      r.filename.toLowerCase().includes(needle) ||
      r.alt.toLowerCase().includes(needle) ||
      (r.title ?? "").toLowerCase().includes(needle),
  );

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    let uploaded = 0;
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.set("file", file);
        const res = await fetch("/api/admin/media/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        setRows((prev) => [{ ...data, createdAt: new Date(data.createdAt) }, ...prev]);
        uploaded++;
      }
      toast.success(`Uploaded ${uploaded} image${uploaded === 1 ? "" : "s"}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleBulkDelete() {
    const ids = [...selected];
    startTransition(async () => {
      try {
        await bulkDeleteMedia(ids);
        setRows((prev) => prev.filter((r) => !selected.has(r.id)));
        setSelected(new Set());
        toast.success(`Deleted ${ids.length} image(s)`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete");
      }
    });
  }

  async function handleSaveEdit(values: { alt: string; caption: string; title: string }) {
    if (!editing) return;
    try {
      await updateMedia(editing.id, values);
      setRows((prev) => prev.map((r) => (r.id === editing.id ? { ...r, ...values } : r)));
      toast.success("Image updated");
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  }

  async function handleSingleDelete(id: string) {
    try {
      await deleteMedia(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast.success("Image deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label
          className={cn(
            "flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90",
            uploading && "pointer-events-none opacity-60",
          )}
        >
          <UploadCloud className="size-4" />
          {uploading ? "Uploading…" : "Upload"}
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        </label>
        <Input
          placeholder="Search by filename, alt, or title…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        {selected.size > 0 && (
          <Button variant="destructive" size="sm" disabled={pending} onClick={handleBulkDelete}>
            Delete ({selected.size})
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          No images yet — upload one to get started.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)]"
            >
              <button type="button" onClick={() => toggleOne(item.id)} className="absolute top-2 left-2 z-10">
                <input type="checkbox" checked={selected.has(item.id)} readOnly className="size-4 rounded border-input accent-primary" />
              </button>
              <div className="relative aspect-square bg-muted">
                <Image src={item.url} alt={item.alt} fill unoptimized className="object-cover" />
              </div>
              <div className="flex items-center justify-between gap-1 p-2">
                <p className="truncate text-xs text-muted-foreground" title={item.filename}>
                  {item.title || item.filename}
                </p>
                <div className="flex shrink-0 gap-0.5">
                  <button
                    type="button"
                    onClick={() => setEditing(item)}
                    className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    title="Edit details"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSingleDelete(item.id)}
                    className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <EditMediaDialog media={editing} onClose={() => setEditing(null)} onSave={handleSaveEdit} />
    </div>
  );
}

function EditMediaDialog({
  media,
  onClose,
  onSave,
}: {
  media: MediaRow | null;
  onClose: () => void;
  onSave: (values: { alt: string; caption: string; title: string }) => void;
}) {
  return (
    <Dialog open={!!media} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Image details</DialogTitle>
        </DialogHeader>
        {media && (
          <form
            key={media.id}
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              onSave({
                alt: String(fd.get("alt") ?? ""),
                caption: String(fd.get("caption") ?? ""),
                title: String(fd.get("title") ?? ""),
              });
            }}
          >
            <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
              <Image src={media.url} alt={media.alt} fill unoptimized className="object-cover" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="alt">Alt text</Label>
              <Input id="alt" name="alt" defaultValue={media.alt} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={media.title ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="caption">Caption</Label>
              <Textarea id="caption" name="caption" rows={2} defaultValue={media.caption ?? ""} />
            </div>
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
