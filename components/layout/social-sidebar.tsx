"use client";

import { useState } from "react";

const SOCIAL_LINKS = [
  {
    href: "https://www.facebook.com/starsuu7indiagames/",
    label: "Facebook",
    rest: "bg-zinc-900/90 text-blue-400 border-blue-500/50",
    hover: "hover:bg-blue-500/25 hover:text-blue-300 hover:border-blue-500/80 hover:shadow-[0_0_0_3px_rgba(24,119,242,0.3),0_0_30px_rgba(24,119,242,0.5)]",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    href: "https://x.com/starsuu7game",
    label: "X / Twitter",
    rest: "bg-zinc-900/90 text-zinc-200 border-zinc-500/50",
    hover: "hover:bg-zinc-700/50 hover:text-white hover:border-zinc-300/80 hover:shadow-[0_0_0_3px_rgba(255,255,255,0.15),0_0_30px_rgba(255,255,255,0.2)]",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    href: "https://in.pinterest.com/starsuu7india/",
    label: "Pinterest",
    rest: "bg-zinc-900/90 text-red-500 border-red-600/50",
    hover: "hover:bg-red-600/25 hover:text-red-400 hover:border-red-600/80 hover:shadow-[0_0_0_3px_rgba(230,0,35,0.3),0_0_30px_rgba(230,0,35,0.5)]",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
      </svg>
    ),
  },
  {
    href: "https://t.me/OfficialStarsuu7game",
    label: "Telegram",
    rest: "bg-zinc-900/90 text-sky-400 border-sky-400/50",
    hover: "hover:bg-sky-500/25 hover:text-sky-300 hover:border-sky-400/80 hover:shadow-[0_0_0_3px_rgba(38,165,228,0.3),0_0_30px_rgba(38,165,228,0.5)]",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    href: "https://whatsapp.com/channel/0029Vb6HYJ2KLaHvG4hKr90Z",
    label: "WhatsApp",
    rest: "bg-zinc-900/90 text-green-400 border-green-500/50",
    hover: "hover:bg-green-500/25 hover:text-green-300 hover:border-green-500/80 hover:shadow-[0_0_0_3px_rgba(37,211,102,0.3),0_0_30px_rgba(37,211,102,0.5)]",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
      </svg>
    ),
  },
];

export function SocialSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    // Outer: handles vertical centering; inner: handles horizontal collapse slide
    <div className="fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
      <div
        className={`flex items-center transition-transform duration-300 ${
          collapsed ? "translate-x-[68px]" : "translate-x-0"
        }`}
      >
        {/* Toggle arrow — peeks out from right edge when collapsed */}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Show social links" : "Hide social links"}
          className="flex h-16 w-6 items-center justify-center rounded-l-xl border border-r-0 border-white/10 bg-zinc-900/90 text-white/40 backdrop-blur-md transition-colors hover:text-white/80"
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-3 w-3 transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* Strip */}
        <div className="flex w-[68px] flex-col items-center rounded-l-2xl border border-r-0 border-white/10 bg-zinc-900/90 backdrop-blur-md">
          <span className="pt-3 pb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white/50">
            Socials
          </span>
          <div className="flex flex-col items-center gap-2 pb-4">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className={`group relative flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 hover:scale-[1.2] ${social.rest} ${social.hover}`}
              >
                {social.icon}
                <span className="pointer-events-none absolute right-[calc(100%+10px)] whitespace-nowrap rounded-md bg-zinc-950/90 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white/90 opacity-0 shadow-lg ring-1 ring-white/10 backdrop-blur-md transition-all duration-200 group-hover:opacity-100">
                  {social.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
