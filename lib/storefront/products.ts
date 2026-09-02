import "server-only";

import { AppError } from "@/lib/server/errors";
import { getCloudinaryImageUrl } from "@/lib/cloudinary/delivery";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
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
  images: StorefrontProductImage[];
};

export type StorefrontProductImage = {
  id: string;
  url: string;
  alt: string;
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

async function queryProducts(query: PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>) {
  const { data, error } = await query;

  if (error) {
    throw new AppError("internal", "We could not load products right now.");
  }

  return (data ?? []).map((product) => ({
    ...(product as Omit<StorefrontProduct, "primary_image" | "images">),
    primary_image: null,
    images: [],
  }));
}

async function attachPrimaryImages(
  products: StorefrontProduct[],
) {
  if (products.length === 0) {
    return products;
  }

  // Product IDs have already come from the narrow public storefront view.
  // Read the related image metadata through the server-only client because the
  // public image policy's cross-table predicate cannot access the deliberately
  // non-public products base table for anonymous requests.
  const imageClient = createSupabaseAdminClient();
  const { data, error } = await imageClient
    .from("product_images")
    .select("id,product_id,cloudinary_public_id,alt_text,display_order,is_primary")
    .in("product_id", products.map((product) => product.id))
    .order("is_primary", { ascending: false })
    .order("display_order", { ascending: true });

  if (error) {
    throw new AppError("internal", "We could not load product imagery right now.");
  }

  const images = (data ?? []) as { id: string; product_id: string; cloudinary_public_id: string; alt_text: string; display_order: number; is_primary: boolean }[];
  const imagesByProduct = new Map<string, StorefrontProductImage[]>();

  for (const image of images) {
    const productImages = imagesByProduct.get(image.product_id) ?? [];
    productImages.push({ id: image.id, url: getCloudinaryImageUrl({ publicId: image.cloudinary_public_id, width: 960, height: 720, crop: "fill" }), alt: image.alt_text, display_order: image.display_order });
    imagesByProduct.set(image.product_id, productImages);
  }

  return products.map((product) => ({
    ...product,
    primary_image: imagesByProduct.get(product.id)?.[0] ?? null,
    images: imagesByProduct.get(product.id) ?? [],
  }));
}

export async function getProducts(categoryId?: string): Promise<StorefrontProduct[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("storefront_products").select(productFields).order("display_order", { ascending: true });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const products = await queryProducts(query);
  return attachPrimaryImages(products);
}

export async function getFeaturedProducts(): Promise<StorefrontProduct[]> {
  const supabase = await createSupabaseServerClient();
  const products = await queryProducts(
    supabase.from("storefront_products").select(productFields).eq("is_featured", true).order("display_order", { ascending: true }),
  );
  return attachPrimaryImages(products);
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

  const [product] = await attachPrimaryImages([
    { ...(data as Omit<StorefrontProduct, "primary_image" | "images">), primary_image: null, images: [] },
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
