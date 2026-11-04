import type { MetadataRoute } from "next";

// Lets the web app be added to a phone's home screen and open full-screen.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ZeroStim",
    short_name: "ZeroStim",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f4ef",
    theme_color: "#f6f4ef",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
