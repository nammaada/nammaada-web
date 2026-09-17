import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export function resolveBaseTable(table: string): string {
  const map: Record<string, string> = {
    admin_products: "products",
    admin_orders: "orders",
    admin_order_items: "order_items",
    admin_categories: "categories",
    admin_product_images: "product_images",
    admin_bulk_enquiries: "bulk_enquiries",
    admin_hero_banners: "hero_banners",
    admin_testimonials: "testimonials",
    admin_kitchen_reels: "kitchen_reels",
    admin_customers: "customers",
    admin_payments: "payments",
    admin_product_variants: "product_variants",
    admin_courier_partners: "courier_partners",
    admin_shipping_rules: "shipping_rules",
  };
  return map[table] || table;
}

export async function adminRows<T>(table: string, columns = "*") {
  const baseTable = resolveBaseTable(table);
  const client = createSupabaseAdminClient();
  const { data, error } = await client
    .from(baseTable)
    .select(columns)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`adminRows query error for ${baseTable}:`, error);
    return [] as T[];
  }
  return (data ?? []) as T[];
}

export async function adminRow<T>(table: string, id: string, columns = "*") {
  const baseTable = resolveBaseTable(table);
  const client = createSupabaseAdminClient();
  const { data, error } = await client
    .from(baseTable)
    .select(columns)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(`adminRow query error for ${baseTable}:`, error);
    return null;
  }
  return data as T | null;
}

export function formatINR(paise: number | null | undefined) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format((paise ?? 0) / 100);
}
