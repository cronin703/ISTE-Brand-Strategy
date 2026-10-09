import "@fontsource-variable/inter";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/AppShell";
import { Footer } from "@/components/Footer";
import { themeScript } from "@/components/ThemeToggle";
import { withBase } from "@/lib/basePath";
import { searchIndex } from "@/lib/search";

export const metadata: Metadata = {
  title: { default: "ISTE Brand Hub", template: "%s · ISTE Brand Hub" },
  description: "Logos, colors, type and voice for ISTE+ASCD, in one place.",
  icons: { icon: withBase("/favicon.svg") },
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
      <body>
        <AppShell searchItems={searchIndex()}>
          {children}
          <Footer />
        </AppShell>
      </body>
    </html>
  );
}
