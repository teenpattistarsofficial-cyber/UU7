"use client";

import { useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SlugField } from "@/components/admin/slug-field";
import { SeoFieldsPanel, type SeoFieldValues } from "@/components/admin/seo-fields-panel";
import { SeoScorePill } from "@/components/admin/seo-score-badge";
import { computeSeoScore } from "@/lib/seo/score";

type CategoryDefaults = {
  id?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  seo?: {
    seoTitle?: string | null;
    metaDescription?: string | null;
    focusKeyword?: string | null;
    canonicalUrl?: string | null;
    robotsIndex?: boolean;
    robotsFollow?: boolean;
    ogTitle?: string | null;
    ogDescription?: string | null;
    ogImageUrl?: string | null;
  };
};

// `SeoFieldValues` names the entity's main field `title` (matching posts
// and pages) — aliased here to the same key rather than "name" purely so
// SeoFieldsPanel's internal useWatch(["title", ...]) works unmodified; the
// visible label still reads "Name" and the server action still receives it
// as `name`, matching the `categories` table's own column.
type FormValues = SeoFieldValues & {
  description: string;
};

export function CategoryForm({
  action,
  defaultValues,
}: {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: CategoryDefaults;
}) {
  const [pending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    defaultValues: {
      title: defaultValues?.name ?? "",
      slug: defaultValues?.slug ?? "",
      description: defaultValues?.description ?? "",
      seoTitle: defaultValues?.seo?.seoTitle ?? "",
      metaDescription: defaultValues?.seo?.metaDescription ?? "",
      focusKeyword: defaultValues?.seo?.focusKeyword ?? "",
      canonicalUrl: defaultValues?.seo?.canonicalUrl ?? "",
      robotsIndex: defaultValues?.seo?.robotsIndex ?? true,
      robotsFollow: defaultValues?.seo?.robotsFollow ?? true,
      ogTitle: defaultValues?.seo?.ogTitle ?? "",
      ogDescription: defaultValues?.seo?.ogDescription ?? "",
      ogImageUrl: defaultValues?.seo?.ogImageUrl ?? "",
    },
  });

  function onSubmit(values: FormValues) {
    const fd = new FormData();
    fd.set("name", values.title);
    fd.set("slug", values.slug);
    fd.set("description", values.description);
    fd.set("seoTitle", values.seoTitle);
    fd.set("metaDescription", values.metaDescription);
    fd.set("focusKeyword", values.focusKeyword);
    fd.set("canonicalUrl", values.canonicalUrl);
    fd.set("robotsIndex", String(values.robotsIndex));
    fd.set("robotsFollow", String(values.robotsFollow));
    fd.set("ogTitle", values.ogTitle);
    fd.set("ogDescription", values.ogDescription);
    fd.set("ogImageUrl", values.ogImageUrl);

    startTransition(async () => {
      try {
        await action(fd);
      } catch (err) {
        if (err && typeof err === "object" && "digest" in err && String(err.digest).startsWith("NEXT_REDIRECT")) {
          throw err;
        }
        toast.error(err instanceof Error ? err.message : "Failed to save category");
      }
    });
  }

  // No `content`/`featuredImageUrl` args — categories have neither concept
  // (see the comment on ChecklistArgs in lib/seo/score.ts), so the checklist
  // this rolls up correctly skips heading/word-count/link/image checks
  // instead of showing them as permanently, unfixably failed.
  const liveScore = computeSeoScore({
    title: form.watch("title"),
    slug: form.watch("slug"),
    content: undefined,
    seo: {
      seoTitle: form.watch("seoTitle"),
      metaDescription: form.watch("metaDescription"),
      focusKeyword: form.watch("focusKeyword"),
    },
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">{defaultValues?.id ? "Edit Category" : "New Category"}</h1>
          <SeoScorePill score={liveScore} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Name</Label>
              <Input id="title" required {...form.register("title")} />
            </div>

            {/* Categories and pages share the same flat "/${slug}" URL — see
               the comment on app/api/admin/slugs/check/route.ts for why this
               has to check both tables, not just categories against
               themselves. */}
            <SlugField
              value={form.watch("slug")}
              onChange={(slug) => form.setValue("slug", slug, { shouldDirty: true })}
              sourceTitle={form.watch("title")}
              type="category"
              excludeId={defaultValues?.id}
            />

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} {...form.register("description")} />
            </div>

            <Button type="submit" variant="brand" className="rounded-full px-6" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>

          <div>
            {/* No `content` prop — categories have no body-content concept
               (see the comment on ChecklistArgs in lib/seo/score.ts), so the
               checklist below correctly skips heading/word-count/link checks
               instead of showing them as permanently, unfixably failed. */}
            <SeoFieldsPanel pathPrefix="" />
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
