import { Send, MessageCircle, Mail, Phone, Globe, type LucideIcon } from "lucide-react";

export type ContactChannelKind = "telegram" | "whatsapp" | "email" | "phone" | "website";

// No official Telegram/WhatsApp glyphs — lucide-react ships no brand icons
// (see the same note in components/article/author-box.tsx) — so each kind
// gets a generic, conventionally-associated icon instead.
export const CONTACT_CHANNEL_ICONS: Record<ContactChannelKind, LucideIcon> = {
  telegram: Send,
  whatsapp: MessageCircle,
  email: Mail,
  phone: Phone,
  website: Globe,
};

export const CONTACT_CHANNEL_KIND_OPTIONS: { value: ContactChannelKind; label: string }[] = [
  { value: "telegram", label: "Telegram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "website", label: "Website / other" },
];

// `value` means something different per kind (see the column comment in
// lib/db/schema/settings.ts) — this is the one place that turns it into an
// actual clickable href, so every consumer (Contact page, Ask-AI widget)
// stays consistent without duplicating the mailto:/tel: logic.
export function getContactChannelHref(kind: ContactChannelKind, value: string): string {
  if (kind === "email") return `mailto:${value}`;
  if (kind === "phone") return `tel:${value}`;
  return value;
}
