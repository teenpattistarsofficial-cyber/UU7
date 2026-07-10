"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { UserPlus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FormSelect } from "@/components/admin/form-select";
import { ControlCard } from "@/components/admin/control-card";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { AuthorAvatar } from "@/components/site/author-avatar";
import { createUser, setUserRole, deleteUser } from "@/lib/actions/users";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: "admin" | "editor" | "author";
  createdAt: Date;
};

const ROLE_OPTIONS = [
  { value: "author", label: "Author" },
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Admin" },
];

const ROLE_BADGE_STYLE: Record<UserRow["role"], string> = {
  admin: "bg-brand/10 text-brand",
  editor: "bg-blue-500/10 text-blue-600",
  author: "bg-muted text-muted-foreground",
};

export function UsersTable({ rows: initialRows, currentUserId }: { rows: UserRow[]; currentUserId: string }) {
  const [rows, setRows] = useState(initialRows);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("author");
  const [creating, startCreating] = useTransition();
  const [rolePending, setRolePending] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [deleting, startDeleting] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("name", name);
    fd.set("email", email);
    fd.set("password", password);
    fd.set("role", role);
    startCreating(async () => {
      try {
        const row = await createUser(fd);
        if (row) setRows((prev) => [...prev, { ...row, role: row.role as UserRow["role"] }]);
        toast.success("User created");
        setName("");
        setEmail("");
        setPassword("");
        setRole("author");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to create user");
      }
    });
  }

  async function handleRoleChange(userId: string, newRole: string) {
    setRolePending(userId);
    try {
      await setUserRole(userId, newRole as UserRow["role"]);
      setRows((prev) => prev.map((r) => (r.id === userId ? { ...r, role: newRole as UserRow["role"] } : r)));
      toast.success("Role updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setRolePending(null);
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    startDeleting(async () => {
      try {
        await deleteUser(id);
        setRows((prev) => prev.filter((r) => r.id !== id));
        toast.success("User deleted");
        setDeleteTarget(null);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete user");
      }
    });
  }

  return (
    <div className="space-y-6">
      <ControlCard
        icon={UserPlus}
        iconClassName="bg-brand/10 text-brand"
        title="Add a User"
        description="Create a new team account and assign its role."
      >
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3 border-t border-border p-5">
          <div className="min-w-[180px] flex-1 space-y-1.5">
            <Label className="text-sm text-muted-foreground uppercase">Name</Label>
            <Input className="h-10 bg-background text-base" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
          </div>
          <div className="min-w-[200px] flex-1 space-y-1.5">
            <Label className="text-sm text-muted-foreground uppercase">Email</Label>
            <Input
              className="h-10 bg-background text-base"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@uu7.io"
              required
            />
          </div>
          <div className="min-w-[180px] flex-1 space-y-1.5">
            <Label className="text-sm text-muted-foreground uppercase">Password</Label>
            <Input
              className="h-10 bg-background text-base"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
            />
          </div>
          <div className="w-40 space-y-1.5">
            <Label className="text-sm text-muted-foreground uppercase">Role</Label>
            <FormSelect value={role} onValueChange={setRole} options={ROLE_OPTIONS} triggerClassName="h-10 bg-background text-base" />
          </div>
          <Button type="submit" variant="brand" className="rounded-full px-5" disabled={creating}>
            {creating ? "Creating…" : "Create user"}
          </Button>
        </form>
      </ControlCard>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete user?"
        description={`This will permanently delete ${deleteTarget?.name ?? "this user"}'s account. This cannot be undone.`}
        confirmLabel="Delete"
        pending={deleting}
        onConfirm={handleDelete}
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-11 px-4">User</TableHead>
              <TableHead className="px-4">Role</TableHead>
              <TableHead className="w-16 px-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((u) => {
              const isSelf = u.id === currentUserId;
              return (
                <TableRow key={u.id}>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <AuthorAvatar displayName={u.name} avatarUrl={u.image} size="size-9" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate font-medium">{u.name}</span>
                          {isSelf && <Badge variant="outline" className="h-5 px-1.5 text-[10px]">You</Badge>}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {isSelf ? (
                      <Badge className={cnBadge(u.role)}>{u.role[0].toUpperCase() + u.role.slice(1)}</Badge>
                    ) : (
                      <FormSelect
                        value={u.role}
                        onValueChange={(v) => handleRoleChange(u.id, v)}
                        options={ROLE_OPTIONS}
                        triggerClassName="h-8 w-32 bg-background text-sm"
                      />
                    )}
                    {rolePending === u.id && <span className="ml-2 text-xs text-muted-foreground">Saving…</span>}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {!isSelf && (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(u)}
                        className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={3} className="px-4 py-10 text-center text-muted-foreground">
                  No users yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function cnBadge(role: UserRow["role"]) {
  return `${ROLE_BADGE_STYLE[role]} h-6 px-2.5 text-xs uppercase`;
}
