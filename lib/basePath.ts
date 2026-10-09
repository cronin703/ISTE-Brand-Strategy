// The hub is served under a sub-path (lemoncakestudio.com/brand-governance).
// next/link and the router add it on their own; plain <a>, <img> and metadata URLs need withBase.
export const BASE_PATH = "/brand-governance";

export const withBase = (p: string) => (p.startsWith("/") ? `${BASE_PATH}${p}` : p);
