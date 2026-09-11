import "server-only";

import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/lib/server/errors";
import { getCloudinaryImageUrl } from "@/lib/cloudinary/delivery";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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
  weight?: string | null;
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

async function executeProductQuery(
  buildQuery: (client: SupabaseClient) => PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>
): Promise<StorefrontProduct[]> {
  // Use admin client directly — cookies() is blocked inside unstable_cache with cacheComponents.
  // All storefront product data is public read-only; service role key is appropriate.
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await buildQuery(admin);
    if (error) {
      console.error("[queryProducts] Admin client query failed:", error);
      throw new AppError("internal", "We could not load products right now.");
    }
    return (data ?? []).map((product) => ({
      ...(product as Omit<StorefrontProduct, "primary_image" | "images">),
      primary_image: null,
      images: [],
      weight: null,
    }));
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.error("[queryProducts] Unexpected error loading products:", err);
    throw new AppError("internal", "We could not load products right now.");
  }
}

async function attachPrimaryImages(
  products: StorefrontProduct[],
) {
  if (products.length === 0) {
    return products;
  }

  try {
    const imageClient = createSupabaseAdminClient();
    const [imagesRes, variantsRes] = await Promise.all([
      imageClient
        .from("product_images")
        .select("id,product_id,cloudinary_public_id,alt_text,display_order,is_primary")
        .in("product_id", products.map((product) => product.id))
        .order("is_primary", { ascending: false })
        .order("display_order", { ascending: true }),
      imageClient
        .from("product_variants")
        .select("product_id,name,display_order")
        .in("product_id", products.map((product) => product.id))
        .order("display_order", { ascending: true }),
    ]);

    if (imagesRes.error) {
      console.warn("[attachPrimaryImages] Error loading product imagery:", imagesRes.error.message);
    }

    const images = (imagesRes.data ?? []) as { id: string; product_id: string; cloudinary_public_id: string; alt_text: string; display_order: number; is_primary: boolean }[];
    const imagesByProduct = new Map<string, StorefrontProductImage[]>();

    for (const image of images) {
      const productImages = imagesByProduct.get(image.product_id) ?? [];
      productImages.push({ id: image.id, url: getCloudinaryImageUrl({ publicId: image.cloudinary_public_id, width: 960, crop: "limit" }), alt: image.alt_text, display_order: image.display_order });
      imagesByProduct.set(image.product_id, productImages);
    }

    const weightByProduct = new Map<string, string>();
    const variants = (variantsRes.data ?? []) as { product_id: string; name: string }[];
    for (const v of variants) {
      if (!weightByProduct.has(v.product_id) && v.name) {
        weightByProduct.set(v.product_id, v.name);
      }
    }

    return products.map((product) => ({
      ...product,
      primary_image: imagesByProduct.get(product.id)?.[0] ?? null,
      images: imagesByProduct.get(product.id) ?? [],
      weight: weightByProduct.get(product.id) ?? null,
    }));
  } catch (err) {
    console.warn("[attachPrimaryImages] Unexpected error loading imagery:", err);
    return products;
  }
}

async function fetchProducts(categoryId?: string): Promise<StorefrontProduct[]> {
  const products = await executeProductQuery((client) => {
    let query = client.from("storefront_products").select(productFields).order("display_order", { ascending: true });
    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }
    return query;
  });
  return attachPrimaryImages(products);
}

export function getProducts(categoryId?: string): Promise<StorefrontProduct[]> {
  return unstable_cache(
    () => fetchProducts(categoryId),
    [`storefront-products-${categoryId || "all"}`],
    { tags: ["products"], revalidate: 60 }
  )();
}

async function fetchFeaturedProducts(): Promise<StorefrontProduct[]> {
  let products = await executeProductQuery((client) =>
    client.from("storefront_products").select(productFields).eq("is_featured", true).order("display_order", { ascending: true }).limit(4)
  );

  // Fallback to top products if none are marked as featured yet
  if (products.length === 0) {
    products = await executeProductQuery((client) =>
      client.from("storefront_products").select(productFields).order("display_order", { ascending: true }).limit(4)
    );
  }

  return attachPrimaryImages(products);
}

export const getFeaturedProducts = unstable_cache(
  fetchFeaturedProducts,
  ["storefront-featured-products"],
  { tags: ["products"], revalidate: 60 }
);

export async function searchStorefrontProducts(query: string): Promise<StorefrontProduct[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const products = await executeProductQuery((client) =>
    client
      .from("storefront_products")
      .select(productFields)
      .ilike("name", `%${trimmed}%`)
      .order("display_order", { ascending: true })
      .limit(12)
  );
  return attachPrimaryImages(products);
}

async function fetchProductBySlug(slug: string): Promise<StorefrontProduct | null> {
  // Use admin client — cookies() is blocked inside unstable_cache with cacheComponents.
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("storefront_products")
      .select(productFields)
      .eq("slug", slug)
      .maybeSingle();

    if (!error && data) {
      const [product] = await attachPrimaryImages([
        { ...(data as Omit<StorefrontProduct, "primary_image" | "images">), primary_image: null, images: [], weight: null },
      ]);
      return product ?? null;
    }
  } catch (err) {
    console.error("[getProductBySlug] Admin query error:", err);
  }

  return null;
}

export function getProductBySlug(slug: string): Promise<StorefrontProduct | null> {
  return unstable_cache(
    () => fetchProductBySlug(slug),
    [`storefront-product-${slug}`],
    { tags: ["products", `product-${slug}`], revalidate: 60 }
  )();
}

async function fetchProductVariants(productId: string): Promise<StorefrontProductVariant[]> {
  // Use admin client — cookies() is blocked inside unstable_cache with cacheComponents.
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("storefront_product_variants")
      .select("id,product_id,name,price_paise,is_in_stock,display_order")
      .eq("product_id", productId)
      .order("display_order", { ascending: true });

    if (!error && data) {
      return data as StorefrontProductVariant[];
    }
  } catch (err) {
    console.error("[getProductVariants] Admin query error:", err);
  }

  return [];
}

export function getProductVariants(productId: string): Promise<StorefrontProductVariant[]> {
  return unstable_cache(
    () => fetchProductVariants(productId),
    [`storefront-variants-${productId}`],
    { tags: ["products", `variants-${productId}`], revalidate: 60 }
  )();
}
