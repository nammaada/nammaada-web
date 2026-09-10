import type { ReactNode } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  // Explicitly opt this layout out of PPR prerendering.
  // The admin layout always reads cookies for auth (via requireAdmin → Supabase JWT),
  // which uses Date.now() internally. Without this, cacheComponents PPR tries to
  // prerender the shell and throws an "unstable value" error.
  await connection();
  await requireAdmin();

  return <AdminShell>{children}</AdminShell>;
}
