import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-4 text-3xl font-semibold">About UU7</h1>
      <p className="text-muted-foreground">
        Our mission, educational purpose, and editorial methodology will be published here.
      </p>
    </div>
  );
}
