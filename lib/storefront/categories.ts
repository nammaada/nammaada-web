import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type StorefrontCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export async function getStorefrontCategories(): Promise<StorefrontCategory[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id,name,slug,description")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (!error && data) {
      return data as StorefrontCategory[];
    }
  } catch {
    // fallback
  }

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

