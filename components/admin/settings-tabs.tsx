"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Palette, Search, MessageSquare, SlidersHorizontal, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/settings", label: "Account", icon: User, exact: true },
  { href: "/admin/settings/branding", label: "Branding", icon: Palette },
  { href: "/admin/settings/seo", label: "Global SEO", icon: Search },
  { href: "/admin/settings/contact-channels", label: "Contact Channels", icon: MessageSquare },
  { href: "/admin/settings/scripts", label: "Custom Scripts", icon: Code2 },
  { href: "/admin/settings/system", label: "System Controls", icon: SlidersHorizontal },
];

export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-1.5 border-b border-border pb-3">
      {TABS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "group relative flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-base font-semibold whitespace-nowrap transition-colors",
              active ? "bg-brand/10 text-brand" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className={cn("size-5", active ? "text-brand" : "text-muted-foreground/70 group-hover:text-foreground")} />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
