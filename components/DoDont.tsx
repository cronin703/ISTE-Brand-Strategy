import { CheckIcon, CrossIcon } from "./icons";

export function DoDontGrid({ children }: { children: React.ReactNode }) {
  return <ul className="grid gap-4 sm:grid-cols-2">{children}</ul>;
}

/** One example tile labelled "Do" or "Don't" in words, not color alone. */
export function DoDont({
  kind,
  caption,
  children,
  tileClass = "bg-tile",
}: {
  kind: "do" | "dont";
  caption: string;
  children: React.ReactNode;
  tileClass?: string;
}) {
  const isDo = kind === "do";
  return (
    <li className="overflow-hidden rounded-lg border border-border">
      <div className={`flex aspect-[16/9] items-center justify-center overflow-hidden p-8 ${tileClass}`} aria-hidden>
        {children}
      </div>
      <div className={`border-t-4 px-4 py-3 ${isDo ? "border-success" : "border-danger"}`}>
        <p className={`flex items-center gap-1.5 text-sm font-bold ${isDo ? "text-success" : "text-danger"}`}>
          {isDo ? <CheckIcon width={16} height={16} /> : <CrossIcon width={16} height={16} />}
          {isDo ? "Do" : "Don’t"}
        </p>
        <p className="mt-1 text-[15px] text-text">{caption}</p>
      </div>
    </li>
  );
}
