"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          autoComplete="email"
          id="email"
          name="email"
          placeholder="admin@example.com"
          type="email"
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
          error={Boolean(state.fieldErrors?.email)}
        />
        {state.fieldErrors?.email ? <p className="text-sm text-red-900" id="email-error">{state.fieldErrors.email}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          autoComplete="current-password"
          id="password"
          name="password"
          type="password"
          aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
          error={Boolean(state.fieldErrors?.password)}
        />
        {state.fieldErrors?.password ? <p className="text-sm text-red-900" id="password-error">{state.fieldErrors.password}</p> : null}
      </div>

      {state.message ? <p className="text-sm text-red-900" role="alert">{state.message}</p> : null}

      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
