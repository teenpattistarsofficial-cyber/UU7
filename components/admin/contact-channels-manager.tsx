"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2, ChevronUp, ChevronDown, MessageSquarePlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FormSelect } from "@/components/admin/form-select";
import { ControlCard } from "@/components/admin/control-card";
import {
  CONTACT_CHANNEL_ICONS,
  CONTACT_CHANNEL_KIND_OPTIONS,
  getContactChannelHref,
  type ContactChannelKind,
} from "@/lib/contact-channels";
import { createContactChannel, deleteContactChannel, moveContactChannel } from "@/lib/actions/contact-channels";

export type ContactChannelRow = {
  id: string;
  kind: ContactChannelKind;
  label: string;
  value: string;
  position: number;
};

const VALUE_PLACEHOLDERS: Record<ContactChannelKind, string> = {
  telegram: "https://t.me/yourbot",
  whatsapp: "https://wa.me/91XXXXXXXXXX",
  email: "you@example.com",
  phone: "+91 98765 43210",
  website: "https://example.com",
};

export function ContactChannelsManager({ initialRows }: { initialRows: ContactChannelRow[] }) {
  const [rows, setRows] = useState(
    [...initialRows].sort((a, b) => a.position - b.position),
  );
  const [kind, setKind] = useState<ContactChannelKind>("telegram");
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("kind", kind);
    fd.set("label", label || CONTACT_CHANNEL_KIND_OPTIONS.find((o) => o.value === kind)?.label || "");
    fd.set("value", value);
    startTransition(async () => {
      try {
        const row = await createContactChannel(fd);
        if (row) setRows((prev) => [...prev, row]);
        toast.success("Contact channel added");
        setLabel("");
        setValue("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to add contact channel");
      }
    });
  }

  async function handleDelete(id: string) {
    try {
      await deleteContactChannel(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast.success("Contact channel removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove contact channel");
    }
  }

  function handleMove(id: string, direction: -1 | 1) {
    const index = rows.findIndex((r) => r.id === id);
    const targetIndex = index + direction;
    if (index === -1 || targetIndex < 0 || targetIndex >= rows.length) return;
    // Optimistic local swap — matches the actual position swap the server
    // action performs, so the list doesn't wait on a round-trip to reorder.
    const next = [...rows];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    setRows(next);
    startTransition(async () => {
      try {
        await moveContactChannel(id, direction);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to reorder");
      }
    });
  }

  return (
    <div className="space-y-6">
      <ControlCard
        icon={MessageSquarePlus}
        iconClassName="bg-brand/10 text-brand"
        title="Add a Contact Channel"
        description="Telegram, WhatsApp, email, phone, or a website link."
      >
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3 border-t border-border p-5">
          <div className="w-44 space-y-1.5">
            <Label className="text-sm text-muted-foreground uppercase">Kind</Label>
            <FormSelect
              value={kind}
              onValueChange={(v) => setKind(v as ContactChannelKind)}
              options={CONTACT_CHANNEL_KIND_OPTIONS}
              triggerClassName="h-10 bg-background text-base"
            />
          </div>
          <div className="min-w-[160px] flex-1 space-y-1.5">
            <Label className="text-sm text-muted-foreground uppercase">Label</Label>
            <Input
              className="h-10 bg-background text-base"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={CONTACT_CHANNEL_KIND_OPTIONS.find((o) => o.value === kind)?.label}
            />
          </div>
          <div className="min-w-[220px] flex-1 space-y-1.5">
            <Label className="text-sm text-muted-foreground uppercase">
              {kind === "email" ? "Email address" : kind === "phone" ? "Phone number" : "URL"}
            </Label>
            <Input
              className="h-10 bg-background text-base"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={VALUE_PLACEHOLDERS[kind]}
              required
            />
          </div>
          <Button type="submit" variant="brand" className="rounded-full px-5" disabled={pending}>
            {pending ? "Adding…" : "Add channel"}
          </Button>
        </form>
      </ControlCard>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-11 px-4">Channel</TableHead>
              <TableHead className="px-4">Links to</TableHead>
              <TableHead className="w-28 px-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => {
              const Icon = CONTACT_CHANNEL_ICONS[row.kind];
              const href = getContactChannelHref(row.kind, row.value);
              return (
                <TableRow key={row.id}>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                        <Icon className="size-4" />
                      </span>
                      <span className="font-medium">{row.label}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground underline hover:text-foreground">
                      {row.value}
                    </a>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleMove(row.id, -1)}
                        disabled={i === 0}
                        className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-30"
                        title="Move up"
                      >
                        <ChevronUp className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(row.id, 1)}
                        disabled={i === rows.length - 1}
                        className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-30"
                        title="Move down"
                      >
                        <ChevronDown className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(row.id)}
                        className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        title="Remove"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={3} className="px-4 py-10 text-center text-muted-foreground">
                  No contact channels yet — add one above.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
