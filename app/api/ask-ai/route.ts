import type { NextRequest } from "next/server";
import { loadAllChunks } from "@/lib/ai/context";
import { retrieveChunks } from "@/lib/ai/retrieve";
import { ASK_AI_SYSTEM_PROMPT, buildUserMessage } from "@/lib/ai/prompt";
import { ASK_AI_MODEL, getAnthropicClient, isAskAiConfigured } from "@/lib/ai/client";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { ASK_AI_SOURCES_SENTINEL } from "@/lib/ai/stream-protocol";

export const runtime = "nodejs";

const MAX_QUESTION_LENGTH = 500;

export async function POST(request: NextRequest) {
  if (!isAskAiConfigured()) {
    return Response.json(
      { error: "not_configured", message: "Ask-AI isn't set up yet — it needs an ANTHROPIC_API_KEY." },
      { status: 503 },
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return Response.json(
      { error: "rate_limited", message: "Too many questions in a short window — try again in a minute." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  if (!question || question.length > MAX_QUESTION_LENGTH) {
    return Response.json(
      { error: "invalid_question", message: `Ask a specific question (1-${MAX_QUESTION_LENGTH} characters).` },
      { status: 400 },
    );
  }

  const chunks = await loadAllChunks();
  const relevant = retrieveChunks(question, chunks, 6);
  const sources = [...new Map(relevant.map((c) => [c.url, { title: c.title, url: c.url }])).values()];

  const client = getAnthropicClient();
  const messageStream = client.messages.stream({
    model: ASK_AI_MODEL,
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    system: [{ type: "text", text: ASK_AI_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: buildUserMessage(question, relevant) }],
  });

  const encoder = new TextEncoder();
  const responseBody = new ReadableStream({
    async start(controller) {
      messageStream.on("text", (delta: string) => controller.enqueue(encoder.encode(delta)));
      try {
        await messageStream.finalMessage();
        controller.enqueue(encoder.encode(`${ASK_AI_SOURCES_SENTINEL}${JSON.stringify(sources)}`));
      } catch {
        controller.enqueue(encoder.encode("\n\nSomething went wrong generating an answer — try again shortly."));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(responseBody, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
