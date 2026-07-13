import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TableKit } from "@tiptap/extension-table";
import Youtube from "@tiptap/extension-youtube";
import type { Extensions } from "@tiptap/core";

// Schema-defining extensions only — shared between the client editor and
// the server-side HTML renderer (lib/editor/render.ts) so both sides parse
// the same document shape. UI-only extensions (e.g. Placeholder) live
// solely in the client editor component, since they don't affect the
// serialized content.
//
// Headings are capped at H2-H4: the post title renders as the page's H1
// outside the editor, so nothing inside body content should be able to
// produce a second H1 — this keeps single-H1 structure true by
// construction rather than relying only on a post-hoc validator later.
//
// Link is configured through StarterKit's own `link` option (Tiptap v3
// bundles it there) rather than added as a separate extension — doing both
// registers it twice and Tiptap warns/breaks on duplicate extension names.
// Underline, Strike, inline Code, Blockquote and HorizontalRule are also
// already part of StarterKit v3 — only genuinely missing pieces (alignment,
// tables, video embeds) are added below.
export const editorExtensions: Extensions = [
  StarterKit.configure({
    heading: { levels: [2, 3, 4] },
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
      // The extension's own default forces target="_blank" on every link
      // regardless of the mark's own `target` attribute — every internal
      // link across the site was opening in a new tab because of this, not
      // because of anything authored. Overriding the default to null here
      // means a link only opens in a new tab when a mark explicitly sets
      // target: "_blank" (external citations/backlinks); internal links
      // with no explicit target correctly stay in the same tab.
      HTMLAttributes: { target: null },
    },
  }),
  Image,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  TableKit.configure({ table: { resizable: false } }),
  Youtube.configure({ nocookie: true, width: 640, height: 360 }),
];
