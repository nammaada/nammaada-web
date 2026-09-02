import "server-only";

import { AppError } from "@/lib/server/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type StorefrontCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export async function getStorefrontCategories(): Promise<StorefrontCategory[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,description")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    throw new AppError("internal", "We could not load product categories right now.");
  }

  return (data ?? []) as StorefrontCategory[];
}
