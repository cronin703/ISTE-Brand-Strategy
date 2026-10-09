import "@fontsource-variable/inter";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { themeScript } from "@/components/ThemeToggle";
import { withBase } from "@/lib/basePath";

export const metadata: Metadata = {
  title: { default: "ISTE Brand Hub", template: "%s · ISTE Brand Hub" },
  description: "Logos, colors, type and voice for ISTE+ASCD, in one place.",
  // Password-protected demo: keep it out of search engines.
  robots: { index: false, follow: false },
  icons: {
    icon: [
      { url: withBase("/favicon.svg"), type: "image/svg+xml" },
      { url: withBase("/favicon-32.png"), sizes: "32x32", type: "image/png" },
    ],
    apple: withBase("/apple-touch-icon.png"),
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#161a1d" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
