import Link from "next/link";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { Button, buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteCategory } from "@/lib/actions/categories";

export default async function CategoriesPage() {
  const rows = await db.query.categories.findMany({ orderBy: (c, { asc }) => asc(c.name) });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Link href="/admin/categories/new" className={buttonVariants()}>
          New category
        </Link>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-11 px-4">Name</TableHead>
              <TableHead className="px-4">Slug</TableHead>
              <TableHead className="w-32 px-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="px-4 py-3 font-medium">{c.name}</TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">{c.slug}</TableCell>
                <TableCell className="flex justify-end gap-2 px-4 py-3">
                  <Link href={`/admin/categories/${c.id}/edit`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                    Edit
                  </Link>
                  <form action={deleteCategory.bind(null, c.id)}>
                    <Button type="submit" variant="ghost" size="sm">
                      Delete
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={3} className="px-4 py-10 text-center text-muted-foreground">
                  No categories yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
