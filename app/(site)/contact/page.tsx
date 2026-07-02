import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-4 text-3xl font-semibold">Contact</h1>
      <p className="text-muted-foreground">A contact form lands here in a later phase.</p>
    </div>
  );
}
