import type { Metadata } from "next";

export const metadata: Metadata = { title: "Editorial Policy" };

export default function EditorialPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-4 text-3xl font-semibold">Editorial Policy</h1>
      <p className="text-muted-foreground">
        Our research process, review workflow, and source validation standards will be published
        here.
      </p>
    </div>
  );
}
