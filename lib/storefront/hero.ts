import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type HeroMediaConfig = {
  media_type: "image" | "video";
  cloudinary_public_id: string | null;
  media_url: string | null;
  poster_public_id: string | null;
  poster_url: string | null;
  alt_text: string | null;
  resource_type?: "image" | "video";
};

export async function getHeroMediaConfig(): Promise<HeroMediaConfig> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "hero_media")
      .maybeSingle();

    if (data?.value && typeof data.value === "object") {
      return data.value as HeroMediaConfig;
    }
  } catch {
    // Fail safely if database table is not deployed yet
  }

  return {
    media_type: "image",
    cloudinary_public_id: null,
    media_url: null,
    poster_public_id: null,
    poster_url: null,
    alt_text: "Namma Ada authentic Kerala handcrafted delicacies",
    resource_type: "image",
  };
}
