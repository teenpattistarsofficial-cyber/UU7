import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { renderContentHtml } from "@/lib/editor/render";
import { toTiptapDoc } from "@/lib/editor/doc";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { SiteCta } from "@/components/home/site-cta";

/** Shared body renderer for admin-authored CMS pages (about/contact/legal/
 * default templates, and any custom page) — the same Tiptap JSON -> HTML
 * pipeline the article template uses, just without the AEO/GEO blocks
 * (quick answer, FAQ, citations, etc.) that only make sense for posts.
 * `eyebrow`/`icon` are optional so ad-hoc custom pages (created through
 * the admin, not one of the four hardcoded routes below) can still render
 * with just a title, no per-page metadata to supply them.
 *
 * `showCta` is opt-in, not a default-on flag, and deliberately used by
 * only one of this component's four call sites (about/page.tsx) — Contact,
 * Editorial Policy, and Responsible Gaming stay CTA-free on purpose.
 * Responsible Gaming especially: that page's whole job is to slow someone
 * down and flag risk, so a "Visit UU7GAME" button right under it would cut
 * directly against its purpose (and read badly under any compliance
 * review), not just look out of place the way it would on Contact/legal
 * pages. */
export function CmsPageBody({
  title,
  content,
  eyebrow,
  icon: Icon,
  showCta = false,
  children,
}: {
  title: string;
  content: unknown;
  eyebrow?: string;
  icon?: LucideIcon;
  showCta?: boolean;
  children?: ReactNode;
}) {
  const html = renderContentHtml(toTiptapDoc(content));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: title }]} />

      {Icon && (
        <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <Icon className="size-6" />
        </span>
      )}
      {eyebrow && <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-brand uppercase">{eyebrow}</p>}
      <h1 className="mb-6 font-heading text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>

      <div
        className="prose prose-neutral max-w-none prose-headings:font-heading prose-a:text-brand prose-a:no-underline prose-a:hover:underline prose-img:aspect-video prose-img:w-full prose-img:rounded-xl prose-img:object-cover dark:prose-invert"
        // Safe: content is authored exclusively by authenticated
        // admin/editor roles through the Tiptap editor.
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {children}

      {showCta && (
        <div className="mt-10">
          <SiteCta />
        </div>
      )}
    </div>
  );
}
