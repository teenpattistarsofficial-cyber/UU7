import Link from "next/link";
import { db } from "@/lib/db";
import { Button, buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteAuthor } from "@/lib/actions/authors";

export default async function AuthorsPage() {
  const rows = await db.query.authors.findMany({ orderBy: (a, { asc }) => asc(a.displayName) });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Authors</h1>
        <Link href="/admin/authors/new" className={buttonVariants()}>
          New author
        </Link>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-11 px-4">Name</TableHead>
              <TableHead className="px-4">Role</TableHead>
              <TableHead className="px-4">Slug</TableHead>
              <TableHead className="w-32 px-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="px-4 py-3 font-medium">{a.displayName}</TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">{a.roleTitle}</TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">{a.slug}</TableCell>
                <TableCell className="flex justify-end gap-2 px-4 py-3">
                  <Link href={`/admin/authors/${a.id}/edit`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                    Edit
                  </Link>
                  <form action={deleteAuthor.bind(null, a.id)}>
                    <Button type="submit" variant="ghost" size="sm">
                      Delete
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  No authors yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
