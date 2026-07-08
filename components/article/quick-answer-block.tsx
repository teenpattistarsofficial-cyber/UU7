import { Zap } from "lucide-react";

/** AEO Module — a short, direct answer positioned right at the top of the
 * article, ahead of the denser AI Summary Block, targeting Google's
 * featured-snippet format (~40-60 words). `data-quick-answer` stays on the
 * outermost element regardless of the visual wrapper around it — it's a
 * structural hook for AEO extraction, not a styling one. */
export function QuickAnswerBlock({ text }: { text: string }) {
  if (!text) return null;

  return (
    <div data-quick-answer className="mb-6 flex gap-3 rounded-xl border border-brand/20 bg-brand/5 p-4 sm:p-5">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
        <Zap className="size-4" />
      </span>
      <p className="text-base leading-relaxed">{text}</p>
    </div>
  );
}
