"use client";

import { useState, type FormEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { checkIsAdminSessionAction } from "@/actions/check-admin-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();

      // Cleanly clear any stale customer session from localStorage and cookies
      await supabase.auth.signOut();

      // Sign in directly in browser to properly update both localStorage and cookies
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error || !data.user) {
        setErrorMsg(error?.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      // Verify the authenticated user is an authorized administrator and set admin cookie
      const isAdmin = await checkIsAdminSessionAction(data.user.id);
      if (!isAdmin) {
        await supabase.auth.signOut();
        setErrorMsg("Access denied. Only authorized administrator accounts can sign in here.");
        setLoading(false);
        return;
      }

      // Navigate to /admin with full page refresh to synchronize server state
      window.location.href = "/admin";
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          autoComplete="email"
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          autoComplete="current-password"
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {errorMsg ? (
        <p className="text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl p-3" role="alert">
          {errorMsg}
        </p>
      ) : null}

      <Button className="w-full min-h-11 rounded-xl" disabled={loading} type="submit">
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
