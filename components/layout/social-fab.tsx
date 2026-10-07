"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const CHANNELS = [
  {
    href: "https://www.facebook.com/starsuu7indiagames/",
    label: "Facebook",
    sub: "Follow Page",
    bg: "#1877F2",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white" aria-hidden>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    href: "https://x.com/starsuu7game",
    label: "X (Twitter)",
    sub: "Follow us",
    bg: "#111111",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    href: "https://in.pinterest.com/starsuu7india/",
    label: "Pinterest",
    sub: "Follow us",
    bg: "#E60023",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white" aria-hidden>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
      </svg>
    ),
  },
  {
    href: "https://t.me/OfficialStarsuu7game",
    label: "Telegram",
    sub: "Join Channel",
    bg: "#26A5E4",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white" aria-hidden>
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    href: "https://whatsapp.com/channel/0029Vb6HYJ2KLaHvG4hKr90Z",
    label: "WhatsApp",
    sub: "Join Channel",
    bg: "#25D366",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
      </svg>
    ),
  },
];

export function SocialFab({ logoUrl }: { logoUrl: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    document.documentElement.classList.toggle("overflow-hidden", open);
    return () => document.documentElement.classList.remove("overflow-hidden");
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`pointer-events-none fixed inset-0 z-[78] bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0"
        }`}
      />

      {/* FAB trigger */}
      <div
        className="fixed bottom-24 right-3 z-[80] transition-opacity duration-200 lg:hidden"
        style={{ opacity: open ? 0 : 1, pointerEvents: open ? "none" : "auto" }}
      >
        <button
          type="button"
          aria-label="Connect with us"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="relative flex h-12 w-12 items-center justify-center rounded-full border border-amber-400/30 bg-gradient-to-br from-[#0c141c] to-[#04070a] text-amber-400 shadow-2xl shadow-black/80 backdrop-blur-xl"
          style={{ boxShadow: "rgba(245,194,66,0.25) 0px 0px 20px, rgba(0,0,0,0.8) 0px 8px 25px" }}
        >
          <span className="absolute -inset-1 -z-10 animate-pulse rounded-full bg-amber-400/10" aria-hidden="true" />
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          <span className="absolute -right-1 -top-1 flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
        </button>
      </div>

      {/* Bottom-sheet panel */}
      <div
        role="dialog"
        aria-label="Connect with us"
        aria-modal="true"
        aria-hidden={!open}
        {...(!open ? { inert: true } : {})}
        className={`fixed inset-x-0 bottom-0 z-[79] transition-transform duration-300 ease-out lg:hidden ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div
          className="rounded-t-3xl bg-[#0d111c] px-5 pt-5 max-h-[85vh] overflow-y-auto"
          style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        >
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src={logoUrl} alt="UU7" width={40} height={40} unoptimized className="h-10 w-10 rounded-xl" />
              <div>
                <p className="text-sm font-bold leading-tight text-white">UU7</p>
                <p className="text-[10px] leading-tight text-white/40">Official Channels</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-white/50 transition-colors hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Subheading */}
          <div className="mb-4 flex items-center justify-between border-b border-white/[0.06] pb-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400">Connect with us</p>
            <span className="text-[10px] text-white/30">Official Channels</span>
          </div>

          {/* 2-col social grid */}
          <div className="grid grid-cols-2 gap-3">
            {CHANNELS.map((ch) => (
              <a
                key={ch.href}
                href={ch.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3.5 transition-all active:scale-[0.97]"
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: ch.bg }}
                >
                  {ch.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-tight text-white">{ch.label}</p>
                  <p className="text-[11px] leading-tight text-white/50">{ch.sub}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
