import { AppShell } from "@/components/AppShell";
import { Footer } from "@/components/Footer";
import { searchIndex } from "@/lib/search";

// The hub's chrome (header, sidebar, search, footer). The unlock page sits outside this group.
export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell searchItems={searchIndex()}>
      {children}
      <Footer />
    </AppShell>
  );
}
