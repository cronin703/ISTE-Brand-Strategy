import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/Placeholder";

export const metadata: Metadata = { title: "Photography" };

export default function Page() {
  return (
    <PlaceholderPage
      title="Photography"
      lead="Real educators and students, in real classrooms, doing real work."
      draft={[
        "Authentic, diverse students and educators actively engaged with technology.",
        "Collaborative, in-the-moment shots. Avoid posed stock photography.",
        "One strong image per layout, with room around it. No cluttered collages.",
        "Get consent for every identifiable student, and describe each photo in its alt text.",
      ]}
    />
  );
}
