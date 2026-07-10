import { FolderTree, Users, Image as ImageIcon, ShieldCheck, Sparkles, MessageSquare } from "lucide-react";
import { RankedList } from "@/components/admin/dashboard/ranked-list";

function mimeTypeLabel(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "Images";
  if (mimeType.startsWith("video/")) return "Videos";
  return mimeType;
}

export function TopCategoriesAuthorsSection({
  categories,
  authors,
}: {
  categories: { name: string; count: number }[];
  authors: { name: string; count: number }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
          <FolderTree className="size-3.5 text-brand" />
          Top Categories
        </h3>
        <RankedList items={categories.map((c) => ({ label: c.name, value: c.count }))} emptyLabel="No categories yet." />
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
          <Users className="size-3.5 text-brand" />
          Top Authors
        </h3>
        <RankedList items={authors.map((a) => ({ label: a.name, value: a.count }))} emptyLabel="No authors yet." />
      </div>
    </div>
  );
}

export function MostCommentedMediaTypesSection({
  mostCommented,
  mediaTypes,
}: {
  mostCommented: { title: string; count: number }[];
  mediaTypes: { mimeType: string; count: number }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
          <MessageSquare className="size-3.5 text-brand" />
          Most Commented Posts
        </h3>
        <RankedList
          items={mostCommented.map((p) => ({ label: p.title, value: p.count }))}
          emptyLabel="No comments yet."
        />
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
          <ImageIcon className="size-3.5 text-brand" />
          Media Types
        </h3>
        <RankedList
          items={mediaTypes.map((m) => ({ label: mimeTypeLabel(m.mimeType), value: m.count }))}
          emptyLabel="No media uploaded yet."
        />
      </div>
    </div>
  );
}

export function UserRolesSnapshotSection({
  roles,
  snapshot,
}: {
  roles: { role: string; count: number }[];
  snapshot: { icon: React.ComponentType<{ className?: string }>; label: string }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
          <ShieldCheck className="size-3.5 text-brand" />
          User Roles
        </h3>
        <RankedList items={roles.map((r) => ({ label: r.role, value: r.count }))} emptyLabel="No users yet." />
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <Sparkles className="size-3.5 text-brand" />
            Latest Snapshot
          </h3>
        </div>
        <div className="space-y-2">
          {snapshot.map((s, i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-lg bg-muted/40 px-3 py-2.5 text-sm font-medium">
              <s.icon className="size-4 text-brand" />
              {s.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

