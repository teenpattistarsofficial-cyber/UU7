import { renderContentHtml } from "@/lib/editor/render";
import { toTiptapDoc } from "@/lib/editor/doc";

/** Shared body renderer for admin-authored CMS pages (about/contact/legal/
 * default templates, and any custom page) — the same Tiptap JSON -> HTML
 * pipeline the article template uses, just without the AEO/GEO blocks
 * (quick answer, FAQ, citations, etc.) that only make sense for posts. */
export function CmsPageBody({ title, content }: { title: string; content: unknown }) {
  const html = renderContentHtml(toTiptapDoc(content));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-4 text-3xl font-semibold">{title}</h1>
      <div
        className="prose prose-neutral max-w-none dark:prose-invert"
        // Safe: content is authored exclusively by authenticated
        // admin/editor roles through the Tiptap editor.
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
