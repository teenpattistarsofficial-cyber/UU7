"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  StickyNote,
  FolderTree,
  Users,
  Image as ImageIcon,
  HelpCircle,
  ArrowRightLeft,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const OVERVIEW_ITEMS = [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }];

const CONTENT_ITEMS = [
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/pages", label: "Pages", icon: StickyNote },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/authors", label: "Authors", icon: Users },
  { href: "/admin/media", label: "Media Library", icon: ImageIcon },
];

const REPORTS_ITEMS = [{ href: "/admin/analytics", label: "Analytics", icon: BarChart3 }];

const TOOLS_ITEMS = [{ href: "/admin/redirects", label: "Redirects", icon: ArrowRightLeft }];

// Not built yet — FAQ Builder is Phase 4 per the implementation plan. Shown
// greyed-out/non-clickable so the sidebar previews the roadmap honestly
// instead of linking somewhere that 404s.
const UPCOMING_ITEMS = [{ label: "FAQ Manager", icon: HelpCircle }];

function NavSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 mb-1.5 px-3 text-[10px] font-semibold tracking-wider text-sidebar-foreground/40 uppercase first:mt-0">
      {children}
    </div>
  );
}

export function AdminNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  }

  return (
    <nav className="flex flex-1 flex-col">
      <NavSectionLabel>Overview</NavSectionLabel>
      {OVERVIEW_ITEMS.map((item) => (
        <NavLink key={item.href} {...item} active={isActive(item.href)} />
      ))}

      <NavSectionLabel>Content</NavSectionLabel>
      {CONTENT_ITEMS.map((item) => (
        <NavLink key={item.href} {...item} active={isActive(item.href)} />
      ))}
      {UPCOMING_ITEMS.map((item) => (
        <div
          key={item.label}
          className="flex cursor-not-allowed items-center justify-between gap-2.5 rounded-lg border-l-2 border-transparent px-3 py-2 text-sm text-sidebar-foreground/30"
        >
          <span className="flex items-center gap-2.5">
            <item.icon className="size-4" />
            {item.label}
          </span>
          <span className="rounded bg-sidebar-accent/40 px-1.5 py-0.5 text-[9px] font-medium tracking-wide uppercase">
            Soon
          </span>
        </div>
      ))}

      <NavSectionLabel>Reports</NavSectionLabel>
      {REPORTS_ITEMS.map((item) => (
        <NavLink key={item.href} {...item} active={isActive(item.href)} />
      ))}

      <NavSectionLabel>Tools</NavSectionLabel>
      {TOOLS_ITEMS.map((item) => (
        <NavLink key={item.href} {...item} active={isActive(item.href)} />
      ))}
    </nav>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg border-l-2 px-3 py-2 text-sm transition-colors",
        active
          ? "border-sidebar-primary bg-sidebar-accent text-sidebar-accent-foreground"
          : "border-transparent text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
      )}
    >
      <Icon className={cn("size-4", active && "text-sidebar-accent-foreground")} />
      {label}
    </Link>
  );
}
