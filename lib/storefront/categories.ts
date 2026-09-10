import "server-only";

import { unstable_cache } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type StorefrontCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

async function fetchCategories(): Promise<StorefrontCategory[]> {
  // Use admin client — cookies() is blocked inside unstable_cache with cacheComponents.
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("categories")
      .select("id,name,slug,description")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (!error && data) {
      return data as StorefrontCategory[];
    }
  } catch {
    // ignore
  }

  return [];
}

export const getStorefrontCategories = unstable_cache(
  fetchCategories,
  ["storefront-categories"],
  { tags: ["categories"], revalidate: 300 }
);

