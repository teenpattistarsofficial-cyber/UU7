"use client";

import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export type FaqItem = { question: string; answer: string };

/** Repeatable Q&A list (Module 11) — feeds the public FaqSection and the
 * FAQPage JSON-LD block. Full array is owned by the parent form; this is a
 * plain controlled list editor, no local state of its own. */
export function FaqBuilder({ value, onChange }: { value: FaqItem[]; onChange: (items: FaqItem[]) => void }) {
  function update(index: number, patch: Partial<FaqItem>) {
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function add() {
    onChange([...value, { question: "", answer: "" }]);
  }

  return (
    <div className="space-y-3">
      {value.map((item, i) => (
        <div key={i} className="space-y-2 rounded-lg border border-border p-3">
          <div className="flex items-center gap-1.5">
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="text-muted-foreground disabled:opacity-30"
              >
                <ChevronUp className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === value.length - 1}
                className="text-muted-foreground disabled:opacity-30"
              >
                <ChevronDown className="size-3.5" />
              </button>
            </div>
            <Input
              placeholder="Question"
              value={item.question}
              onChange={(e) => update(i, { question: e.target.value })}
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              title="Remove"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
          <Textarea
            placeholder="Answer"
            rows={2}
            value={item.answer}
            onChange={(e) => update(i, { answer: e.target.value })}
          />
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={add} className="gap-1.5">
        <Plus className="size-4" />
        Add question
      </Button>

      {value.length === 0 && (
        <p className="text-xs text-muted-foreground">No FAQs yet — add one to feed the FAQ schema and on-page FAQ section.</p>
      )}
    </div>
  );
}
