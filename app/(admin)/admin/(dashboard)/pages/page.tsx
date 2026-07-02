import Link from "next/link";
import { db } from "@/lib/db";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deletePage } from "@/lib/actions/pages";

export default async function PagesPage() {
  const rows = await db.query.pages.findMany({ orderBy: (p, { desc }) => desc(p.updatedAt) });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pages</h1>
        <Link href="/admin/pages/new" className={buttonVariants()}>
          New page
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Template</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-32" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.title}</TableCell>
              <TableCell className="text-muted-foreground">{p.template}</TableCell>
              <TableCell>
                <Badge variant={p.status === "published" ? "default" : "secondary"}>{p.status}</Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                <Link href={`/admin/pages/${p.id}/edit`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Edit
                </Link>
                <form action={deletePage.bind(null, p.id)}>
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
                No pages yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
