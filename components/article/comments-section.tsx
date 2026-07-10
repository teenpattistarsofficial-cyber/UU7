"use client";

import { useState, useTransition } from "react";
import { MessageCircle, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createComment } from "@/lib/actions/comments";
import { formatDate } from "@/lib/utils";

export type CommentData = { id: string; authorName: string; content: string; createdAt: Date };

function initials(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function CommentsSection({ postId, comments }: { postId: string; comments: CommentData[] }) {
  return (
    <section className="my-10">
      <h2 className="mb-5 flex items-center gap-2 font-heading text-xl font-bold">
        <MessageCircle className="size-5 text-brand" />
        Comments {comments.length > 0 && <span className="text-muted-foreground">({comments.length})</span>}
      </h2>

      {comments.length > 0 && (
        <ul className="mb-8 space-y-5">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
                {initials(c.authorName)}
              </span>
              <div className="min-w-0 flex-1 rounded-xl border border-border bg-card p-3.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <span className="text-sm font-semibold">{c.authorName}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(c.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm whitespace-pre-line text-foreground/90">{c.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <CommentForm postId={postId} />
    </section>
  );
}

function CommentForm({ postId }: { postId: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createComment(postId, fd);
      if (result.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setContent("");
      } else {
        setStatus("error");
        setErrorMessage(result.error);
      }
    });
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-brand/25 bg-brand/5 p-4 text-sm text-foreground">
        Thanks — your comment has been submitted and will appear once it&apos;s reviewed.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold">Leave a comment</h3>
      {/* Honeypot — hidden from real visitors, left unstyled-invisible (not
          display:none, which some bots skip filling) so it still gets
          auto-filled by simple scripts. Any value here silently no-ops the
          submission server-side. */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input name="authorName" placeholder="Name" required value={name} onChange={(e) => setName(e.target.value)} />
        <Input name="authorEmail" type="email" placeholder="Email (not published)" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <Textarea
        name="content"
        placeholder="Share your thoughts…"
        rows={4}
        required
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      {status === "error" && <p className="text-sm text-destructive">{errorMessage}</p>}
      <Button type="submit" variant="brand" className="gap-1.5 rounded-full px-5" disabled={pending}>
        <Send className="size-4" />
        {pending ? "Submitting…" : "Post comment"}
      </Button>
    </form>
  );
}
