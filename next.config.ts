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
  outputFileTracingIncludes: {
    "/**": ["./node_modules/sharp/**/*", "./node_modules/@img/**/*"],
  },
  images: {
    // AVIF first — next/image already re-encodes every image it serves, this
    // just lets it pick a smaller format than the webp-only default when the
    // requesting browser supports it (Chrome/Firefox on PageSpeed's crawler
    // do), which is what the "Improve image delivery" audit was measuring.
    formats: ["image/avif", "image/webp"],
    // The /_next/image optimizer endpoint defaults to a 60s Cache-Control,
    // which is what "efficient cache lifetimes" was flagging for
    // post-thumbnail/hero images served through it, not just the raw
    // /uploads files. Safe to set to a year: uploads get a fresh randomUUID
    // filename per upload (lib/media/process-upload.ts), and the one static
    // hero asset only ever changes via a redeploy of this file itself.
    minimumCacheTTL: 31536000,
  },
  // Static assets in /public (favicon/logo/hero image) get served by Next's
  // own static file handler with no caching by default — PageSpeed's
  // "efficient cache lifetimes" audit flags exactly this. /_next/static/*
  // already gets a 1-year immutable header from Next itself (content-hashed
  // filenames), so it isn't listed here. Uploaded media sets its own
  // identical Cache-Control directly in app/uploads/[filename]/route.ts
  // instead of a rule here, since it's served by that route handler now,
  // not Next's static file handler — see that route's own comment.
  async headers() {
    return [
      {
        source: "/:path*.(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
