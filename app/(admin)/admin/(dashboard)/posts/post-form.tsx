"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { FormProvider, useForm } from "react-hook-form";
import type { JSONContent } from "@tiptap/react";
import { toast } from "sonner";
import { ArrowLeft, Save, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TiptapEditor, type TiptapEditorHandle } from "@/components/editor/tiptap-editor";
import { SlugField } from "@/components/admin/slug-field";
import { FormSelect } from "@/components/admin/form-select";
import { TagsField } from "@/components/admin/tags-field";
import { SeoFieldsPanel, type SeoFieldValues } from "@/components/admin/seo-fields-panel";
import { SeoScorePill } from "@/components/admin/seo-score-badge";
import { MediaPicker } from "@/components/admin/media-picker";
import { FaqBuilder, type FaqItem } from "@/components/admin/faq-builder";
import { AiSummaryBuilder } from "@/components/admin/ai-summary-builder";
import { QuickAnswerBuilder } from "@/components/admin/quick-answer-builder";
import { CtaBuilder, type CtaItem } from "@/components/admin/cta-builder";
import { StatsTableBuilder, type StatsTableItem } from "@/components/admin/stats-table-builder";
import { RelatedPostsPicker, type RelatedPostPin } from "@/components/admin/related-posts-picker";
import { InternalLinkAssistant } from "@/components/admin/internal-link-assistant";
import { toTiptapDoc } from "@/lib/editor/doc";
import { extractText } from "@/lib/editor/text";
import { estimateReadingTimeMinutes } from "@/lib/seo/reading-time";
import { computeSeoScore } from "@/lib/seo/score";
import { cn } from "@/lib/utils";

const cardClassName =
  "rounded-xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)]";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "scheduled", label: "Scheduled" },
  { value: "archived", label: "Archived" },
];

type PostDefaults = {
  id?: string;
  title?: string;
  slug?: string;
  content?: unknown;
  excerpt?: string | null;
  status?: string;
  authorId?: string | null;
  categoryId?: string | null;
  featuredImageUrl?: string | null;
  readingTimeMinutes?: number | null;
  tags?: string[];
  faqs?: FaqItem[];
  aiSummary?: string | null;
  keyTakeaways?: string[];
  quickAnswer?: string | null;
  ctas?: CtaItem[];
  statsTables?: StatsTableItem[];
  relatedPosts?: RelatedPostPin[];
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
  categoryId: string;
  authorId: string;
  featuredImageUrl: string;
  readingTimeMinutes: string;
  excerpt: string;
};

