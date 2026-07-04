import Image from "next/image";
import { Shield } from "lucide-react";
import { ThemeToggle } from "@/components/admin/theme-toggle";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Ambient glow — soft brand-orange blobs behind the card, plus a
          faint dot-grid for depth. Purely decorative background dressing;
          no gradient fills on any interactive element. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-primary/[0.07] blur-[130px]" />
        <div className="absolute right-[8%] bottom-[-15%] h-[380px] w-[380px] rounded-full bg-accent-foreground/[0.08] blur-[110px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,color-mix(in_oklch,var(--foreground)_7%,transparent)_1px,transparent_0)] [background-size:32px_32px] opacity-40" />
      </div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_24px_64px_-24px_rgba(0,0,0,0.18)] ring-1 ring-accent-foreground/[0.06]">
        <div className="mb-8 text-center">
          <Image
            src="/UU7.io logo.webp"
            alt="UU7"
            width={112}
            height={112}
            priority
            className="mx-auto mb-3 drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)]"
          />
          <p className="text-sm font-medium text-muted-foreground">Admin Dashboard Access</p>
        </div>
        <LoginForm next={next ?? "/admin"} />
        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="size-3.5" /> Authorized personnel only
        </p>
      </div>
    </div>
  );
}
