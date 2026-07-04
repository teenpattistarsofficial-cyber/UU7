/** AEO Module — a short, direct answer positioned right at the top of the
 * article, ahead of the denser AI Summary Block, targeting Google's
 * featured-snippet format (~40-60 words). */
export function QuickAnswerBlock({ text }: { text: string }) {
  if (!text) return null;

  return (
    <p data-quick-answer className="mb-6 rounded-lg border-l-4 border-primary/40 bg-muted/40 py-2 pl-4 text-base leading-relaxed">
      {text}
    </p>
  );
}
