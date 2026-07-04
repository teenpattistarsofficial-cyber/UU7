"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "admin-theme-mode";

function useAdminDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.getElementById("admin-root")?.classList.contains("dark") ?? false);
  }, []);

  function toggle() {
    const root = document.getElementById("admin-root");
    if (!root) return;
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    setIsDark(next);
  }

  return { isDark, toggle };
}

export function ThemeToggle({ className }: { className?: string }) {
  const { isDark, toggle } = useAdminDarkMode();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className={cn(className)}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}

/** Full-width sidebar-menu-row variant, for the footer menu list. */
export function ThemeToggleMenuItem({ className }: { className?: string }) {
  const { isDark, toggle } = useAdminDarkMode();

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/65 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
        className,
      )}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      {isDark ? "Light mode" : "Dark mode"}
    </button>
  );
}
