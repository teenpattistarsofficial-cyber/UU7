"use client";

import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

/** Module 12 — a dense, factual summary plus an ordered list of key
 * takeaways, rendered publicly as a distinct GEO-targeted callout. */
export function AiSummaryBuilder({
  summary,
  onSummaryChange,
  takeaways,
  onTakeawaysChange,
}: {
  summary: string;
  onSummaryChange: (value: string) => void;
  takeaways: string[];
  onTakeawaysChange: (value: string[]) => void;
}) {
  function update(index: number, value: string) {
    onTakeawaysChange(takeaways.map((t, i) => (i === index ? value : t)));
  }

  function remove(index: number) {
    onTakeawaysChange(takeaways.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= takeaways.length) return;
    const next = [...takeaways];
    [next[index], next[target]] = [next[target], next[index]];
    onTakeawaysChange(next);
  }

  function add() {
    onTakeawaysChange([...takeaways, ""]);
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="aiSummary">Summary</Label>
        <Textarea
          id="aiSummary"
          rows={3}
          placeholder="A dense, factual 2-3 sentence summary an AI assistant could quote directly."
          value={summary}
          onChange={(e) => onSummaryChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Key takeaways</Label>
        {takeaways.map((takeaway, i) => (
          <div key={i} className="flex items-center gap-1.5">
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
                disabled={i === takeaways.length - 1}
                className="text-muted-foreground disabled:opacity-30"
              >
                <ChevronDown className="size-3.5" />
              </button>
            </div>
            <Input value={takeaway} onChange={(e) => update(i, e.target.value)} placeholder="Key takeaway" className="flex-1" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              title="Remove"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={add} className="gap-1.5">
          <Plus className="size-4" />
          Add takeaway
        </Button>
      </div>
    </div>
  );
}
