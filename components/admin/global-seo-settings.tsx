"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Type, AlignLeft, Tags, ShieldCheck, AtSign, Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateSiteSettings } from "@/lib/actions/site-settings";
import { ControlCard } from "@/components/admin/control-card";

export function GlobalSeoSettings({
  initial,
}: {
  initial: {
    siteTitle: string | null;
    metaDescription: string | null;
    metaKeywords: string | null;
    googleSiteVerification: string | null;
    twitterHandle: string | null;
    canonicalUrl: string | null;
  };
}) {
  const [siteTitle, setSiteTitle] = useState(initial.siteTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(initial.metaDescription ?? "");
  const [metaKeywords, setMetaKeywords] = useState(initial.metaKeywords ?? "");
  const [googleSiteVerification, setGoogleSiteVerification] = useState(initial.googleSiteVerification ?? "");
  const [twitterHandle, setTwitterHandle] = useState(initial.twitterHandle ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(initial.canonicalUrl ?? "");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("siteTitle", siteTitle);
    fd.set("metaDescription", metaDescription);
    fd.set("metaKeywords", metaKeywords);
    fd.set("googleSiteVerification", googleSiteVerification);
    fd.set("twitterHandle", twitterHandle);
    fd.set("canonicalUrl", canonicalUrl);
    startTransition(async () => {
      try {
        await updateSiteSettings(fd);
        toast.success("Global SEO saved");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save global SEO");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <ControlCard
        icon={Type}
        iconClassName="bg-indigo-500/10 text-indigo-600"
        title="Site Title"
        description={`Used for the homepage and anywhere else no more specific title is set. Every other page still keeps its own title, with "| UU7" appended.`}
      >
        <div className="border-t border-border p-5">
          <Input
            id="siteTitle"
            className="h-10 bg-background text-base"
            value={siteTitle}
            onChange={(e) => setSiteTitle(e.target.value)}
          />
        </div>
      </ControlCard>

      <ControlCard
        icon={AlignLeft}
        iconClassName="bg-emerald-500/10 text-emerald-600"
        title="Default Meta Description"
        description="Used for the homepage, and as the fallback for any post, page, or category with no description of its own."
      >
        <div className="border-t border-border p-5">
          <Textarea
            id="metaDescription"
            rows={3}
            className="bg-background text-base"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
          />
        </div>
      </ControlCard>

      <ControlCard
        icon={Tags}
        iconClassName="bg-amber-500/10 text-amber-600"
        title="Meta Keywords"
        description="Comma-separated. Google and Bing have ignored this for ranking purposes for years — only kept here for the rare tool/engine that still reads it."
      >
        <div className="border-t border-border p-5">
          <Input
            id="metaKeywords"
            className="h-10 bg-background text-base"
            placeholder="online rummy, teen patti, betting guides"
            value={metaKeywords}
            onChange={(e) => setMetaKeywords(e.target.value)}
          />
        </div>
      </ControlCard>

      <ControlCard
        icon={ShieldCheck}
        iconClassName="bg-blue-500/10 text-blue-600"
        title="Google Search Console Verification"
        description="The content value from Search Console's HTML tag verification method — not the whole tag, just the code."
      >
        <div className="border-t border-border p-5">
          <Input
            id="googleSiteVerification"
            className="h-10 bg-background text-base"
            placeholder="e.g. abc123XYZ..."
            value={googleSiteVerification}
            onChange={(e) => setGoogleSiteVerification(e.target.value)}
          />
        </div>
      </ControlCard>

      <ControlCard
        icon={AtSign}
        iconClassName="bg-violet-500/10 text-violet-600"
        title="Twitter / X Handle"
        description="Shown as the source account on social share cards."
      >
        <div className="border-t border-border p-5">
          <Input
            id="twitterHandle"
            className="h-10 bg-background text-base"
            placeholder="@uu7game"
            value={twitterHandle}
            onChange={(e) => setTwitterHandle(e.target.value)}
          />
        </div>
      </ControlCard>

      <ControlCard
        icon={LinkIcon}
        iconClassName="bg-brand/10 text-brand"
        title="Canonical URL (Optional)"
        description="Homepage only — every post, page, and category already sets its own canonical URL in its SEO panel. Leave blank to canonicalize to the site's own address."
      >
        <div className="border-t border-border p-5">
          <Input
            id="canonicalUrl"
            className="h-10 bg-background text-base"
            placeholder="https://uu7.io"
            value={canonicalUrl}
            onChange={(e) => setCanonicalUrl(e.target.value)}
          />
        </div>
      </ControlCard>

      <p className="text-sm text-muted-foreground">
        Looking for the social sharing (OG) image? That&apos;s set once for the whole site under{" "}
        <span className="font-medium text-foreground">Branding → Default social image</span>, and every
        post/page/category can also override it individually in its own SEO panel.
      </p>

      <Button type="submit" variant="brand" className="rounded-full px-6" size="lg" disabled={pending}>
        {pending ? "Saving…" : "Save global SEO"}
      </Button>
    </form>
  );
}
