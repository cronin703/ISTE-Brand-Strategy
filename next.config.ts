import type { NextConfig } from "next";
import { BASE_PATH } from "./lib/basePath";

// The discovery survey is its own static Vercel project, shown at lemoncakestudio.com/survey/.
// See docs/survey-handoff.md.
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
    ];
  },
  async rewrites() {
    return [
      { source: "/survey", destination: `${SURVEY_ORIGIN}/`, basePath: false },
      { source: "/survey/:path+", destination: `${SURVEY_ORIGIN}/:path+`, basePath: false },
    ];
  },
};

export default nextConfig;
