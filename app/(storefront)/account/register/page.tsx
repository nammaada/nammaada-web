"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { registerCustomerAction } from "@/actions/account";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMsg("Please fill in your name, email address, and a password.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      // Directly create pre-confirmed account on backend
      const res = await registerCustomerAction({
        fullName: fullName.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        password,
      });

      if (!res.ok) {
        setErrorMsg(res.message || "Failed to create account. Please try again.");
        setLoading(false);
        return;
      }

      // Immediately sign in the new customer
      const supabase = createSupabaseBrowserClient();
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (signInErr) {
        // Redirect to login with email prefilled
        window.location.href = `/account/login?next=${encodeURIComponent(next)}`;
        return;
      }

      // Direct success redirect
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
          <UserPlus size={24} />
        </div>
        <p className="eyebrow">Create Account</p>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[#2b1719]">
          Join Namma Ada
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#6e5b55]">
          Create an account to track deliveries, repeat orders, and enjoy a personalized experience.
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

      <form onSubmit={handleRegister} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-xs sm:text-sm font-semibold text-[#2b1719]">
            Full name
          </Label>
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="e.g. Rahul Sharma"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="rounded-xl border-[#dfd0bd] bg-white/80"
          />
        </div>

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
          <Label htmlFor="phone" className="text-xs sm:text-sm font-semibold text-[#2b1719]">
            Phone (optional)
          </Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="e.g. 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-xl border-[#dfd0bd] bg-white/80"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs sm:text-sm font-semibold text-[#2b1719]">
            Password (at least 6 characters)
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
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
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <div className="mt-8 border-t border-[#eedec8] pt-6 text-center text-xs sm:text-sm text-[#6e5b55]">
        Already have an account?{" "}
        <Link
          href={`/account/login${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-bold text-[#711e2c] hover:underline"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function CustomerRegisterPage() {
  return (
    <section className="section-shell py-12 sm:py-20 flex items-center justify-center">
      <Container>
        <Suspense fallback={<div className="text-center py-12 text-[#6e5b55]">Loading...</div>}>
          <RegisterForm />
        </Suspense>
      </Container>
    </section>
  );
}
