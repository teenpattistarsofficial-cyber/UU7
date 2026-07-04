import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ExternalLink } from "lucide-react";
import { auth } from "@/lib/auth";
import { AdminNav } from "./admin-nav";
import { SignOutButton } from "./sign-out-button";
import { ThemeToggleMenuItem } from "@/components/admin/theme-toggle";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authoritative check — proxy.ts already gates on cookie presence, but
  // layouts/server actions must do the real DB-backed lookup per Next.js's
  // guidance not to rely on Proxy alone.
  const result = await auth.api.getSession({ headers: await headers() });
  if (!result?.user) {
    redirect("/admin/login");
  }

  const initial = (result.user.name || result.user.email).charAt(0).toUpperCase();

  return (
    // `h-screen overflow-hidden` locks the app shell to exactly the
    // viewport — without it, a tall page (or long sidebar nav) makes the
    // whole document scroll, dragging the sidebar out of view with it. The
    // sidebar and main content below each get their own `overflow-y-auto`
    // instead, so scrolling one never moves the other and the window/body
    // itself never scrolls.
    <div className="flex h-screen overflow-hidden">
      {/* Fixed-dark rail — intentionally always dark regardless of the
          content area's light/dark toggle, so it's never the same color as
          the page background it sits next to. */}
      <aside className="flex w-64 shrink-0 flex-col overflow-y-auto bg-sidebar p-4 text-sidebar-foreground">
        <div className="mb-5 flex items-center px-1">
          <Image
            src="/UU7.io logo.webp"
            alt="UU7"
            width={40}
            height={40}
            className="drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
          />
        </div>

        <div className="mb-7 flex items-center gap-2.5 px-1">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
            {initial}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{result.user.name || "Admin"}</div>
            <span className="text-[10px] font-medium tracking-wide text-sidebar-primary uppercase">
              {result.user.role as string}
            </span>
          </div>
        </div>

        <AdminNav />

        <div className="mt-auto space-y-1 border-t border-sidebar-border pt-3">
          <Link
            href="/"
            target="_blank"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/65 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
          >
            <ExternalLink className="size-4" />
            View live site
          </Link>
          <ThemeToggleMenuItem />
          <SignOutButton />
        </div>
      </aside>

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="relative z-10 flex items-center justify-between border-b border-border bg-card px-6 py-2.5 text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="size-2 rounded-full bg-emerald-500" />
            System online
          </span>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="size-3.5" />
            Live site
          </Link>
        </div>

        {/* Ambient glow — soft, fixed behind the scrollable content so it
            reads as depth in the page background rather than decoration on
            any one card. */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-[-25%] left-1/3 h-[560px] w-[560px] rounded-full bg-primary/[0.05] blur-[150px]" />
          <div className="absolute top-[10%] right-[-10%] h-[420px] w-[420px] rounded-full bg-accent-foreground/[0.05] blur-[130px]" />
        </div>

        <main className="relative z-10 flex-1 overflow-auto bg-background p-8 text-foreground">{children}</main>
      </div>
    </div>
  );
}
