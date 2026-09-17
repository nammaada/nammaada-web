"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, ArrowRight, Eye, EyeOff } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { autoConfirmCustomerAction } from "@/actions/account";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both your email address and password.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const supabase = createSupabaseBrowserClient();
      let { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      // If email was not confirmed, automatically confirm and retry login seamlessly
      if (error && error.message.toLowerCase().includes("email not confirmed")) {
        const confirmed = await autoConfirmCustomerAction(cleanEmail);
        if (confirmed) {
          const retry = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
          error = retry.error;
        }
      }

      if (error) {
        setErrorMsg(error.message || "Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      // Hard redirect to refresh server state
      window.location.href = next;
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-white/60 bg-gradient-to-br from-white/90 via-white/70 to-white/50 p-6 sm:p-9 shadow-xl shadow-amber-950/8 backdrop-blur-xl">
      <div className="text-center mb-8">
        <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#711e2c]/10 text-[#711e2c] mb-3">
          <LogIn size={24} />
        </div>
        <p className="eyebrow">Welcome Back</p>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[#2b1719]">
          Sign in to your account
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#6e5b55]">
          Track orders, view purchase history, and manage your delivery details.
        </p>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-red-300 bg-red-50/90 p-3.5 text-xs sm:text-sm font-medium text-red-800 animate-in fade-in"
        >
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-[#2b1719]">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-xl border-[#dfd0bd] bg-white/80"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs sm:text-sm font-semibold text-[#2b1719]">
              Password
            </Label>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-xl border-[#dfd0bd] bg-white/80 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6e5b55] hover:text-[#2b1719]"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full min-h-12 rounded-full bg-[#711e2c] hover:bg-[#5a1723] text-sm font-bold text-white shadow-md cursor-pointer mt-2"
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-8 border-t border-[#eedec8] pt-6 text-center text-xs sm:text-sm text-[#6e5b55]">
        Don&apos;t have an account yet?{" "}
        <Link
          href={`/account/register${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-bold text-[#711e2c] hover:underline"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <section className="section-shell py-12 sm:py-20 flex items-center justify-center">
      <Container>
        <Suspense fallback={<div className="text-center py-12 text-[#6e5b55]">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </Container>
    </section>
  );
}
