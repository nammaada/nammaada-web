import "server-only";

import { AppError } from "@/lib/server/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type StorefrontTestimonial = {
  id: string;
  display_name: string;
  location: string | null;
  content: string;
};

export async function getTestimonials(): Promise<StorefrontTestimonial[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("id,display_name,location,content")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    throw new AppError("internal", "We could not load testimonials right now.");
  }

  return (data ?? []) as StorefrontTestimonial[];
}
