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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead className="w-32" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-medium">{a.displayName}</TableCell>
              <TableCell className="text-muted-foreground">{a.roleTitle}</TableCell>
              <TableCell className="text-muted-foreground">{a.slug}</TableCell>
              <TableCell className="flex justify-end gap-2">
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
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No authors yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
