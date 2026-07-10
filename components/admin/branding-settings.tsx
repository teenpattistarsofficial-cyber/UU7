"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImageOff, Image as ImageIcon, Globe, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MediaPicker } from "@/components/admin/media-picker";
import { updateSiteSettings } from "@/lib/actions/site-settings";
import { DEFAULT_LOGO_URL } from "@/lib/site";
import { ControlCard } from "@/components/admin/control-card";

type Field = "logoUrl" | "faviconUrl" | "ogImageUrl";

export function BrandingSettings({
  initial,
}: {
  initial: { logoUrl: string | null; faviconUrl: string | null; ogImageUrl: string | null };
}) {
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl ?? "");
  const [faviconUrl, setFaviconUrl] = useState(initial.faviconUrl ?? "");
  const [ogImageUrl, setOgImageUrl] = useState(initial.ogImageUrl ?? "");
  const [pickerField, setPickerField] = useState<Field | null>(null);
  const [pending, startTransition] = useTransition();

  const setters: Record<Field, (v: string) => void> = {
    logoUrl: setLogoUrl,
    faviconUrl: setFaviconUrl,
    ogImageUrl: setOgImageUrl,
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("logoUrl", logoUrl);
    fd.set("faviconUrl", faviconUrl);
    fd.set("ogImageUrl", ogImageUrl);
    startTransition(async () => {
      try {
        await updateSiteSettings(fd);
        toast.success("Branding saved");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save branding");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <ImageField
        field="logoUrl"
        icon={ImageIcon}
        iconClassName="bg-brand/10 text-brand"
        label="Site Logo"
        description="Header, footer, and admin sidebar. Falls back to the default UU7 logo when blank."
        value={logoUrl}
        onChange={setLogoUrl}
        onUpload={() => setPickerField("logoUrl")}
        previewFallback={DEFAULT_LOGO_URL}
        previewShape="square"
      />
      <ImageField
        field="faviconUrl"
        icon={Globe}
        iconClassName="bg-blue-500/10 text-blue-600"
        label="Favicon"
        description="The small icon shown in browser tabs. Falls back to the site's default favicon when blank."
        value={faviconUrl}
        onChange={setFaviconUrl}
        onUpload={() => setPickerField("faviconUrl")}
        previewShape="square"
      />
      <ImageField
        field="ogImageUrl"
        icon={Share2}
        iconClassName="bg-indigo-500/10 text-indigo-600"
        label="Default Social Share Image"
        description="Used when a page or post has no featured image or custom OG image of its own."
        value={ogImageUrl}
        onChange={setOgImageUrl}
        onUpload={() => setPickerField("ogImageUrl")}
        previewShape="wide"
      />

      <Button type="submit" variant="brand" className="rounded-full px-6" disabled={pending}>
        {pending ? "Saving…" : "Save branding"}
      </Button>

      <MediaPicker
        open={pickerField !== null}
        onOpenChange={(open) => !open && setPickerField(null)}
        onSelect={(item) => {
          if (pickerField) setters[pickerField](item.url);
        }}
      />
    </form>
  );
}

function ImageField({
  field,
  icon,
  iconClassName,
  label,
  description,
  value,
  onChange,
  onUpload,
  previewFallback,
  previewShape,
}: {
  field: Field;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
  onUpload: () => void;
  previewFallback?: string;
  previewShape: "square" | "wide";
}) {
  const previewSrc = value || previewFallback;
  return (
    <ControlCard icon={icon} iconClassName={iconClassName} title={label} description={description}>
      <div className="flex items-center gap-4 border-t border-border p-5">
        <div
          className={
            previewShape === "square"
              ? "flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background"
              : "flex aspect-[1200/630] w-40 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background"
          }
        >
          {previewSrc ? (
            <Image src={previewSrc} alt="" width={160} height={160} unoptimized className="size-full object-cover" />
          ) : (
            <ImageOff className="size-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-1 gap-2">
          <Input
            id={field}
            placeholder="Image URL"
            className="h-10 flex-1 bg-background text-base"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <Button type="button" variant="outline" onClick={onUpload}>
            Upload
          </Button>
        </div>
      </div>
    </ControlCard>
  );
}
