import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-xl font-semibold">uu7.io admin</h1>
        <p className="mb-6 text-sm text-muted-foreground">Sign in to manage the site.</p>
        <LoginForm next={next ?? "/admin"} />
      </div>
    </div>
  );
}
