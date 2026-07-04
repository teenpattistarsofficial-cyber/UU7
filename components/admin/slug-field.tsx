"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slugify } from "@/lib/seo/slugify";
import { cn } from "@/lib/utils";

type Status = "idle" | "checking" | "available" | "taken";

export function SlugField({
  value,
  onChange,
  sourceTitle,
  type,
  excludeId,
}: {
  value: string;
  onChange: (slug: string) => void;
  sourceTitle: string;
  type: "post" | "page";
  excludeId?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const touchedRef = useRef(false);

  // Auto-derive the slug from the title until the editor manually edits the
  // slug field themselves (Module 3: auto slug + manual override).
  useEffect(() => {
    if (touchedRef.current) return;
    onChange(slugify(sourceTitle));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceTitle]);

  useEffect(() => {
    if (!value) {
      setStatus("idle");
      return;
    }
    setStatus("checking");
    const timeout = setTimeout(async () => {
      const params = new URLSearchParams({ slug: value, type });
      if (excludeId) params.set("excludeId", excludeId);
      try {
        const res = await fetch(`/api/admin/slugs/check?${params}`);
        const data = await res.json();
        setStatus(data.available ? "available" : "taken");
      } catch {
        setStatus("idle");
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [value, type, excludeId]);

  return (
    <div className="space-y-2">
      <Label htmlFor="slug">Slug</Label>
      <div className="relative">
        <Input
          id="slug"
          name="slug"
          value={value}
          onChange={(e) => {
            touchedRef.current = true;
            onChange(slugify(e.target.value));
          }}
          className="pr-8"
        />
        <span className="absolute top-1/2 right-2.5 -translate-y-1/2">
          {status === "checking" && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          {status === "available" && <Check className="size-4 text-emerald-500" />}
          {status === "taken" && <X className="size-4 text-destructive" />}
        </span>
      </div>
      {status === "taken" && <p className="text-xs text-destructive">This slug is already in use.</p>}
    </div>
  );
}
