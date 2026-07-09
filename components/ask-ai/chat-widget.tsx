"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ASK_AI_SOURCES_SENTINEL, type AskAiSource } from "@/lib/ai/stream-protocol";
import { TELEGRAM_CONTACT_URL } from "@/lib/site";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  sources?: AskAiSource[];
  pending?: boolean;
  // Set when the AI genuinely couldn't help — not configured, an
  // unexpected error, or (once the stream completes) no relevant content
  // was found for the question — as opposed to a recoverable/actionable
  // case like rate-limiting or an invalid question, where a human wouldn't
  // add anything a retry can't fix.
  escalate?: boolean;
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
        // Rate-limiting and an invalid question are both on the visitor to
        // fix (wait, or ask something else) — a human can't do anything a
        // retry can't. Anything else (not configured, an unrecognized
        // error) means the AI itself is the problem, so offer the escape
        // hatch.
        const userFixable = data?.error === "rate_limited" || data?.error === "invalid_question";
        setMessages((prev) =>
          replaceLastAssistant(prev, {
            role: "assistant",
            text: data?.message ?? "Something went wrong.",
            escalate: !userFixable,
          }),
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
      setMessages((prev) =>
        replaceLastAssistant(prev, {
          role: "assistant",
          text: answerText.trim(),
          sources,
          // No matching source means the retriever found nothing relevant
          // on the site for this question — the model was told to say so
          // plainly rather than fabricate (see ASK_AI_SYSTEM_PROMPT), which
          // this catches structurally instead of pattern-matching its
          // wording.
          escalate: sources.length === 0,
        }),
      );
    } catch {
      setMessages((prev) =>
        replaceLastAssistant(prev, {
          role: "assistant",
          text: "Something went wrong reaching Ask-AI.",
          escalate: true,
        }),
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={open ? "fixed inset-0 z-50 sm:inset-auto sm:bottom-4 sm:right-4" : "fixed bottom-4 right-4 z-50"}>
      {open ? (
        <div
          // Full-screen below `sm` (`inset-0`/`h-dvh`/`w-full`, no rounding)
          // rather than a floating card anchored by a fixed height — a
          // `vh`-based height doesn't track the on-screen keyboard on
          // mobile, so once the keyboard opened the panel's layout went
          // stale: the input could end up below the keyboard's edge,
          // forcing a pinch-zoom-and-scroll just to see what was typed.
          // `dvh` (dynamic viewport height) does track the keyboard, and a
          // true full-screen flex column keeps the input pinned to the
          // bottom of whatever space is actually left, same fix already
          // used for the mobile nav menu (components/layout/header.tsx).
          // `sm` and up go back to the original floating card — no
          // on-screen keyboard obstruction concern on a real keyboard/tablet.
          className="flex h-dvh w-full flex-col overflow-hidden bg-background sm:h-[36rem] sm:max-h-[85vh] sm:w-[28rem] sm:rounded-xl sm:border sm:border-border sm:shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-base font-semibold">Ask-AI</span>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close Ask-AI">
              <X className="size-5" />
            </Button>
          </div>

          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4 text-base">
            {messages.length === 0 && (
              <p className="text-muted-foreground">Ask a question about content on this site.</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <div
                  className={
                    m.role === "user"
                      ? "inline-block rounded-lg bg-primary px-4 py-2 text-primary-foreground"
                      : "inline-block rounded-lg bg-muted px-4 py-2 text-foreground"
                  }
                >
                  {m.text || (m.pending ? "…" : "")}
                </div>
                {m.sources && m.sources.length > 0 && (
                  <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground">
                    {m.sources.map((s) => (
                      <li key={s.url}>
                        <a href={s.url} className="underline hover:text-foreground">
                          {s.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                {!m.pending && m.escalate && (
                  <a
                    href={TELEGRAM_CONTACT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
                  >
                    <Send className="size-3.5" />
                    Talk to a human on Telegram
                  </a>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border p-3">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question…"
              disabled={sending}
              className="h-11 flex-1 text-base"
            />
            <Button type="submit" size="icon-lg" disabled={sending || !question.trim()} aria-label="Send">
              <Send className="size-5" />
            </Button>
          </form>
        </div>
      ) : (
        <Button
          size="icon-lg"
          className="size-16 rounded-full shadow-lg"
          onClick={() => setOpen(true)}
          aria-label="Open Ask-AI"
        >
          <MessageCircle className="size-7" />
        </Button>
      )}
    </div>
  );
}
