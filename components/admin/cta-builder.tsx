"use client";

import { Plus, Trash2, ChevronUp, ChevronDown, Lightbulb, TriangleAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export type CtaItem = { heading: string; description: string; buttonText: string; buttonUrl: string };

const EMPTY_CTA: CtaItem = { heading: "", description: "", buttonText: "", buttonUrl: "" };

/** Ordered call-to-action blocks — e.g. "Claim Bonus" linking out to the
 * commercial site. Same repeatable-list pattern as FaqBuilder.
 *
 * These render as plain dofollow links (see components/article/cta-block.tsx)
 * — a deliberate choice, since passing authority to the main site is this
 * whole site's purpose. That only stays a safe pattern if it doesn't turn
 * into every post carrying several near-identical, boilerplate commercial
 * links; the tip and warning below are the (advisory, not enforced) editorial
 * guardrails for that. Nothing here blocks saving/publishing — same
 * philosophy as the rest of the SEO checklist (lib/seo/score.ts), which is
 * advisory except for the one thing (a second H1) that's unambiguously
 * always wrong. Multiple CTAs isn't that — a long pillar guide covering two
 * distinct games might genuinely warrant two — so this nudges instead of
 * blocking. */
export function CtaBuilder({ value, onChange }: { value: CtaItem[]; onChange: (items: CtaItem[]) => void }) {
  function update(index: number, patch: Partial<CtaItem>) {
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
    onChange([...value, { ...EMPTY_CTA }]);
  }

  return (
    <div className="space-y-3">
      <p className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
        <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
        Link to the most relevant page for this post rather than the bare homepage, and vary the heading/button text
        between posts — the same exact link and wording repeated across every article reads as templated to search
        engines, even when a single relevant link is completely normal.
      </p>

      {value.length > 1 && (
        <p className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-500">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
          This post has {value.length} CTAs. Multiple commercial links on one post can look spammy to search
          engines — consider keeping it to one unless this specific post genuinely needs more.
        </p>
      )}

      {value.map((item, i) => (
        <div key={i} className="space-y-2 rounded-lg border border-border p-3">
          <div className="flex items-center gap-1.5">
            <div className="flex flex-col">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-muted-foreground disabled:opacity-30">
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
            <Input placeholder="Heading" value={item.heading} onChange={(e) => update(i, { heading: e.target.value })} className="flex-1" />
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
            placeholder="Description (optional)"
            rows={2}
            value={item.description}
            onChange={(e) => update(i, { description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase">Button text</Label>
              <Input placeholder="Claim Bonus" value={item.buttonText} onChange={(e) => update(i, { buttonText: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase">Button URL</Label>
              <Input placeholder="https://…" value={item.buttonUrl} onChange={(e) => update(i, { buttonUrl: e.target.value })} />
            </div>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={add} className="gap-1.5">
        <Plus className="size-4" />
        Add CTA
      </Button>

      {value.length === 0 && <p className="text-xs text-muted-foreground">No calls-to-action yet.</p>}
    </div>
  );
}
