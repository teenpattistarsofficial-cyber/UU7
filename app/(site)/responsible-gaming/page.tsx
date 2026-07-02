import type { Metadata } from "next";

export const metadata: Metadata = { title: "Responsible Gaming" };

export default function ResponsibleGamingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-4 text-3xl font-semibold">Responsible Gaming</h1>
      <p className="text-muted-foreground">
        Safe play guidelines, age restrictions, and risk awareness content will be published here.
      </p>
    </div>
  );
}
