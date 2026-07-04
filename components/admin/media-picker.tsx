"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { listMedia } from "@/lib/actions/media";
import { cn } from "@/lib/utils";

export type MediaItem = {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
};

/** Shared "choose an image" dialog — browse previously-uploaded media or
 * upload a new file, either way `onSelect` fires once with the picked
 * image and the dialog closes itself. Used by the post editor's Cover
 * Image field and the Tiptap toolbar's Insert Image button. */
export function MediaPicker({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: MediaItem) => void;
}) {
  const [mode, setMode] = useState<"library" | "upload">("library");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listMedia()
      .then(setItems)
      .catch(() => toast.error("Failed to load media library"))
      .finally(() => setLoading(false));
  }, [open]);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/media/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onSelect(data);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const needle = query.trim().toLowerCase();
  const filtered = items.filter((item) => !needle || item.alt.toLowerCase().includes(needle));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose an image</DialogTitle>
        </DialogHeader>

        <div className="flex w-fit items-center rounded-md border border-input bg-background p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setMode("library")}
            className={cn("rounded px-3 py-1.5", mode === "library" ? "bg-foreground text-background" : "text-muted-foreground")}
          >
            Library
          </button>
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={cn("rounded px-3 py-1.5", mode === "upload" ? "bg-foreground text-background" : "text-muted-foreground")}
          >
            Upload
          </button>
        </div>

        {mode === "library" ? (
          <div className="space-y-3">
            <Input placeholder="Search by alt text…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <div className="grid max-h-[420px] grid-cols-4 gap-3 overflow-y-auto">
              {loading ? (
                <p className="col-span-4 py-10 text-center text-sm text-muted-foreground">Loading…</p>
              ) : filtered.length === 0 ? (
                <p className="col-span-4 py-10 text-center text-sm text-muted-foreground">No images yet — switch to Upload.</p>
              ) : (
                filtered.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelect(item);
                      onOpenChange(false);
                    }}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
                  >
                    <Image src={item.url} alt={item.alt} fill unoptimized className="object-cover transition-opacity group-hover:opacity-80" />
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <label
            className={cn(
              "flex h-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input text-sm text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              uploading && "pointer-events-none opacity-60",
            )}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleUpload(file);
            }}
          >
            <UploadCloud className="size-6" />
            {uploading ? "Uploading…" : "Click to choose a file or drag one here"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />
          </label>
        )}
      </DialogContent>
    </Dialog>
  );
}
