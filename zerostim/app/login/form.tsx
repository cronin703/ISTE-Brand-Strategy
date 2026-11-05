"use client";

import { useActionState } from "react";
import type { FormState } from "../actions";

/** Email + password for parents; password only for the admin. */
export function LoginForm({ action: act, withEmail }: { action: (s: FormState, f: FormData) => Promise<FormState>; withEmail: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(act, {});
  const described = state.error ? "login-error" : undefined;
  return (
    <form action={action} className="panel">
      {withEmail && (
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="text-input" autoComplete="username" autoFocus required aria-describedby={described} />
        </div>
      )}
      <div className="field">
        <label htmlFor="secret">Password</label>
        <input
          id="secret"
          name="secret"
          type="password"
          required
          autoFocus={!withEmail}
          autoComplete="current-password"
          aria-describedby={described}
          aria-invalid={state.error ? true : undefined}
        />
        {state.error && <p id="login-error" className="error" role="alert">{state.error}</p>}
      </div>
      <button className="btn btn-solid" disabled={pending} aria-busy={pending || undefined}>
        {pending ? "Checking…" : "Log in"}
      </button>
    </form>
  );
}
