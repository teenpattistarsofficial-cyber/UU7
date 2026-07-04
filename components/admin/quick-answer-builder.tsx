"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { charStatusColor } from "@/lib/seo/char-status";
import { cn } from "@/lib/utils";

const QUICK_ANSWER_MIN_WORDS = 40;
const QUICK_ANSWER_MAX_WORDS = 60;

/** AEO Module — a direct, snippet-targeted answer (Google featured
 * snippets favor ~40-60 word direct answers), distinct from the denser
 * AI Summary Block below it. */
export function QuickAnswerBuilder({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="quickAnswer">Direct answer</Label>
        <span
          className={cn(
            "text-xs font-semibold tabular-nums",
            charStatusColor(wordCount, QUICK_ANSWER_MIN_WORDS, QUICK_ANSWER_MAX_WORDS),
          )}
        >
          {wordCount} words
        </span>
      </div>
      <Textarea
        id="quickAnswer"
        rows={3}
        placeholder="A direct, snippet-targeted answer to the article's main question, in 40-60 words."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
