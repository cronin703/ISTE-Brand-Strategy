"use client";

import { useActionState } from "react";
import { login, type LoginState } from "../actions";

export function LoginForm({ who, isParent }: { who: string; isParent: boolean }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="card">
      <input type="hidden" name="who" value={who} />
      <div className="field">
        <label htmlFor="secret">{isParent ? "Password" : "PIN"}</label>
        <input
          id="secret"
          name="secret"
          type="password"
          autoFocus
          required
          autoComplete={isParent ? "current-password" : "off"}
          inputMode={isParent ? undefined : "numeric"}
          aria-describedby={state.error ? "login-error" : undefined}
          aria-invalid={state.error ? true : undefined}
        />
        {state.error && <p id="login-error" className="error" role="alert">{state.error}</p>}
      </div>
      <button className="btn btn-primary" disabled={pending} aria-busy={pending || undefined}>
        {pending ? "Checking…" : isParent ? "Log in" : "See my week"}
      </button>
    </form>
  );
}
