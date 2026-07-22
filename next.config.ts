import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a self-contained .next/standalone server bundle (node_modules
  // pruned to only what's actually required at runtime) — this is what the
  // Dockerfile's runtime stage copies, instead of shipping the full
  // pnpm-installed node_modules tree into the image.
  output: "standalone",
  // The standalone tracer misses sharp's native libvips shared library
  // (@img/sharp-<platform> and @img/sharp-libvips-<platform>) because it's
  // loaded via dlopen at runtime, not a traceable `require()` — the sharp
  // .node binding file gets traced and copied (it's directly required), but
  // the .so file it dynamically links against doesn't, so the standalone
  // build looks fine while the actual runtime upload crashes with
  // ERR_DLOPEN_FAILED. Force-including both packages' full directories
  // fixes this regardless of which platform variant ends up resolved.
  //
  // Every one of these globs targets `.pnpm/<pkg>@<version>/node_modules/...`,
  // NOT the top-level `node_modules/<pkg>` path — under pnpm, top-level
  // `node_modules/sharp`, `node_modules/detect-libc`, `node_modules/semver`
  // are symlinks into the virtual store, and `node_modules/@img` has no
  // top-level entry at all (it only exists nested under
  // `.pnpm/sharp@.../node_modules/@img/`, itself a symlink into
  // `.pnpm/@img+sharp-<platform>@.../node_modules/@img/...`). An earlier
  // version of this config used `./node_modules/@img/**/*`, which matched
  // zero files on every platform, every time — pnpm never populates that
  // path — so the platform binary + libvips .so silently never made it
  // into the standalone output, regardless of whatever pnpm/install-script
  // fix was tried elsewhere. `**` mid-glob spans the version-suffixed
  // directory names (including the `+` for scoped packages and any
  // peer-dep hash suffix like `_@types+node@20.19.43`).
  outputFileTracingIncludes: {
    // detect-libc/semver added alongside sharp/@img after discovering
    // next/image's built-in resize/reformat silently no-ops in production
    // (serves the original file untouched, any width/quality) — these are
    // sharp's own plain-JS `dependencies` (see node_modules/sharp/package.json),
    // required internally via requires that aren't statically analyzable by
    // Next's file tracer. The include glob alone wasn't sufficient either:
    // the standalone build flattens sharp into a real top-level
    // node_modules/sharp/ directory with its own (initially empty) nested
    // node_modules scope, so these also had to become genuine top-level
    // project dependencies (see package.json) — Node's module resolution
    // walks up from node_modules/sharp/dist/ to the project's own
    // node_modules/ root, which only has detect-libc/semver if they're
    // real direct dependencies, not just traced-and-copied files somewhere
    // else in the tree. Nobody had hit this before since manual upload
    // processing (lib/media/process-upload.ts) runs in the full
    // pnpm-installed tree, before any of this standalone-specific pruning
    // happens.
    "/**": [
      "./node_modules/sharp/**/*",
      "./node_modules/@img/**/*",
      "./node_modules/detect-libc/**/*",
      "./node_modules/semver/**/*",
      "./node_modules/.pnpm/sharp@**/*",
      "./node_modules/.pnpm/@img+**/*",
      "./node_modules/.pnpm/detect-libc@**/*",
      "./node_modules/.pnpm/semver@**/*",
    ],
  },
  images: {
    // AVIF first — next/image already re-encodes every image it serves, this
    // just lets it pick a smaller format than the webp-only default when the
    // requesting browser supports it (Chrome/Firefox on PageSpeed's crawler
    // do), which is what the "Improve image delivery" audit was measuring.
    formats: ["image/avif", "image/webp"],
    // Next's default deviceSizes tops out at 3840 — sized for a full-bleed
    // 4K hero image. Nothing on this site ever renders an image wider than
    // ~768px (the article cover image's own `sizes`, the widest case on the
    // whole site — see app/(site)/[category]/[slug]/page.tsx), so the
    // 1920/2048/3840 buckets can only ever be selected by a mis-evaluated
    // `sizes` hint, never a real layout need. Capping at 1920 (covers even a
    // 768px-wide box at ~2.5x DPR) bounds worst-case payload regardless of
    // why a candidate gets picked, rather than only fixing the `sizes`
    // string and hoping every browser resolves it the same way. imageSizes
    // (small, non-viewport-relative images like the header logo) is left at
    // Next's default — those were never the problem.
    deviceSizes: [384, 640, 750, 828, 1080, 1200, 1920],
    // The /_next/image optimizer endpoint defaults to a 60s Cache-Control,
    // which is what "efficient cache lifetimes" was flagging for
    // post-thumbnail/hero images served through it, not just the raw
    // /uploads files. Safe to set to a year: uploads get a fresh randomUUID
    // filename per upload (lib/media/process-upload.ts), and the one static
    // hero asset only ever changes via a redeploy of this file itself.
    minimumCacheTTL: 31536000,
    // Next's image optimizer refuses to fetch from a domain that isn't
    // explicitly allowed here — a deliberate SSRF/abuse guard, not an
    // oversight. Pexels is allowlisted for post cover images sourced as free-
    // to-use stock photos (Pexels License: free for commercial use, no
    // attribution required) rather than uploaded through Media Library.
    remotePatterns: [{ protocol: "https", hostname: "images.pexels.com" }],
  },
  // Static assets in /public (favicon/logo/hero image) get served by Next's
  // own static file handler with no caching by default — PageSpeed's
  // "efficient cache lifetimes" audit flags exactly this. /_next/static/*
  // already gets a 1-year immutable header from Next itself (content-hashed
  // filenames), so it isn't listed here. Uploaded media sets its own
  // identical Cache-Control directly in app/uploads/[filename]/route.ts
  // instead of a rule here, since it's served by that route handler now,
  // not Next's static file handler — see that route's own comment.
  //
  // `:file` (no `*`/`+` modifier) matches exactly one path segment, i.e.
  // only root-level files like /favicon.ico or /Base image transparent.webp
  // — deliberately NOT `/:path*.(ext)`, which also matched /uploads/*.webp
  // and, worse, applied this same immutable 1-year header to that route's
  // 404 responses too (headers() applies by path regardless of status
  // code). Cloudflare then permanently cached a "file not found yet" 404
  // for a full year the moment anything referenced an upload before it was
  // actually written — confirmed live for a cover image swapped in before
  // its file existed on production. The uploads route is the sole owner of
  // its own Cache-Control now, for both the 200 and 404 cases.
  async headers() {
    return [
      {
        source: "/:file.(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
