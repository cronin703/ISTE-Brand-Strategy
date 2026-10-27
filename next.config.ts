import type { NextConfig } from "next";
import { BASE_PATH } from "./lib/basePath";

// The discovery survey is its own static Vercel project (served at brand.iste.org/survey/).
// It is also shown here at lemoncakestudio.com/brand-governance/survey/, with no password:
// proxy.ts leaves `survey` out of the gate. See docs/survey-handoff.md.
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
      // Old /survey links point at the hub address.
      { source: "/survey", destination: `${BASE_PATH}/survey/`, basePath: false, permanent: false },
      { source: "/survey/:path+", destination: `${BASE_PATH}/survey/:path+`, basePath: false, permanent: false },
    ];
  },
  async rewrites() {
    return [
      { source: "/survey", destination: `${SURVEY_ORIGIN}/survey/` },
      { source: "/survey/:path+", destination: `${SURVEY_ORIGIN}/survey/:path+` },
    ];
  },
};

export default nextConfig;
