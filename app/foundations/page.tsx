import type { Metadata } from "next";
import { SectionLanding } from "@/components/SectionLanding";

export const metadata: Metadata = { title: "Foundations" };

export default function Page() {
  return (
    <SectionLanding
      href="/foundations"
      lead="The building blocks behind every ISTE+ASCD piece: color, type, imagery and the accessibility baseline they all meet."
    />
  );
}
