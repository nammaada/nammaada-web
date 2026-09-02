import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function adminRows<T>(table: string, columns = "*") {
  const { data, error } = await createSupabaseAdminClient().from(table).select(columns).order("created_at", { ascending: false });
  if (error) return [] as T[];
  return (data ?? []) as T[];
}

export async function adminRow<T>(table: string, id: string, columns = "*") {
  const { data, error } = await createSupabaseAdminClient().from(table).select(columns).eq("id", id).maybeSingle();
  return error ? null : data as T | null;
}

export function formatINR(paise: number | null | undefined) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format((paise ?? 0) / 100); }
