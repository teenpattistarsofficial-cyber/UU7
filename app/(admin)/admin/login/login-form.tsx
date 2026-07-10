"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";

const fieldLabelClassName = "text-xs font-semibold tracking-wide text-muted-foreground uppercase";
const fieldInputClassName = "h-11 rounded-xl border-input bg-muted px-3.5 text-sm";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const { error: signInError } = await authClient.signIn.email({ email, password });

    setLoading(false);
    if (signInError) {
      toast.error(signInError.message ?? "Invalid email or password");
      return;
    }
    toast.success("Signed in successfully");
    // A plain fetch, not a direct Server Action call — calling logActivity()
    // directly from here raced against router.push()/refresh() right below
    // and got tangled in proxy.ts's own admin-auth redirect chain (the
    // action's implicit "POST to the current URL" target hit the
    // /admin/login redirect-if-already-signed-in branch), silently dropping
    // the call before it ever reached the server function body. Fire-and
    // forget is fine here — a missed login-audit entry isn't worth blocking
    // the redirect over.
    fetch("/api/admin/log-login", { method: "POST" }).catch(() => {});
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className={fieldLabelClassName}>
          Email address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="admin@uu7.io"
          className={fieldInputClassName}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className={fieldLabelClassName}>
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className={`${fieldInputClassName} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
      <Button
        type="submit"
        className="h-11 w-full gap-1.5 rounded-xl text-sm font-semibold"
        disabled={loading}
      >
        {loading ? "Signing in…" : "Sign In"}
        {!loading && <ArrowRight className="size-4" />}
      </Button>
    </form>
  );
}
