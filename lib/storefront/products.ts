import "server-only";

import { AppError } from "@/lib/server/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type StorefrontProduct = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price_paise: number;
  is_in_stock: boolean;
  delivery_scope: "all_india" | "bangalore_only";
  is_free_shipping: boolean;
  is_featured: boolean;
  display_order: number;
};

export type StorefrontProductVariant = {
  id: string;
  product_id: string;
  name: string;
  price_paise: number;
  is_in_stock: boolean;
  display_order: number;
};

const productFields = "id,category_id,name,slug,short_description,description,price_paise,is_in_stock,delivery_scope,is_free_shipping,is_featured,display_order";

async function queryProducts(query: PromiseLike<{ data: unknown; error: { message: string } | null }>) {
  const { data, error } = await query;

  if (error) {
    throw new AppError("internal", "We could not load products right now.");
  }

  return (data ?? []) as StorefrontProduct[];
}

export async function getProducts(): Promise<StorefrontProduct[]> {
  const supabase = await createSupabaseServerClient();
  return queryProducts(
    supabase.from("storefront_products").select(productFields).order("display_order", { ascending: true }),
  );
}

export async function getFeaturedProducts(): Promise<StorefrontProduct[]> {
  const supabase = await createSupabaseServerClient();
  return queryProducts(
    supabase.from("storefront_products").select(productFields).eq("is_featured", true).order("display_order", { ascending: true }),
  );
}

export async function getProductBySlug(slug: string): Promise<StorefrontProduct | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("storefront_products")
    .select(productFields)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new AppError("internal", "We could not load this product right now.");
  }

  return (data ?? null) as StorefrontProduct | null;
}

export async function getProductVariants(productId: string): Promise<StorefrontProductVariant[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("storefront_product_variants")
    .select("id,product_id,name,price_paise,is_in_stock,display_order")
    .eq("product_id", productId)
    .order("display_order", { ascending: true });

  if (error) {
    throw new AppError("internal", "We could not load product options right now.");
  }

  return (data ?? []) as StorefrontProductVariant[];
}
