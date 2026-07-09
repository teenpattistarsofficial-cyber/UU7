import { Send } from "lucide-react";
import { TELEGRAM_CONTACT_URL } from "@/lib/site";

// No official Telegram glyph here on purpose — lucide-react ships no brand
// icons (see the same note in components/article/author-box.tsx), so this
// uses a generic, conventionally-associated icon instead. Styled to match
// the homepage's SiteCta card (components/home/site-cta.tsx) — same
// brand-tinted gradient border and pill button — so this reads as the
// site's standard "commercial/contact moment" card, not a one-off.
export function ContactChannels() {
  return (
    <div className="mt-10 overflow-hidden rounded-2xl border border-brand/25 bg-gradient-to-br from-brand/10 via-brand/[0.04] to-transparent p-8 text-center sm:p-10">
      <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-brand/15 text-brand">
        <Send className="size-5" />
      </span>
      <h2 className="font-heading text-lg font-bold sm:text-xl">Chat with us on Telegram</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        Questions about a guide, a correction to flag, or feedback — message{" "}
        <span className="font-medium text-foreground">@nehakapoorbot</span> for the fastest response.
      </p>
      <a
        href={TELEGRAM_CONTACT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-brand-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_20px_-8px_rgba(0,0,0,0.3)] transition-transform hover:-translate-y-0.5 hover:bg-brand/90"
      >
        <Send className="size-4" />
        Message on Telegram
      </a>
    </div>
  );
}
