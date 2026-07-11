"use client";

import { useRef, useState, useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { JSONContent } from "@tiptap/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TiptapEditor, type TiptapEditorHandle } from "@/components/editor/tiptap-editor";
import { SlugField } from "@/components/admin/slug-field";
import { FormSelect } from "@/components/admin/form-select";
import { SeoFieldsPanel, type SeoFieldValues } from "@/components/admin/seo-fields-panel";
import { SeoScorePill } from "@/components/admin/seo-score-badge";
import { InternalLinkAssistant } from "@/components/admin/internal-link-assistant";
import { computeSeoScore } from "@/lib/seo/score";
import { toTiptapDoc } from "@/lib/editor/doc";

const TEMPLATE_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "about", label: "About" },
  { value: "contact", label: "Contact" },
  { value: "legal", label: "Legal" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

type PageDefaults = {
  id?: string;
  title?: string;
  slug?: string;
  content?: unknown;
  status?: string;
  template?: string;
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

type FormValues = SeoFieldValues & {
  status: string;
  template: string;
};

export function PageForm({
  action,
  defaultValues,
}: {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: PageDefaults;
}) {
  const [content, setContent] = useState<JSONContent>(toTiptapDoc(defaultValues?.content));
  const [pending, startTransition] = useTransition();
  const editorRef = useRef<TiptapEditorHandle>(null);

  const form = useForm<FormValues>({
    defaultValues: {
      title: defaultValues?.title ?? "",
      slug: defaultValues?.slug ?? "",
      status: defaultValues?.status ?? "draft",
      template: defaultValues?.template ?? "default",
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
    fd.set("title", values.title);
    fd.set("slug", values.slug);
    fd.set("status", values.status);
    fd.set("template", values.template);
    fd.set("content", JSON.stringify(content));
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
        toast.error(err instanceof Error ? err.message : "Failed to save page");
      }
    });
  }

  // No `featuredImageUrl` arg — pages have no featured-image concept (see
  // the comment on ChecklistArgs in lib/seo/score.ts), so that check is
  // correctly omitted rather than shown as a permanent, unfixable failure.
  const liveScore = computeSeoScore({
    title: form.watch("title"),
    slug: form.watch("slug"),
    content,
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
          <h1 className="text-2xl font-semibold">{defaultValues?.id ? "Edit Page" : "New Page"}</h1>
          <div className="flex items-center gap-3">
            <SeoScorePill score={liveScore} />
            <Button type="submit" variant="brand" className="rounded-full px-6" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" required {...form.register("title")} />
            </div>

            <SlugField
              value={form.watch("slug")}
              onChange={(slug) => form.setValue("slug", slug, { shouldDirty: true })}
              sourceTitle={form.watch("title")}
              type="page"
              excludeId={defaultValues?.id}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template</Label>
                <FormSelect
                  value={form.watch("template")}
                  onValueChange={(v) => form.setValue("template", v, { shouldDirty: true })}
                  options={TEMPLATE_OPTIONS}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <FormSelect
                  value={form.watch("status")}
                  onValueChange={(v) => form.setValue("status", v, { shouldDirty: true })}
                  options={STATUS_OPTIONS}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <TiptapEditor ref={editorRef} content={content} onChange={setContent} />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="mb-2 text-sm font-medium">Internal Links</h2>
              {/* Pages have no category/tags of their own — passing null/[]
                 means the auto-suggest scoring in lib/seo/related.ts just
                 falls back to title-word overlap with published posts,
                 since it's already null-safe (no post has a null
                 categoryId either, so that part of the score simply never
                 contributes here rather than erroring). `excludePostId` is
                 left undefined since a page is never itself a post to
                 exclude from its own suggestion list. */}
              <InternalLinkAssistant
                currentTitle={form.watch("title")}
                currentTagNames={[]}
                currentCategoryId={null}
                onInsert={(url, anchorText) => editorRef.current?.insertLink(url, anchorText)}
              />
            </div>

            {/* Empty, not "/pages" — a page's real public URL is the bare
               `/${slug}` (its own literal route for about/contact/etc., or
               the [category] route's generic fallback for any other page),
               never under a literal "/pages" segment. The wrong prefix here
               only affects this admin-only SERP preview / canonical
               placeholder — the live page's real canonical (lib/seo/metadata.ts)
               is built from the correct path by its own route component — but
               an editor trusting this preview and copying it into the
               Canonical URL field would have shipped a wrong, real canonical
               tag. */}
            <SeoFieldsPanel pathPrefix="" content={content} />
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
