import Link from "next/link";
import { db } from "@/lib/db";
import { authors, categories } from "@/lib/db/schema";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deletePost } from "@/lib/actions/posts";

export default async function PostsPage() {
  const [rows, authorRows, categoryRows] = await Promise.all([
    db.query.posts.findMany({ orderBy: (p, { desc }) => desc(p.updatedAt) }),
    db.select().from(authors),
    db.select().from(categories),
  ]);
  const authorById = new Map(authorRows.map((a) => [a.id, a]));
  const categoryById = new Map(categoryRows.map((c) => [c.id, c]));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Posts</h1>
        <Link href="/admin/posts/new" className={buttonVariants()}>
          New post
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-32" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.title}</TableCell>
              <TableCell className="text-muted-foreground">
                {(p.categoryId && categoryById.get(p.categoryId)?.name) ?? "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {(p.authorId && authorById.get(p.authorId)?.displayName) ?? "—"}
              </TableCell>
              <TableCell>
                <Badge variant={p.status === "published" ? "default" : "secondary"}>{p.status}</Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                <Link href={`/admin/posts/${p.id}/edit`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Edit
                </Link>
                <form action={deletePost.bind(null, p.id)}>
                  <Button type="submit" variant="ghost" size="sm">
                    Delete
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No posts yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
