import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// Per the claude-api skill's model defaults: always claude-opus-4-8 unless
// explicitly told otherwise — not chosen for this feature specifically.
export const ASK_AI_MODEL = "claude-opus-4-8";

export function isAskAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function getAnthropicClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}
