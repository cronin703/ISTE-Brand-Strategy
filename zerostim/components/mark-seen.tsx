"use client";

import { useEffect } from "react";
import { markSeen } from "@/app/actions";

/** Records a kid's visit after the page renders in a real browser (not link previews). */
export function MarkSeen({ kidId }: { kidId: string }) {
  useEffect(() => {
    markSeen(kidId).catch(() => {});
  }, [kidId]);
  return null;
}
