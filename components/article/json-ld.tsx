/** Renders one or more JSON-LD blocks combined into a single `@graph`,
 * skipping any that are null (e.g. a post with no FAQs). Server component —
 * no interactivity, just a script tag. */
export function JsonLd({ blocks }: { blocks: (object | null)[] }) {
  const graph = blocks.filter((b): b is object => b !== null);
  if (graph.length === 0) return null;

  return (
    <script
      type="application/ld+json"
      // Safe: every field folded into these blocks comes from admin/editor
      // authored content (titles, FAQ text, etc.), never public user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }) }}
    />
  );
}
