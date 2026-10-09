import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/Placeholder";

export const metadata: Metadata = { title: "Iconography and illustration" };

export default function Page() {
  return (
    <PlaceholderPage
      title="Iconography and illustration"
      lead="Simple flat or line icons, and abstract motifs that suggest connection."
      draft={[
        "Flat or line-style icons with consistent stroke weight and rounded joins.",
        "Abstract network motifs (nodes, links, subtle tech patterns) instead of literal clip art.",
        "Icons support a label. They never replace one.",
        "Use navy for icons; reserve the accent for one highlighted icon at most.",
      ]}
    />
  );
}
