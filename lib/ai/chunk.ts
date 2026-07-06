import type { JSONContent } from "@tiptap/core";
import { extractText } from "@/lib/editor/text";

export type AiChunk = {
  postId: string;
  title: string;
  url: string;
  section: string;
  text: string;
};

const MAX_CHUNK_WORDS = 180;

/**
 * Splits one post into retrieval-sized chunks for the Ask-AI RAG pipeline.
 * The body is split by heading boundaries (falling back to word-count runs
 * for a single long section) so a retrieved chunk points at a specific part
 * of the article rather than the whole thing.
 */
export function chunkPost(post: {
  id: string;
  title: string;
  url: string;
  quickAnswer?: string | null;
  aiSummary?: string | null;
  keyTakeaways?: string[];
  faqs?: { question: string; answer: string }[];
  content: JSONContent;
}): AiChunk[] {
  const chunks: AiChunk[] = [];
  const push = (section: string, text: string) => {
    const trimmed = text.trim();
    if (trimmed) chunks.push({ postId: post.id, title: post.title, url: post.url, section, text: trimmed });
  };

  push("Quick Answer", post.quickAnswer ?? "");
  if (post.aiSummary || post.keyTakeaways?.length) {
    push("Summary", [post.aiSummary, ...(post.keyTakeaways ?? []).map((t) => `- ${t}`)].filter(Boolean).join("\n"));
  }
  for (const faq of post.faqs ?? []) {
    push(`FAQ: ${faq.question}`, faq.answer);
  }

  let sectionTitle = post.title;
  let buffer: string[] = [];
  const flushBody = () => {
    const text = buffer.join(" ").trim();
    buffer = [];
    if (!text) return;
    const words = text.split(/\s+/);
    for (let i = 0; i < words.length; i += MAX_CHUNK_WORDS) {
      push(sectionTitle, words.slice(i, i + MAX_CHUNK_WORDS).join(" "));
    }
  };

  for (const node of post.content.content ?? []) {
    if (node.type === "heading") {
      flushBody();
      sectionTitle = extractText(node) || sectionTitle;
      continue;
    }
    const text = extractText(node);
    if (text) buffer.push(text);
  }
  flushBody();

  return chunks;
}
