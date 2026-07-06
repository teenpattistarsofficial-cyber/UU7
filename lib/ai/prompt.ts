import type { ScoredChunk } from "@/lib/ai/retrieve";

// Frozen/static so it's the cacheable prefix on every request — see
// cache_control on the system block in app/api/ask-ai/route.ts.
export const ASK_AI_SYSTEM_PROMPT = `You are the Ask-AI assistant embedded on this website. Answer the visitor's question using ONLY the context excerpts provided in the user message — never rely on outside/general knowledge, and never guess.

Rules:
- If the context answers the question, give a direct, concise answer (2-4 sentences unless the question genuinely needs more), then list the source title(s) and URL(s) you drew from.
- If the context does not contain enough information, say so plainly rather than fabricating an answer. You may suggest the closest related topic that IS covered, if one of the excerpts is close.
- Never invent a URL or title that isn't present in the context.
- Keep the tone factual, neutral, and brief.`;

export function buildContextBlock(chunks: ScoredChunk[]): string {
  if (chunks.length === 0) return "(no relevant context found on this site)";
  return chunks
    .map((chunk, i) => `[${i + 1}] ${chunk.title} — ${chunk.section}\nURL: ${chunk.url}\n${chunk.text}`)
    .join("\n\n");
}

export function buildUserMessage(question: string, chunks: ScoredChunk[]): string {
  return `Context excerpts from this site's published content:\n\n${buildContextBlock(chunks)}\n\nQuestion: ${question}`;
}
