import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Next from walking up into the brand-hub app's lockfile.
  outputFileTracingRoot: __dirname,
  turbopack: { root: __dirname },
};

export default nextConfig;
