import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Bare `.toLocaleDateString()` picks up the runtime's default locale, which
// differs between the server (Node's default) and the browser — causing a
// hydration mismatch (e.g. "7/10/2026" vs "10/07/2026" for the same date).
// Pinning locale + timeZone makes server and client render identical text.
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { timeZone: "UTC", year: "numeric", month: "short", day: "numeric" })
}
