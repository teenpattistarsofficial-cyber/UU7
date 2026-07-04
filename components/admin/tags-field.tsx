"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TagsField({
  id,
  value,
  onChange,
}: {
  id?: string;
  value: string[];
  onChange: (tags: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function commitDraft() {
    const name = draft.trim();
    setDraft("");
    if (!name) return;
    if (value.some((t) => t.toLowerCase() === name.toLowerCase())) return;
    onChange([...value, name]);
  }

  return (
    <div className="flex flex-wrap gap-1.5 rounded-md border border-input px-2.5 py-2">
      {value.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1 pr-1">
          #{tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="rounded-full hover:bg-foreground/10"
            aria-label={`Remove ${tag}`}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commitDraft();
          } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={commitDraft}
        placeholder={value.length === 0 ? "Add tags, press Enter…" : ""}
        className="min-w-[8rem] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
