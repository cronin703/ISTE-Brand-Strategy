"use client";

import { useEffect } from "react";
import { kidVisit } from "@/app/actions";

/** Records a kid's visit after the page renders in a real browser (not link previews),
 *  and remembers the family on this device. */
export function MarkSeen({ kidToken }: { kidToken: string }) {
  useEffect(() => {
    kidVisit(kidToken).catch(() => {});
  }, [kidToken]);
  return null;
}
