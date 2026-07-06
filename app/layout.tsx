import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import { buildOrganizationSchema, buildWebsiteSchema } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/article/json-ld";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | UU7",
    default: "UU7 — Gaming Guides, Betting Guides & Bonus Reviews",
  },
  description:
    "Game guides, betting guides, bonus breakdowns, tutorials, and gaming statistics.",
};

const organizationSchema = buildOrganizationSchema({
  name: "UU7",
  url: SITE_URL,
  logoUrl: `${SITE_URL}${encodeURI("/UU7.io logo.webp")}`,
  description: "Game guides, betting guides, bonus breakdowns, tutorials, and gaming statistics.",
  areaServed: "India",
});
const websiteSchema = buildWebsiteSchema({ name: "UU7", url: SITE_URL });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <JsonLd blocks={[organizationSchema, websiteSchema]} />
      </body>
    </html>
  );
}
