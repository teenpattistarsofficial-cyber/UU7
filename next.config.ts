import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a self-contained .next/standalone server bundle (node_modules
  // pruned to only what's actually required at runtime) — this is what the
  // Dockerfile's runtime stage copies, instead of shipping the full
  // pnpm-installed node_modules tree into the image.
  output: "standalone",
};

export default nextConfig;
