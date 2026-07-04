import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Settings</h1>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-border pb-3">
            <span className="text-muted-foreground">Name</span>
            <span>{session?.user?.name}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-3">
            <span className="text-muted-foreground">Email</span>
            <span>{session?.user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Role</span>
            <span className="uppercase">{session?.user?.role as string}</span>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 max-w-lg text-sm text-muted-foreground">
        Site-wide SEO defaults, redirects, and technical SEO settings (Modules 4-6) land here once
        those admin modules are built.
      </p>
    </div>
  );
}