export function PostForm({
  action,
  defaultValues,
  authors,
  categories,
}: {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: PostDefaults;
  authors: { id: string; displayName: string }[];
  categories: { id: string; name: string; slug: string }[];
}) {
  const [content, setContent] = useState<JSONContent>(toTiptapDoc(defaultValues?.content));
  const [tags, setTags] = useState<string[]>(defaultValues?.tags ?? []);
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [faqs, setFaqs] = useState<FaqItem[]>(defaultValues?.faqs ?? []);
  const [aiSummary, setAiSummary] = useState(defaultValues?.aiSummary ?? "");
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>(defaultValues?.keyTakeaways ?? []);
  const [quickAnswer, setQuickAnswer] = useState(defaultValues?.quickAnswer ?? "");
  const [ctas, setCtas] = useState<CtaItem[]>(defaultValues?.ctas ?? []);
  const [statsTables, setStatsTables] = useState<StatsTableItem[]>(defaultValues?.statsTables ?? []);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPostPin[]>(defaultValues?.relatedPosts ?? []);
  const editorRef = useRef<TiptapEditorHandle>(null);
  const [pending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    defaultValues: {
      title: defaultValues?.title ?? "",
      slug: defaultValues?.slug ?? "",
      status: defaultValues?.status ?? "draft",
      categoryId: defaultValues?.categoryId ?? "",
      authorId: defaultValues?.authorId ?? "",
      featuredImageUrl: defaultValues?.featuredImageUrl ?? "",
      readingTimeMinutes:
        defaultValues?.readingTimeMinutes != null ? String(defaultValues.readingTimeMinutes) : "",
      excerpt: defaultValues?.excerpt ?? "",
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
    fd.set("categoryId", values.categoryId);
    fd.set("authorId", values.authorId);
    fd.set("featuredImageUrl", values.featuredImageUrl);
    fd.set("readingTimeMinutes", values.readingTimeMinutes);
    fd.set("excerpt", values.excerpt);
    fd.set("content", JSON.stringify(content));
    fd.set("tags", JSON.stringify(tags));
    fd.set("faqs", JSON.stringify(faqs));
    fd.set("aiSummary", aiSummary);
    fd.set("keyTakeaways", JSON.stringify(keyTakeaways));
    fd.set("quickAnswer", quickAnswer);
    fd.set("ctas", JSON.stringify(ctas));
    fd.set("statsTables", JSON.stringify(statsTables));
    fd.set("relatedPostIds", JSON.stringify(relatedPosts.map((p) => p.id)));
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
        // `redirect()` inside the server action throws a special error to
        // signal navigation — it must propagate, not be treated as a
        // failure toast. Its digest is the only way to identify it since
        // Next.js doesn't (yet) export a public helper for this.
        if (err && typeof err === "object" && "digest" in err && String(err.digest).startsWith("NEXT_REDIRECT")) {
          throw err;
        }
        toast.error(err instanceof Error ? err.message : "Failed to save post");
      }
    });
  }

  const title = form.watch("title");
  const slug = form.watch("slug");
  const seoTitle = form.watch("seoTitle");
  const metaDescription = form.watch("metaDescription");
  const focusKeyword = form.watch("focusKeyword");
  const featuredImageUrl = form.watch("featuredImageUrl");
  const selectedCategorySlug = categories.find((c) => c.id === form.watch("categoryId"))?.slug ?? "category";

  // Live, real score — same checklist the Posts list and the SEO panel's
  // own analysis breakdown use, computed from the actual in-progress form
  // state rather than a fixed server value.
  const liveScore = computeSeoScore({
    title,
    slug,
    content,
    seo: { seoTitle, metaDescription, focusKeyword },
    featuredImageUrl,
  });
  const readingTime = estimateReadingTimeMinutes(extractText(content));

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/admin/posts" className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" />
              Back to Posts
            </Link>
            <h1 className="text-2xl font-bold">{defaultValues?.id ? "Edit Post" : "New Post"}</h1>
          </div>
          <div className="flex items-center gap-3">
            <SeoScorePill score={liveScore} />
            <Button
              type="submit"
              disabled={pending}
              className="gap-1.5 bg-brand text-brand-foreground shadow-[0_1px_2px_rgba(0,0,0,0.05),0_4px_12px_-4px_rgba(0,0,0,0.15)] hover:bg-brand/90"
            >
              <Save className="size-4" />
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className={cardClassName}>
              <Input
                id="title"
                required
                placeholder="Post title"
                className="h-auto border-0 p-0 text-2xl font-bold shadow-none focus-visible:ring-0"
                {...form.register("title")}
              />
              <div className="mt-3 border-t border-border pt-3">
                <SlugField
                  value={form.watch("slug")}
                  onChange={(slug) => form.setValue("slug", slug, { shouldDirty: true })}
                  sourceTitle={title}
                  type="post"
                  excludeId={defaultValues?.id}
                />
              </div>
            </div>

            <div>
              <TiptapEditor ref={editorRef} content={content} onChange={setContent} />
            </div>

            <div className={cardClassName}>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea id="excerpt" rows={2} className="mt-2" {...form.register("excerpt")} />
            </div>
          </div>

          {/* Pinned within the page's scroll container (main), with its own
              scroll if it's ever taller than the viewport — same
              independent-scroll pattern as the admin shell, one level
              deeper: this column shouldn't disappear upward as you scroll
              through a long article on the left. */}
          <div className="space-y-6 self-start lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
            <div className={cn(cardClassName, "space-y-4")}>
              <h2 className="text-sm font-semibold">Publishing</h2>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase">Status</Label>
                <FormSelect
                  value={form.watch("status")}
                  onValueChange={(v) => form.setValue("status", v, { shouldDirty: true })}
                  options={STATUS_OPTIONS}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase">Category</Label>
                <FormSelect
                  value={form.watch("categoryId") || "none"}
                  onValueChange={(v) => form.setValue("categoryId", v === "none" ? "" : v, { shouldDirty: true })}
                  options={[{ value: "none", label: "—" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase">Author</Label>
                <FormSelect
                  value={form.watch("authorId") || "none"}
                  onValueChange={(v) => form.setValue("authorId", v === "none" ? "" : v, { shouldDirty: true })}
                  options={[{ value: "none", label: "—" }, ...authors.map((a) => ({ value: a.id, label: a.displayName }))]}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground uppercase">Reading time</Label>
                  <button
                    type="button"
                    onClick={() => form.setValue("readingTimeMinutes", String(readingTime), { shouldDirty: true })}
                    className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                  >
                    Use estimate (~{readingTime})
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    placeholder={String(readingTime)}
                    className="w-20"
                    {...form.register("readingTimeMinutes")}
                  />
                  <span className="text-sm text-muted-foreground">min read</span>
                </div>
              </div>
            </div>

            <div className={cn(cardClassName, "space-y-3")}>
              <h2 className="text-sm font-semibold">Cover Image</h2>
              <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-muted">
                {featuredImageUrl ? (
                  <Image src={featuredImageUrl} alt="" width={320} height={180} unoptimized className="size-full object-cover" />
                ) : (
                  <ImageOff className="size-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Image URL" className="flex-1" {...form.register("featuredImageUrl")} />
                <Button type="button" variant="outline" size="sm" onClick={() => setCoverPickerOpen(true)}>
                  Upload
                </Button>
              </div>
            </div>

            <div className={cn(cardClassName, "space-y-2")}>
              <h2 className="text-sm font-semibold">Tags</h2>
              <TagsField id="tags-input" value={tags} onChange={setTags} />
            </div>

            <div className={cn(cardClassName, "space-y-3")}>
              <h2 className="text-sm font-semibold">Internal Links</h2>
              <InternalLinkAssistant
                excludePostId={defaultValues?.id}
                currentTitle={title}
                currentTagNames={tags}
                currentCategoryId={form.watch("categoryId") || null}
                onInsert={(url, anchorText) => editorRef.current?.insertLink(url, anchorText)}
              />
            </div>

            <div className={cn(cardClassName, "space-y-3")}>
              <h2 className="text-sm font-semibold">Related Posts</h2>
              <RelatedPostsPicker
                value={relatedPosts}
                onChange={setRelatedPosts}
                excludePostId={defaultValues?.id}
                currentTitle={title}
                currentTagNames={tags}
                currentCategoryId={form.watch("categoryId") || null}
              />
            </div>

            <div className={cardClassName}>
              <h2 className="mb-3 text-sm font-semibold">Quick Answer</h2>
              <QuickAnswerBuilder value={quickAnswer} onChange={setQuickAnswer} />
            </div>

            <div className={cardClassName}>
              <h2 className="mb-3 text-sm font-semibold">AI Summary</h2>
              <AiSummaryBuilder
                summary={aiSummary}
                onSummaryChange={setAiSummary}
                takeaways={keyTakeaways}
                onTakeawaysChange={setKeyTakeaways}
              />
            </div>

            <div className={cardClassName}>
              <h2 className="mb-3 text-sm font-semibold">FAQ</h2>
              <FaqBuilder value={faqs} onChange={setFaqs} />
            </div>

            <div className={cardClassName}>
              <h2 className="mb-3 text-sm font-semibold">Stats Tables</h2>
              <StatsTableBuilder value={statsTables} onChange={setStatsTables} />
            </div>

            <div className={cardClassName}>
              <h2 className="mb-3 text-sm font-semibold">Calls to Action</h2>
              <CtaBuilder value={ctas} onChange={setCtas} />
            </div>

            <SeoFieldsPanel pathPrefix={`/${selectedCategorySlug}`} content={content} featuredImageUrl={featuredImageUrl} />
          </div>
        </div>

        <MediaPicker
          open={coverPickerOpen}
          onOpenChange={setCoverPickerOpen}
          onSelect={(item) => form.setValue("featuredImageUrl", item.url, { shouldDirty: true })}
        />
      </form>
    </FormProvider>
  );
}
