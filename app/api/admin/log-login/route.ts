import { logActivity } from "@/lib/actions/audit-log";

export const runtime = "nodejs";

// A plain API route rather than calling the logActivity Server Action
// directly from login-form.tsx — a direct action call from a client
// component whose current page is /admin/login interacts badly with
// proxy.ts's own admin-auth redirect chain (the action's implicit
// "POST to the current URL" target got caught in a 307 redirect loop
// through the login page's own post-login redirect logic, silently
// dropping the call before it ever reached logActivity's body). A plain
// fetch to a dedicated route sidesteps that entirely.
export async function POST() {
  await logActivity({ action: "login" });
  return new Response(null, { status: 204 });
}
