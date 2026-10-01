import type { Metadata } from "next";
import { SectionLanding } from "@/components/SectionLanding";

export const metadata: Metadata = { title: "Resources" };

export default function Page() {
  return <SectionLanding href="/resources" />;
}
