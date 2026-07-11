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
};

export default nextConfig;
