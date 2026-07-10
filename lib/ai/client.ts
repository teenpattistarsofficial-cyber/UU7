import "server-only";
import OpenAI from "openai";
import { getSiteSettings } from "@/lib/settings";

export const ASK_AI_MODEL = "gpt-4o-mini";

// DB value (Settings → System Controls) takes priority over the env var —
// lets a key be set/rotated from the admin without a redeploy, while still
// working for anyone who only ever set OPENAI_API_KEY the old way.
async function resolveApiKey(): Promise<string | undefined> {
  const settings = await getSiteSettings();
  return settings?.openaiApiKey || process.env.OPENAI_API_KEY;
}

export async function isAskAiConfigured(): Promise<boolean> {
  return Boolean(await resolveApiKey());
}

export async function getOpenAiClient(): Promise<OpenAI> {
  return new OpenAI({ apiKey: await resolveApiKey() });
}
