// Shared between lib/actions/redirects.ts (the admin Server Action) and
// app/api/ops/redirects/route.ts (the bearer-token ops API) — kept out of
// the "use server" file since Next requires every export from one to be an
// async function, which these plain helpers aren't.
export const VALID_STATUS_CODES = new Set([301, 302, 307, 308]);

export function normalizePath(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  // Strip a full origin if one was pasted in — only the path is stored.
  const withoutOrigin = trimmed.replace(/^https?:\/\/[^/]+/, "");
  return withoutOrigin.startsWith("/") ? withoutOrigin : `/${withoutOrigin}`;
}
