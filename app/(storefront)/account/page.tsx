"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Package, ShoppingBag, LogOut, ArrowRight, Clock } from "lucide-react";
import { useCustomerAuth } from "@/lib/auth/customer-context";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function MyAccountPage() {
  const router = useRouter();
  const { user, profile, loading, signOut } = useCustomerAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/account/login?next=/account");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="section-shell py-12 sm:py-20">
        <Container className="space-y-4">
          <div className="h-4 w-28 animate-pulse rounded bg-[#e5d8c6]" />
          <div className="h-10 max-w-xs animate-pulse rounded bg-[#e5d8c6]" />
          <div className="h-48 w-full animate-pulse rounded-2xl bg-[#e5d8c6]" />
        </Container>
      </main>
    );
  }

  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Recently joined";

  return (
    <section className="section-shell py-10 sm:py-16">
      <Container className="max-w-4xl">
        <div className="mb-8">
          <p className="eyebrow">Customer Portal</p>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl font-bold text-[#2b1719]">
            My Account
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#6e5b55]">
            Manage your personal profile and view your past orders with Namma Ada.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Overview Card */}
          <div className="md:col-span-2 rounded-3xl border border-white/70 bg-gradient-to-br from-white/90 via-white/70 to-white/50 p-6 sm:p-8 backdrop-blur-xl shadow-xl shadow-amber-950/8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-[#711e2c]/10 text-[#711e2c]">
                <User size={32} />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-[#2b1719]">
                  {profile?.fullName || "Valued Customer"}
                </h2>
                <p className="text-xs sm:text-sm text-[#6e5b55] font-mono mt-0.5">
                  {profile?.email}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-[#6e5b55] mt-1">
                  <Clock size={12} />
                  <span>Member since {createdAt}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#eedec8] pt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#eedec8]/80 bg-white/60 p-4">
                <span className="text-[11px] font-semibold text-[#6e5b55] uppercase tracking-wider">
                  Full Name
                </span>
                <p className="text-sm font-bold text-[#2b1719] mt-0.5">
                  {profile?.fullName || "Not provided"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#eedec8]/80 bg-white/60 p-4">
                <span className="text-[11px] font-semibold text-[#6e5b55] uppercase tracking-wider">
                  Email Address
                </span>
                <p className="text-sm font-bold text-[#2b1719] mt-0.5 truncate">
                  {profile?.email || "Not provided"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#eedec8]/80 bg-white/60 p-4 sm:col-span-2">
                <span className="text-[11px] font-semibold text-[#6e5b55] uppercase tracking-wider">
                  Phone (WhatsApp)
                </span>
                <p className="text-sm font-bold text-[#2b1719] mt-0.5">
                  {profile?.phone || "Saved on checkout"}
                </p>
              </div>
            </div>

            <div className="border-t border-[#eedec8] pt-5 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="border-red-200 text-red-700 hover:bg-red-50 font-semibold cursor-pointer"
              >
                <LogOut size={15} className="mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="space-y-4">
            <Link
              href="/account/orders"
              className="group block rounded-3xl border border-white/70 bg-gradient-to-br from-[#711e2c] to-[#541520] p-6 text-white shadow-xl shadow-[#711e2c]/20 hover:shadow-2xl transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="size-10 rounded-xl bg-white/15 flex items-center justify-center">
                  <Package size={20} />
                </div>
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </div>
              <h3 className="font-display text-lg font-bold mt-4">My Orders</h3>
              <p className="text-xs text-white/80 mt-1 leading-relaxed">
                Check status, delivery tracking, and item details for all your orders.
              </p>
            </Link>

            <Link
              href="/products"
              className="group block rounded-3xl border border-white/70 bg-gradient-to-br from-white/90 via-white/70 to-white/50 p-6 shadow-xl shadow-amber-950/8 hover:shadow-2xl transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="size-10 rounded-xl bg-[#711e2c]/10 text-[#711e2c] flex items-center justify-center">
                  <ShoppingBag size={20} />
                </div>
                <ArrowRight size={18} className="text-[#711e2c] transition-transform group-hover:translate-x-1" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#2b1719] mt-4">Order Delicacies</h3>
              <p className="text-xs text-[#6e5b55] mt-1 leading-relaxed">
                Explore authentic Palada Payasam, Unniyappam, and Kerala snacks.
              </p>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
