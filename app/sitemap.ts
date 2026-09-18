import type { MetadataRoute } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nammaada.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/policies`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  try {
    const supabase = createSupabaseAdminClient();

    // Fetch active categories
    const { data: categories } = await supabase
      .from("categories")
      .select("slug, updated_at")
      .order("display_order", { ascending: true });

    const categoryRoutes: MetadataRoute.Sitemap = (categories || []).map((cat) => ({
      url: `${baseUrl}/categories/${encodeURIComponent(cat.slug)}`,
      lastModified: cat.updated_at ? new Date(cat.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Fetch active products
    const { data: products } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("is_active", true);

    const productRoutes: MetadataRoute.Sitemap = (products || []).map((prod) => ({
      url: `${baseUrl}/products/${encodeURIComponent(prod.slug)}`,
      lastModified: prod.updated_at ? new Date(prod.updated_at) : new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch (error) {
    console.error("Failed to generate dynamic sitemap routes:", error);
    return staticRoutes;
  }
}
