import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export function AdminShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-secondary/35"><aside className="hidden border-r border-border bg-card lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:p-5"><Link className="mb-8 px-3 font-display text-2xl text-primary" href="/admin">Namma Ada</Link><AdminNav /><form action={logoutAction} className="mt-auto"><button className="w-full rounded-lg px-3 py-3 text-left text-sm font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary" type="submit">Log out</button></form></aside><div className="lg:pl-64"><header className="border-b border-border bg-card/90 px-5 py-4 backdrop-blur lg:hidden"><div className="flex items-center justify-between gap-4"><Link className="font-display text-xl text-primary" href="/admin">Namma Ada</Link><form action={logoutAction}><button className="text-sm font-semibold text-primary" type="submit">Log out</button></form></div><div className="mt-4 overflow-x-auto pb-1"><AdminNav /></div></header><main className="mx-auto w-full max-w-7xl p-5 sm:p-8">{children}</main></div></div>;
}
