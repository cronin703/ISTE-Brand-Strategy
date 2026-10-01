import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/Placeholder";

export const metadata: Metadata = { title: "Templates" };

export default function Page() {
  return (
    <PlaceholderPage
      title="Templates"
      lead="Ready-made slides, documents, social posts and email signatures."
      phase="Phase 2"
      draft={[
        "Slide and document templates with the master brand, type scale and palette built in.",
        "Social post templates sized for each platform.",
        "Email signatures with the right mark for each team.",
        "Until then, start from the master logo and the Color and Typography pages.",
      ]}
    />
  );
}
