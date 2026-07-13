"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImageOff, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MediaPicker, type MediaItem } from "@/components/admin/media-picker";
import { EditMediaDialog, type EditableMedia } from "@/components/admin/edit-media-dialog";
import { getMediaByUrl, updateMedia } from "@/lib/actions/media";

/** Cover image field for the post editor. Fixing a missing alt/caption/
 * title used to mean leaving the post, finding the same image again in
 * Media Library, editing it there, and coming back — the publish gate in
 * lib/actions/posts.ts (`getPublishBlockers`) checks the image's alt text,
 * so a forgotten alt was otherwise a dead end blocking publish with no way
 * to fix it from where the problem was actually visible. The edit-details
 * button here calls the same `updateMedia` action Media Library uses,
 * just without leaving the post. */
export function CoverImageField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [details, setDetails] = useState<EditableMedia | null>(null);

  useEffect(() => {
    let cancelled = false;
    (value ? getMediaByUrl(value) : Promise.resolve(null)).then((row) => {
      if (!cancelled) setDetails(row);
    });
    return () => {
      cancelled = true;
    };
  }, [value]);

  function handleSelect(item: MediaItem) {
    onChange(item.url);
  }

  async function handleSaveDetails(values: { alt: string; caption: string; title: string }) {
    if (!details) return;
    try {
      await updateMedia(details.id, values);
      setDetails({ ...details, ...values });
      toast.success("Image details updated");
      setEditOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update image details");
    }
  }

  const missingAlt = Boolean(value) && details !== null && !details.alt.trim();

  return (
    <div className="space-y-3">
      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-muted">
        {value ? (
          <>
            <Image src={value} alt={details?.alt ?? ""} width={320} height={180} unoptimized className="size-full object-cover" />
            {details && (
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.15)] hover:bg-background"
                title="Edit image details"
              >
                <Pencil className="size-3.5" />
              </button>
            )}
            {missingAlt && (
              <span className="absolute bottom-2 left-2 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-medium text-destructive-foreground">
                Missing alt text
              </span>
            )}
          </>
        ) : (
          <ImageOff className="size-6 text-brand/70" />
        )}
      </div>
      <div className="flex gap-2">
        <Input placeholder="Image URL" className="flex-1" value={value} onChange={(e) => onChange(e.target.value)} />
        <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
          Upload
        </Button>
      </div>

      <MediaPicker open={pickerOpen} onOpenChange={setPickerOpen} onSelect={handleSelect} />
      <EditMediaDialog media={editOpen ? details : null} onClose={() => setEditOpen(false)} onSave={handleSaveDetails} />
    </div>
  );
}
