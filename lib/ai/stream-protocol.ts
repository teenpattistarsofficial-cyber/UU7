// Shared between app/api/ask-ai/route.ts (server) and the chat widget
// (client) so the split marker can't drift between the two.
export const ASK_AI_SOURCES_SENTINEL = "\n\n<<<ASK_AI_SOURCES>>>";

export type AskAiSource = { title: string; url: string };
