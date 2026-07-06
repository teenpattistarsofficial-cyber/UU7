"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ASK_AI_SOURCES_SENTINEL, type AskAiSource } from "@/lib/ai/stream-protocol";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  sources?: AskAiSource[];
  pending?: boolean;
};

function replaceLastAssistant(prev: ChatMessage[], next: ChatMessage): ChatMessage[] {
  const copy = [...prev];
  copy[copy.length - 1] = next;
  return copy;
}

/**
 * GEO/AEO Module 6 — a RAG chat widget over this site's own published
 * content (see lib/ai/{chunk,retrieve,prompt,context}.ts). Degrades
 * gracefully when ANTHROPIC_API_KEY isn't set: the API returns a plain
 * "not configured" error and the widget just surfaces that message rather
 * than breaking.
 */
export function AskAiWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || sending) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }, { role: "assistant", text: "", pending: true }]);
    setQuestion("");
    setSending(true);

    try {
      const res = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        setMessages((prev) =>
          replaceLastAssistant(prev, { role: "assistant", text: data?.message ?? "Something went wrong." }),
        );
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        const [visibleText] = full.split(ASK_AI_SOURCES_SENTINEL);
        setMessages((prev) => replaceLastAssistant(prev, { role: "assistant", text: visibleText, pending: true }));
      }

      const [answerText, sourcesJson] = full.split(ASK_AI_SOURCES_SENTINEL);
      let sources: AskAiSource[] = [];
      if (sourcesJson) {
        try {
          sources = JSON.parse(sourcesJson);
        } catch {
          sources = [];
        }
      }
      setMessages((prev) => replaceLastAssistant(prev, { role: "assistant", text: answerText.trim(), sources }));
    } catch {
      setMessages((prev) =>
        replaceLastAssistant(prev, { role: "assistant", text: "Something went wrong reaching Ask-AI." }),
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="flex h-[28rem] w-80 flex-col overflow-hidden rounded-lg border border-border bg-background shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-sm font-semibold">Ask-AI</span>
            <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)} aria-label="Close Ask-AI">
              <X className="size-4" />
            </Button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3 text-sm">
            {messages.length === 0 && (
              <p className="text-muted-foreground">Ask a question about content on this site.</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <div
                  className={
                    m.role === "user"
                      ? "inline-block rounded-lg bg-primary px-3 py-1.5 text-primary-foreground"
                      : "inline-block rounded-lg bg-muted px-3 py-1.5 text-foreground"
                  }
                >
                  {m.text || (m.pending ? "…" : "")}
                </div>
                {m.sources && m.sources.length > 0 && (
                  <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                    {m.sources.map((s) => (
                      <li key={s.url}>
                        <a href={s.url} className="underline hover:text-foreground">
                          {s.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border p-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question…"
              disabled={sending}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={sending || !question.trim()} aria-label="Send">
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      ) : (
        <Button size="icon-lg" className="rounded-full shadow-lg" onClick={() => setOpen(true)} aria-label="Open Ask-AI">
          <MessageCircle className="size-5" />
        </Button>
      )}
    </div>
  );
}
