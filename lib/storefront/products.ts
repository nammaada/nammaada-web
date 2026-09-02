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
  primary_image: { url: string; alt: string } | null;
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

async function queryProducts(query: PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>) {
  const { data, error } = await query;

  if (error) {
    throw new AppError("internal", "We could not load products right now.");
  }

  return (data ?? []).map((product) => ({
    ...(product as Omit<StorefrontProduct, "primary_image">),
    primary_image: null,
  }));
}

async function attachPrimaryImages(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  products: StorefrontProduct[],
) {
  if (products.length === 0) {
    return products;
  }

  const { data, error } = await supabase
    .from("product_images")
    .select("product_id,secure_url,alt_text")
    .in("product_id", products.map((product) => product.id))
    .eq("is_primary", true);

  if (error) {
    throw new AppError("internal", "We could not load product imagery right now.");
  }

  const images = (data ?? []) as { product_id: string; secure_url: string; alt_text: string }[];
  const imageByProduct = new Map(
    images.map((image) => [image.product_id, { url: image.secure_url, alt: image.alt_text }]),
  );

  return products.map((product) => ({
    ...product,
    primary_image: imageByProduct.get(product.id) ?? null,
  }));
}

export async function getProducts(categoryId?: string): Promise<StorefrontProduct[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("storefront_products").select(productFields).order("display_order", { ascending: true });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const products = await queryProducts(query);
  return attachPrimaryImages(supabase, products);
}

export async function getFeaturedProducts(): Promise<StorefrontProduct[]> {
  const supabase = await createSupabaseServerClient();
  const products = await queryProducts(
    supabase.from("storefront_products").select(productFields).eq("is_featured", true).order("display_order", { ascending: true }),
  );
  return attachPrimaryImages(supabase, products);
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

  if (!data) {
    return null;
  }

  const [product] = await attachPrimaryImages(supabase, [
    { ...(data as Omit<StorefrontProduct, "primary_image">), primary_image: null },
  ]);
  return product ?? null;
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
