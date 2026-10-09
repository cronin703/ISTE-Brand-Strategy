import type { NextConfig } from "next";
import { BASE_PATH } from "./lib/basePath";

const nextConfig: NextConfig = {
  basePath: BASE_PATH,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  async redirects() {
    return [
      // Nothing lives at the domain root yet, so send it to the hub.
      { source: "/", destination: BASE_PATH, basePath: false, permanent: false },
    ];
  },
};

export default nextConfig;
