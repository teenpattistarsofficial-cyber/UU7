"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export type EditableMedia = {
  id: string;
  url: string;
  alt: string;
  caption: string | null;
  title: string | null;
};

/** Shared alt/title/caption editor — used by the Media Library grid and by
 * any field that references an already-uploaded image (e.g. a post's cover
 * image) and needs to fix its details without leaving the page it's on. */
export function EditMediaDialog({
  media,
  onClose,
  onSave,
}: {
  media: EditableMedia | null;
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
              <Button type="submit" variant="brand" className="rounded-full px-5">
                Save
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
