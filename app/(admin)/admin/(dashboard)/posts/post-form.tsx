import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type PostDefaults = {
  title?: string;
  slug?: string;
  content?: unknown;
  excerpt?: string | null;
  status?: string;
  authorId?: string | null;
  categoryId?: string | null;
  featuredImageUrl?: string | null;
};

export function PostForm({
  action,
  defaultValues,
  authors,
  categories,
}: {
  action: (formData: FormData) => void;
  defaultValues?: PostDefaults;
  authors: { id: string; displayName: string }[];
  categories: { id: string; name: string }[];
}) {
  const contentText = typeof defaultValues?.content === "string" ? defaultValues.content : "";

  return (
    <form action={action} className="max-w-2xl space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required defaultValue={defaultValues?.title} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" placeholder="auto-generated if left blank" defaultValue={defaultValues?.slug} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select id="status" name="status" defaultValue={defaultValues?.status ?? "draft"} className={selectClassName}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <select id="categoryId" name="categoryId" defaultValue={defaultValues?.categoryId ?? ""} className={selectClassName}>
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="authorId">Author</Label>
          <select id="authorId" name="authorId" defaultValue={defaultValues?.authorId ?? ""} className={selectClassName}>
            <option value="">—</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="featuredImageUrl">Featured image URL</Label>
        <Input id="featuredImageUrl" name="featuredImageUrl" defaultValue={defaultValues?.featuredImageUrl ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea id="excerpt" name="excerpt" rows={2} defaultValue={defaultValues?.excerpt ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <p className="text-xs text-muted-foreground">
          Plain text for now — the rich text editor and full SEO/AEO field set land in Phase 2.
        </p>
        <Textarea id="content" name="content" rows={14} defaultValue={contentText} />
      </div>
      <Button type="submit">Save</Button>
    </form>
  );
}
