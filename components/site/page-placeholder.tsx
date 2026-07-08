import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Breadcrumb } from "@/components/site/breadcrumb";

/** Shared "this page has no published CMS content yet" state — about,
 * contact, editorial-policy, and responsible-gaming all fell back to their
 * own copy-pasted bare `<h1>`+`<p>` block before. Deliberately doesn't
 * invent fake content (a contact email/phone that isn't real, for
 * instance) — it just presents "not published yet" as an intentional,
 * designed state rather than an unstyled placeholder that reads like a
 * bug. */
export function PagePlaceholder({
  eyebrow,
  icon: Icon,
  title,
  description,
  children,
}: {
  eyebrow: string;
  icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: title }]} />
      <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
        <Icon className="size-6" />
      </span>
      <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-brand uppercase">{eyebrow}</p>
      <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">{description}</p>
      {children}
    </div>
  );
}
