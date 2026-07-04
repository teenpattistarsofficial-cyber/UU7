"use client";

import { useState } from "react";
import Image from "next/image";
import { useFormContext, useWatch } from "react-hook-form";
import { ImageOff } from "lucide-react";
import type { JSONContent } from "@tiptap/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SerpPreview } from "@/components/admin/serp-preview";
import { SeoAnalysis } from "@/components/admin/seo-analysis";
import { MediaPicker } from "@/components/admin/media-picker";
import { getSeoChecklist, SEO_TITLE_MIN, SEO_TITLE_MAX, META_DESCRIPTION_MIN, META_DESCRIPTION_MAX } from "@/lib/seo/score";
import { charStatusColor } from "@/lib/seo/char-status";
import { cn } from "@/lib/utils";

export type SeoFieldValues = {
  title: string;
  slug: string;
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  canonicalUrl: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
};

/** SEO fields sidebar (Module 1) + live SERP preview (Module 2) + technical
 * SEO toggles (Module 4). Reads/writes through the parent's react-hook-form
 * context — must be rendered inside that form's <FormProvider>. `content`
 * drives the full SEO analysis checklist (word count / heading / focus
 * keyword usage / internal & external links), so it's passed down from the
 * editor's Tiptap state rather than living in this form. `featuredImageUrl`
 * is likewise owned by the parent (only posts have that field) — omit it
 * entirely for entities that don't, rather than passing an always-empty
 * value, so the checklist skips that check instead of showing a permanent,
 * unfixable failure. */
export function SeoFieldsPanel({
  pathPrefix,
  content,
  featuredImageUrl,
}: {
  pathPrefix: string;
  content: JSONContent | null | undefined;
  featuredImageUrl?: string | null;
}) {
  const { register, control, setValue } = useFormContext<SeoFieldValues>();
  const [title, slug, seoTitle, metaDescription, focusKeyword, ogImageUrl] = useWatch({
    control,
    name: ["title", "slug", "seoTitle", "metaDescription", "focusKeyword", "ogImageUrl"],
  });
  const robotsIndex = useWatch({ control, name: "robotsIndex" });
  const robotsFollow = useWatch({ control, name: "robotsFollow" });
  const [ogPickerOpen, setOgPickerOpen] = useState(false);

  const checklist = getSeoChecklist({
    title,
    slug,
    content,
    seo: { seoTitle, metaDescription, focusKeyword },
    featuredImageUrl,
  });
  const effectiveTitle = seoTitle || title;

  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)]">
      <h2 className="text-sm font-semibold">SEO</h2>

      <SeoAnalysis checks={checklist} />

      <SerpPreview
        title={effectiveTitle}
        description={metaDescription}
        url={`uu7.io${pathPrefix}/${slug || "…"}`}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="seoTitle">SEO title</Label>
          <span className={cn("text-xs font-semibold tabular-nums", charStatusColor(effectiveTitle.length, SEO_TITLE_MIN, SEO_TITLE_MAX))}>
            {effectiveTitle.length}/{SEO_TITLE_MAX}
          </span>
        </div>
        <Input id="seoTitle" placeholder={title} {...register("seoTitle")} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="metaDescription">Meta description</Label>
          <span
            className={cn(
              "text-xs font-semibold tabular-nums",
              charStatusColor((metaDescription ?? "").length, META_DESCRIPTION_MIN, META_DESCRIPTION_MAX),
            )}
          >
            {(metaDescription ?? "").length}/{META_DESCRIPTION_MAX}
          </span>
        </div>
        <Textarea id="metaDescription" rows={3} {...register("metaDescription")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="focusKeyword">Focus keyword</Label>
        <Input id="focusKeyword" {...register("focusKeyword")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="canonicalUrl">Canonical URL</Label>
        <Input id="canonicalUrl" placeholder={`https://uu7.io${pathPrefix}/${slug || ""}`} {...register("canonicalUrl")} />
      </div>

      <div className="space-y-3 border-t border-border pt-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="robotsIndex" className="font-normal">
            Index this page
          </Label>
          <Switch
            id="robotsIndex"
            checked={robotsIndex}
            onCheckedChange={(checked) => setValue("robotsIndex", checked, { shouldDirty: true })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="robotsFollow" className="font-normal">
            Follow links
          </Label>
          <Switch
            id="robotsFollow"
            checked={robotsFollow}
            onCheckedChange={(checked) => setValue("robotsFollow", checked, { shouldDirty: true })}
          />
        </div>
      </div>

      <div className="space-y-3 border-t border-border pt-3">
        <div className="space-y-2">
          <Label htmlFor="ogTitle">Open Graph title</Label>
          <Input id="ogTitle" placeholder={seoTitle || title} {...register("ogTitle")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ogDescription">Open Graph description</Label>
          <Textarea id="ogDescription" rows={2} placeholder={metaDescription} {...register("ogDescription")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ogImageUrl">Custom social (OG) image</Label>
          <div className="flex aspect-[1200/630] items-center justify-center overflow-hidden rounded-lg bg-muted">
            {ogImageUrl ? (
              <Image src={ogImageUrl} alt="" width={1200} height={630} unoptimized className="size-full object-cover" />
            ) : (
              <ImageOff className="size-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex gap-2">
            <Input id="ogImageUrl" placeholder="Image URL" className="flex-1" {...register("ogImageUrl")} />
            <Button type="button" variant="outline" size="sm" onClick={() => setOgPickerOpen(true)}>
              Upload
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Shown when this is shared on social media. Falls back to the cover image (or site default) when left blank.
          </p>
        </div>
      </div>

      <MediaPicker
        open={ogPickerOpen}
        onOpenChange={setOgPickerOpen}
        onSelect={(item) => setValue("ogImageUrl", item.url, { shouldDirty: true })}
      />
    </div>
  );
}
