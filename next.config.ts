import type { NextConfig } from "next";
import { BASE_PATH } from "./lib/basePath";

// The discovery survey is its own static Vercel project, shown at lemoncakestudio.com/brand-governance/survey/
// behind the same password as the hub (proxy.ts gates everything under the base path).
// To make it public, add `survey/` to the matcher exclusions in proxy.ts. See docs/survey-handoff.md.
const SURVEY_ORIGIN = "https://iste-brand-survey.vercel.app";

const nextConfig: NextConfig = {
  basePath: BASE_PATH,
  // The survey pages need their trailing slash for relative links, so Next must not strip it.
  skipTrailingSlashRedirect: true,
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
      // Old public survey links now point at the gated address.
      { source: "/survey", destination: `${BASE_PATH}/survey/`, basePath: false, permanent: false },
      { source: "/survey/:path+", destination: `${BASE_PATH}/survey/:path+`, basePath: false, permanent: false },
    ];
  },
  async rewrites() {
    return [
      { source: "/survey", destination: `${SURVEY_ORIGIN}/` },
      { source: "/survey/:path+", destination: `${SURVEY_ORIGIN}/:path+` },
    ];
  },
};

export default nextConfig;
