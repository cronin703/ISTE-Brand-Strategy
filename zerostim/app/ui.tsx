"use client";

import { useFormStatus } from "react-dom";

/** Submit button that dims while its form is saving. */
export function Pending({ className, children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();
  return (
    <button {...rest} className={className} aria-busy={pending || undefined} disabled={rest.disabled || pending}>
      {children}
    </button>
  );
}
