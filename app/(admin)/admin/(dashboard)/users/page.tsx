import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireRole, UnauthorizedError } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { AdminPagination, paginate, parsePerPage } from "@/components/admin/pagination";
import { UsersTable, type UserRow } from "./users-table";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; perPage?: string }>;
}) {
  try {
    await requireRole("admin");
  } catch (err) {
    if (err instanceof UnauthorizedError) redirect("/admin");
    throw err;
  }

  const { page: rawPage, perPage: rawPerPage } = await searchParams;
  const perPage = parsePerPage(rawPerPage);

  const [session, rows] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    db.query.user.findMany({ orderBy: (u, { asc }) => asc(u.createdAt) }),
  ]);

  const userRows: UserRow[] = rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    image: u.image ?? null,
    role: u.role as UserRow["role"],
    createdAt: u.createdAt,
  }));

  const { pageRows, currentPage, totalPages, totalItems } = paginate(userRows, rawPage, perPage);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="mt-1 text-muted-foreground">Add team members, assign roles, and remove accounts.</p>
      </div>

      <UsersTable rows={pageRows} currentUserId={session?.user?.id ?? ""} />
      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        perPage={perPage}
        basePath="/admin/users"
        params={{ perPage: rawPerPage }}
      />
    </div>
  );
}
