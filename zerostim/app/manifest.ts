import type { MetadataRoute } from "next";

// Lets the web app be added to a phone's home screen and open full-screen.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ZeroStim",
    short_name: "ZeroStim",
    start_url: "/",
    display: "standalone",
    background_color: "#e8173a",
    theme_color: "#e8173a",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
