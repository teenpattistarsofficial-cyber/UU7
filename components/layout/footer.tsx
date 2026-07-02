import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/responsible-gaming", label: "Responsible Gaming" },
  { href: "/editorial-policy", label: "Editorial Policy" },
  { href: "/authors", label: "Authors" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-muted/20">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} UU7. All rights reserved.</p>
        <nav className="flex flex-wrap gap-4">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
