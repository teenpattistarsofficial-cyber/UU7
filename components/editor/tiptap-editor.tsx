"use client";

import { useState } from "react";
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import { generateHTML, generateJSON } from "@tiptap/html";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  Code,
  Heading2,
  Heading3,
  Heading4,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  ImageIcon,
  Video as VideoIcon,
  TableIcon,
  Undo2,
  Redo2,
} from "lucide-react";
import { editorExtensions } from "@/lib/editor/extensions";
import { toTiptapDoc } from "@/lib/editor/doc";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { MediaPicker } from "@/components/admin/media-picker";

export function TiptapEditor({
  content,
  onChange,
}: {
  content: unknown;
  onChange: (json: JSONContent) => void;
}) {
  const [mode, setMode] = useState<"visual" | "code">("visual");
  const [htmlSource, setHtmlSource] = useState("");
  const [imagePickerOpen, setImagePickerOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      ...editorExtensions,
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    content: toTiptapDoc(content),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[320px] px-4 py-3 focus:outline-none dark:prose-invert",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  });

  if (!editor) return null;

  function switchToCode() {
    setHtmlSource(generateHTML(editor!.getJSON(), editorExtensions));
    setMode("code");
  }

  function switchToVisual() {
    try {
      const json = generateJSON(htmlSource, editorExtensions);
      editor!.commands.setContent(json);
      onChange(json);
    } catch {
      // Malformed HTML — keep whatever the editor already had rather than
      // losing the writer's edits.
    }
    setMode("visual");
  }

  return (
    // No `overflow-hidden` here on purpose — it would establish a scrolling
    // box that position:sticky (used on the toolbar below) anchors to
    // instead of the page's real scroll container, silently breaking the
    // stickiness. Corner rounding is applied directly on the toolbar/content
    // children instead of relying on clipping from this wrapper.
    <div className="rounded-lg border border-input">
      <Toolbar
        editor={editor}
        mode={mode}
        onSwitchToCode={switchToCode}
        onSwitchToVisual={switchToVisual}
        onInsertImage={() => setImagePickerOpen(true)}
      />
      {mode === "visual" ? (
        <EditorContent editor={editor} className="rounded-b-lg bg-background" />
      ) : (
        <Textarea
          value={htmlSource}
          onChange={(e) => setHtmlSource(e.target.value)}
          spellCheck={false}
          className="min-h-[320px] rounded-t-none rounded-b-lg border-0 bg-background font-mono text-xs focus-visible:ring-0"
        />
      )}
      <MediaPicker
        open={imagePickerOpen}
        onOpenChange={setImagePickerOpen}
        onSelect={(item) => editor.chain().focus().setImage({ src: item.url, alt: item.alt }).run()}
      />
    </div>
  );
}

function Toolbar({
  editor,
  mode,
  onSwitchToCode,
  onSwitchToVisual,
  onInsertImage,
}: {
  editor: NonNullable<ReturnType<typeof useEditor>>;
  mode: "visual" | "code";
  onSwitchToCode: () => void;
  onSwitchToVisual: () => void;
  onInsertImage: () => void;
}) {
  const markButtons = [
    { icon: Bold, label: "Bold", isActive: () => editor.isActive("bold"), run: () => editor.chain().focus().toggleBold().run() },
    { icon: Italic, label: "Italic", isActive: () => editor.isActive("italic"), run: () => editor.chain().focus().toggleItalic().run() },
    { icon: UnderlineIcon, label: "Underline", isActive: () => editor.isActive("underline"), run: () => editor.chain().focus().toggleUnderline().run() },
    { icon: Strikethrough, label: "Strikethrough", isActive: () => editor.isActive("strike"), run: () => editor.chain().focus().toggleStrike().run() },
    { icon: Code, label: "Inline code", isActive: () => editor.isActive("code"), run: () => editor.chain().focus().toggleCode().run() },
  ];

  // Capped at H2-H4 on purpose — the post title renders as the page's H1,
  // so nothing here should be able to create a second one.
  const headingButtons = [
    { icon: Heading2, label: "Heading 2", isActive: () => editor.isActive("heading", { level: 2 }), run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { icon: Heading3, label: "Heading 3", isActive: () => editor.isActive("heading", { level: 3 }), run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { icon: Heading4, label: "Heading 4", isActive: () => editor.isActive("heading", { level: 4 }), run: () => editor.chain().focus().toggleHeading({ level: 4 }).run() },
  ];

  const linkButton = {
    icon: LinkIcon,
    label: "Link",
    isActive: () => editor.isActive("link"),
    run: () => {
      const previousUrl = editor.getAttributes("link").href as string | undefined;
      const url = window.prompt("URL", previousUrl ?? "https://");
      if (url === null) return;
      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    },
  };

  const alignButtons = [
    { icon: AlignLeft, label: "Align left", isActive: () => editor.isActive({ textAlign: "left" }), run: () => editor.chain().focus().setTextAlign("left").run() },
    { icon: AlignCenter, label: "Align center", isActive: () => editor.isActive({ textAlign: "center" }), run: () => editor.chain().focus().setTextAlign("center").run() },
    { icon: AlignRight, label: "Align right", isActive: () => editor.isActive({ textAlign: "right" }), run: () => editor.chain().focus().setTextAlign("right").run() },
    { icon: AlignJustify, label: "Justify", isActive: () => editor.isActive({ textAlign: "justify" }), run: () => editor.chain().focus().setTextAlign("justify").run() },
  ];

  const structureButtons = [
    { icon: List, label: "Bullet list", isActive: () => editor.isActive("bulletList"), run: () => editor.chain().focus().toggleBulletList().run() },
    { icon: ListOrdered, label: "Numbered list", isActive: () => editor.isActive("orderedList"), run: () => editor.chain().focus().toggleOrderedList().run() },
    { icon: Quote, label: "Quote", isActive: () => editor.isActive("blockquote"), run: () => editor.chain().focus().toggleBlockquote().run() },
    { icon: Minus, label: "Horizontal rule", isActive: () => false, run: () => editor.chain().focus().setHorizontalRule().run() },
  ];

  const insertButtons = [
    {
      icon: ImageIcon,
      label: "Insert image",
      isActive: () => false,
      run: onInsertImage,
    },
    {
      icon: VideoIcon,
      label: "Insert YouTube video",
      isActive: () => false,
      run: () => {
        const url = window.prompt("YouTube URL");
        if (url) editor.commands.setYoutubeVideo({ src: url });
      },
    },
    {
      icon: TableIcon,
      label: "Insert table",
      isActive: () => false,
      run: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
  ];

  return (
    // Sticky so the formatting controls stay reachable while scrolling
    // through a long article — solid `bg-muted` (not the old /50 opacity)
    // so article text scrolling underneath doesn't show through once stuck.
    <div className="sticky top-0 z-10 rounded-t-lg border-b border-input bg-muted p-1.5">
      <div className="flex flex-wrap items-center gap-0.5">
        {mode === "visual" && (
          <>
            <ToolbarGroup buttons={markButtons} />
            <Divider />
            <ToolbarGroup buttons={headingButtons} />
            <Divider />
            <ToolbarGroup buttons={[linkButton]} />
            <Divider />
            <ToolbarGroup buttons={alignButtons} />
            <Divider />
            <ToolbarGroup buttons={structureButtons} />
            <Divider />
            <ToolbarGroup buttons={insertButtons} />
            <Divider />
            <button
              type="button"
              title="Undo"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().undo().run()}
              className={toolbarButtonClass(false)}
            >
              <Undo2 className="size-4" />
            </button>
            <button
              type="button"
              title="Redo"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().redo().run()}
              className={toolbarButtonClass(false)}
            >
              <Redo2 className="size-4" />
            </button>
          </>
        )}
        <div className="ml-auto flex items-center rounded-md border border-input bg-background p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={onSwitchToVisual}
            className={cn("rounded px-2 py-1", mode === "visual" ? "bg-foreground text-background" : "text-muted-foreground")}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={onSwitchToCode}
            className={cn("rounded px-2 py-1", mode === "code" ? "bg-foreground text-background" : "text-muted-foreground")}
          >
            Code
          </button>
        </div>
      </div>
    </div>
  );
}

type ToolbarButtonSpec = { icon: typeof Bold; label: string; isActive: () => boolean; run: () => void };

function toolbarButtonClass(active: boolean) {
  return cn(
    "flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground",
    active && "bg-accent text-accent-foreground",
  );
}

function ToolbarGroup({ buttons }: { buttons: ToolbarButtonSpec[] }) {
  return (
    <>
      {buttons.map((btn) => (
        <button
          key={btn.label}
          type="button"
          title={btn.label}
          // Without this, the mousedown blurs the editor and collapses its
          // text selection before onClick runs `.focus().toggleX()` — so
          // e.g. Bold would silently do nothing on the selected text.
          onMouseDown={(e) => e.preventDefault()}
          onClick={btn.run}
          className={toolbarButtonClass(btn.isActive())}
        >
          <btn.icon className="size-4" />
        </button>
      ))}
    </>
  );
}

function Divider() {
  return <span className="mx-1 h-4 w-px bg-border" />;
}
