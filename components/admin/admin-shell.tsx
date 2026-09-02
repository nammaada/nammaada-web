"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { LogOut, Menu, X, ShieldCheck } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";

export function AdminShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:w-64 lg:flex-col border-r border-border/80 bg-card p-6 shadow-xs">
        {/* Brand Header */}
        <div className="mb-8 flex items-center justify-between px-2">
          <Link className="flex flex-col group" href="/admin">
            <span className="font-display text-2xl font-bold tracking-tight text-primary group-hover:opacity-90 transition-opacity">
              Namma Ada
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1 mt-0.5">
              <ShieldCheck className="size-3 text-accent" /> Admin Portal
            </span>
          </Link>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto pr-1">
          <AdminNav />
        </div>

        {/* Logout Section */}
        <div className="mt-auto pt-6 border-t border-border/80">
          <form action={logoutAction}>
            <button
              className="flex w-full min-h-10 items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              type="submit"
            >
              <span>Sign out</span>
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Top Header & Navigation Sheet */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/80 bg-card/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <Link className="flex items-center gap-2" href="/admin">
          <span className="font-display text-xl font-bold text-primary">Namma Ada</span>
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-primary uppercase">
            Admin
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            aria-label="Toggle navigation menu"
            className="rounded-lg p-2 text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setMobileOpen(!mobileOpen)}
            type="button"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-primary/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Menu */}
          <div className="relative flex w-full max-w-xs flex-col bg-card p-6 shadow-lifted z-10 overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <Link className="font-display text-2xl font-bold text-primary" href="/admin" onClick={() => setMobileOpen(false)}>
                Namma Ada
              </Link>
              <button
                aria-label="Close menu"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
                onClick={() => setMobileOpen(false)}
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <AdminNav onNavClick={() => setMobileOpen(false)} />

            <div className="mt-auto pt-6 border-t border-border">
              <form action={logoutAction}>
                <Button className="w-full justify-between" variant="outline" type="submit">
                  <span>Sign out</span>
                  <LogOut size={16} />
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
