import { Callout, ContentPage, H2, PageHeader } from "./Page";

export function PlaceholderPage({ title, lead, draft, phase = "Phase 1" }: { title: string; lead: string; draft: string[]; phase?: string }) {
  return (
    <ContentPage>
      <PageHeader title={title} lead={lead} />
      <Callout title={`Full guidance coming in ${phase}.`}>
        This page holds the draft direction until the brand team publishes the full guidance and examples.
      </Callout>
      <H2 id="draft">Draft direction</H2>
      <ul className="list-disc space-y-2 pl-5 text-text marker:text-border-strong">
        {draft.map((d) => <li key={d}>{d}</li>)}
      </ul>
    </ContentPage>
  );
}
