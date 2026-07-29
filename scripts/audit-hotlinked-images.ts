import { db } from "@/lib/db";

// Read-only — no writes. Every request for a hotlinked (non-self-hosted)
// featuredImageUrl forces Next's /_next/image optimizer down its
// fetchExternalImage path (a real DNS+outbound fetch to the third-party
// origin before it can even start resizing) instead of fetchInternalImage
// (a local file, no network round-trip) — confirmed directly in Next's own
// installed source. That's the root cause of the intermittent 2-6s
// /_next/image slowness seen in site-health-check crawls. This just
// quantifies how many posts are affected before anything gets migrated.
//
// Usage: npx tsx scripts/audit-hotlinked-images.ts

async function main() {
  const allPosts = await db.query.posts.findMany();

  const selfHosted: string[] = [];
  const external: { title: string; slug: string; url: string }[] = [];
  let empty = 0;

  for (const post of allPosts) {
    if (!post.featuredImageUrl) {
      empty++;
    } else if (post.featuredImageUrl.startsWith("/uploads/")) {
      selfHosted.push(post.slug);
    } else {
      external.push({ title: post.title, slug: post.slug, url: post.featuredImageUrl });
    }
  }

  console.log(`Self-hosted: ${selfHosted.length}`);
  console.log(`No featured image: ${empty}`);
  console.log(`External (hotlinked): ${external.length}`);
  if (external.length > 0) {
    console.log("---");
    external.forEach((p) => console.log(`  "${p.title}" (${p.slug}): ${p.url}`));
  }
  process.exit(0);
}
main();
