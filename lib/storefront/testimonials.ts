import "server-only";

import { unstable_cache } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type StorefrontTestimonial = {
  id: string;
  display_name: string;
  location: string | null;
  content: string;
};

async function fetchTestimonials(): Promise<StorefrontTestimonial[]> {
  // Use admin client — cookies() is blocked inside unstable_cache with cacheComponents.
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("testimonials")
      .select("id,display_name,location,content")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data as StorefrontTestimonial[];
    }
  } catch {
    // ignore
  }

  return [];
}

export const getTestimonials = unstable_cache(
  fetchTestimonials,
  ["storefront-testimonials"],
  { tags: ["testimonials"], revalidate: 300 }
);

