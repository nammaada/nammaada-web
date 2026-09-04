import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type StorefrontTestimonial = {
  id: string;
  display_name: string;
  location: string | null;
  content: string;
};

export async function getTestimonials(): Promise<StorefrontTestimonial[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("id,display_name,location,content")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (!error && data) {
      return data as StorefrontTestimonial[];
    }
  } catch {
    // fallback
  }

  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("testimonials")
      .select("id,display_name,location,content")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (!error && data) {
      return data as StorefrontTestimonial[];
    }
  } catch {
    // ignore
  }

  return [];
}

