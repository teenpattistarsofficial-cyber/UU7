// Shared between app/api/ask-ai/route.ts (server) and the chat widget
// (client) so the split marker can't drift between the two.
export const ASK_AI_SOURCES_SENTINEL = "\n\n<<<ASK_AI_SOURCES>>>";

// Emitted by the MODEL itself (per lib/ai/prompt.ts's instructions), not the
// server, as the literal last thing in its answer — only when it's declining
// a genuine content question the context doesn't cover. Deliberately NOT
// derived from "did retrieval find zero sources", because that's also true
// for perfectly normal small talk ("how are you?") that has nothing to do
// with site content — a retrieval-based signal can't tell those apart, only
// the model actually understands the visitor's intent. Stripped from the
// displayed text client-side the same way ASK_AI_SOURCES_SENTINEL already
// is (see components/ask-ai/chat-widget.tsx).
export const ASK_AI_ESCALATE_MARKER = "[[NEEDS_HUMAN]]";

export type AskAiSource = { title: string; url: string };
