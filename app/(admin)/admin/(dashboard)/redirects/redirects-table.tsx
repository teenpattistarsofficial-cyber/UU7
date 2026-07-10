"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2, ArrowRightLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FormSelect } from "@/components/admin/form-select";
import { ControlCard } from "@/components/admin/control-card";
import { createRedirect, deleteRedirect } from "@/lib/actions/redirects";

export type RedirectRow = { id: string; fromPath: string; toPath: string; statusCode: number; createdAt: Date };

const STATUS_OPTIONS = [
  { value: "308", label: "308 — Permanent" },
  { value: "307", label: "307 — Temporary" },
  { value: "301", label: "301 — Permanent (legacy)" },
  { value: "302", label: "302 — Temporary (legacy)" },
];

export function RedirectsTable({ initialRows }: { initialRows: RedirectRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [fromPath, setFromPath] = useState("");
  const [toPath, setToPath] = useState("");
  const [statusCode, setStatusCode] = useState("308");
  const [pending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("fromPath", fromPath);
    fd.set("toPath", toPath);
    fd.set("statusCode", statusCode);
    startTransition(async () => {
      try {
        const row = await createRedirect(fd);
        if (row) setRows((prev) => [row, ...prev]);
        toast.success("Redirect created");
        setFromPath("");
        setToPath("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to create redirect");
      }
    });
  }

  async function handleDelete(id: string) {
    try {
      await deleteRedirect(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast.success("Redirect deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete redirect");
    }
  }

  return (
    <div className="space-y-6">
      <ControlCard
        icon={ArrowRightLeft}
        iconClassName="bg-brand/10 text-brand"
        title="Add a Redirect"
        description="Send an old or changed URL to its new destination instead of 404ing."
      >
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3 border-t border-border p-5">
          <div className="min-w-[200px] flex-1 space-y-1.5">
            <Label className="text-sm text-muted-foreground uppercase">From path</Label>
            <Input
              className="h-10 bg-background text-base"
              value={fromPath}
              onChange={(e) => setFromPath(e.target.value)}
              placeholder="/old-slug"
              required
            />
          </div>
          <div className="min-w-[200px] flex-1 space-y-1.5">
            <Label className="text-sm text-muted-foreground uppercase">To path</Label>
            <Input
              className="h-10 bg-background text-base"
              value={toPath}
              onChange={(e) => setToPath(e.target.value)}
              placeholder="/new-slug"
              required
            />
          </div>
          <div className="w-48 space-y-1.5">
            <Label className="text-sm text-muted-foreground uppercase">Status</Label>
            <FormSelect value={statusCode} onValueChange={setStatusCode} options={STATUS_OPTIONS} triggerClassName="h-10 bg-background text-base" />
          </div>
          <Button type="submit" variant="brand" className="rounded-full px-5" disabled={pending}>
            {pending ? "Adding…" : "Add redirect"}
          </Button>
        </form>
      </ControlCard>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-11 px-4">From</TableHead>
              <TableHead className="px-4">To</TableHead>
              <TableHead className="px-4">Status</TableHead>
              <TableHead className="w-16 px-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="px-4 py-3 font-mono text-sm">{r.fromPath}</TableCell>
                <TableCell className="px-4 py-3 font-mono text-sm text-muted-foreground">{r.toPath}</TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">{r.statusCode}</TableCell>
                <TableCell className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id)}
                    className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  No redirects yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
