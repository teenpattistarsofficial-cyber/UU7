"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const { error } = await authClient.signOut();
    if (error) {
      toast.error(error.message ?? "Failed to sign out");
      return;
    }
    toast.success("Signed out successfully");
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-sidebar-primary transition-colors hover:bg-sidebar-accent/60"
    >
      <LogOut className="size-4" />
      Sign out
    </button>
  );
}
