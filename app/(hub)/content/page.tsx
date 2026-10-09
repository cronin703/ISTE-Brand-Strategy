import type { Metadata } from "next";
import { SectionLanding } from "@/components/SectionLanding";

export const metadata: Metadata = { title: "Content" };

export default function Page() {
  return <SectionLanding href="/content" lead="How ISTE+ASCD sounds, how to write its names, and words you can copy." />;
}
