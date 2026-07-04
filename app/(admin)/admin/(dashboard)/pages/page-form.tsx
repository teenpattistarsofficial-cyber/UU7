"use client";

import { useState, useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { JSONContent } from "@tiptap/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { SlugField } from "@/components/admin/slug-field";
import { FormSelect } from "@/components/admin/form-select";
import { SeoFieldsPanel, type SeoFieldValues } from "@/components/admin/seo-fields-panel";
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

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
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
            <TiptapEditor content={content} onChange={setContent} />
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>

        <div>
          <SeoFieldsPanel pathPrefix="/pages" content={content} />
        </div>
      </form>
    </FormProvider>
  );
}
