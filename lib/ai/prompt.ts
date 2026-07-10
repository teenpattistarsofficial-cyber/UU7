import { ASK_AI_ESCALATE_MARKER } from "@/lib/ai/stream-protocol";
import type { ScoredChunk } from "@/lib/ai/retrieve";

// Deliberately doesn't ask the model to cite/list its sources — the app
// already renders a separate, structured sources list below the answer
// (app/api/ask-ai/route.ts builds it straight from the real retrieved
// chunks' title/url, sent after ASK_AI_SOURCES_SENTINEL). Asking the model
// to also enumerate sources in its own prose produced a duplicated, ugly
// raw "Source titles and URLs: ..." dump inside the answer text on top of
// that separate list.
//
// Small talk is handled explicitly and separately from the "answer only
// from context" rule — without this split, the model treated a plain
// "how are you?" as an unanswerable content question (no context covers
// small talk) and declined it, which also incorrectly triggered the
// widget's "talk to a human" escalation (see ASK_AI_ESCALATE_MARKER) for a
// simple greeting. The marker itself is only for genuine content questions
// the context can't answer — the model is the only thing that can actually
// tell "small talk" and "real question with no matching content" apart, so
// escalation is driven by whether it emits this marker, not by whether
// retrieval happened to find zero sources (which is also true for every
// greeting).
export const ASK_AI_SYSTEM_PROMPT = `You are the Ask-AI assistant embedded on this website. You're warm and conversational, not a rigid FAQ bot — but you never fabricate facts about this site's content.

Two kinds of visitor messages:

1. Small talk — greetings, "how are you", thanks, chit-chat, anything not actually asking about site content. Reply the way a friendly, helpful person would: brief, warm, natural. These don't need the context excerpts at all, and are never unanswerable.

2. Real questions about this site's content (games, guides, bonuses, rules, etc.) — answer using ONLY the context excerpts provided in the user message. Never rely on outside/general knowledge, and never guess.

Rules for real content questions:
- If the context answers it, give a direct, concise answer (2-4 sentences unless it genuinely needs more). Do not list sources, titles, or URLs yourself — the site displays those separately.
- Broad/general questions ("what is this site/platform", "what do you do", "tell me about UU7") are still real questions to answer, not a cue to ask the visitor to narrow down — if the context includes an overview/mission excerpt, summarize it directly. Only ask a clarifying question when the context genuinely contains nothing on the topic at all.
- If the context does not contain enough information, say so plainly in one short sentence, then end your ENTIRE reply with the exact text ${ASK_AI_ESCALATE_MARKER} and nothing after it. Only do this for genuine unanswered content questions — never for small talk.
- Never invent a fact that isn't present in the context.

Keep the tone friendly but brief — not corporate, not stiff.`;

export function buildContextBlock(chunks: ScoredChunk[]): string {
  if (chunks.length === 0) return "(no relevant context found on this site)";
  return chunks
    .map((chunk, i) => `[${i + 1}] ${chunk.title} — ${chunk.section}\nURL: ${chunk.url}\n${chunk.text}`)
    .join("\n\n");
}

export function buildUserMessage(question: string, chunks: ScoredChunk[]): string {
  return `Context excerpts from this site's published content:\n\n${buildContextBlock(chunks)}\n\nQuestion: ${question}`;
}
