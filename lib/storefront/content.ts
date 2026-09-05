import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type WhoWeAreImage = {
  id: string;
  cloudinary_public_id: string;
  secure_url: string;
  alt_text: string;
  display_order: number;
  is_primary: boolean;
};

export type WhoWeAreContent = {
  label: string;
  heading: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  images: WhoWeAreImage[];
  primaryImageId?: string | null;
};

export type KitchenReel = {
  id: string;
  video_url: string;
  cloudinary_public_id: string;
  alt_text: string;
  instagram_url: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
};

export type FromOurKitchenContent = {
  label: string;
  heading: string;
  description: string;
  instagramButtonText: string;
  instagramUrl: string;
  // Legacy single video fields (kept for backward compatibility)
  reelVideoUrl: string | null;
  reelVideoPublicId: string | null;
  reelVideoAltText: string | null;
  // Multi-reel system
  reels: KitchenReel[];
};

export const DEFAULT_WHO_WE_ARE: WhoWeAreContent = {
  label: "WHO WE ARE",
  heading: "A little taste of home, made with a whole lot of love.",
  description:
    "Namma Ada is a Bangalore-based Kerala delicacy brand inspired by recipes passed down through generations. We bring Kerala's timeless taste to your table through fresh, handcrafted delicacies made with authentic flavours and a whole lot of love.",
  buttonText: "Read our story",
  buttonUrl: "/about",
  images: [],
  primaryImageId: null,
};

export const DEFAULT_FROM_OUR_KITCHEN: FromOurKitchenContent = {
  label: "FROM OUR KITCHEN",
  heading: "A glimpse of what's being made.",
  description: "A curated look at Namma Ada's kitchen will be shared here soon.",
  instagramButtonText: "Follow us on Instagram",
  instagramUrl: "https://www.instagram.com/namma_ada/",
  reelVideoUrl: null,
  reelVideoPublicId: null,
  reelVideoAltText: null,
  reels: [],
};

export async function getWhoWeAreContent(): Promise<WhoWeAreContent> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "content_who_we_are")
      .maybeSingle();

    if (!error && data?.value && typeof data.value === "object") {
      const val = data.value as Partial<WhoWeAreContent>;
      const images = Array.isArray(val.images) ? val.images : [];
      // Sort images by display_order
      images.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

      return {
        label: val.label?.trim() || DEFAULT_WHO_WE_ARE.label,
        heading: val.heading?.trim() || DEFAULT_WHO_WE_ARE.heading,
        description: val.description?.trim() || DEFAULT_WHO_WE_ARE.description,
        buttonText: val.buttonText?.trim() || DEFAULT_WHO_WE_ARE.buttonText,
        buttonUrl: val.buttonUrl?.trim() || DEFAULT_WHO_WE_ARE.buttonUrl,
        images,
        primaryImageId: val.primaryImageId || images.find((img) => img.is_primary)?.id || images[0]?.id || null,
      };
    }
  } catch {
    // Fail safely
  }

  return DEFAULT_WHO_WE_ARE;
}

export async function getFromOurKitchenContent(): Promise<FromOurKitchenContent> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "content_from_our_kitchen")
      .maybeSingle();

    if (!error && data?.value && typeof data.value === "object") {
      const val = data.value as Partial<FromOurKitchenContent>;
      let reels: KitchenReel[] = Array.isArray(val.reels) ? [...val.reels] : [];

      // If no reels array yet, but legacy single reel exists, convert it
      if (reels.length === 0 && val.reelVideoUrl) {
        reels.push({
          id: "legacy-reel-1",
          video_url: val.reelVideoUrl,
          cloudinary_public_id: val.reelVideoPublicId || "",
          alt_text: val.reelVideoAltText || "Namma Ada Kitchen Reel",
          instagram_url: val.instagramUrl || DEFAULT_FROM_OUR_KITCHEN.instagramUrl,
          display_order: 1,
          is_published: true,
          created_at: new Date().toISOString(),
        });
      }

      reels.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

      return {
        label: val.label?.trim() || DEFAULT_FROM_OUR_KITCHEN.label,
        heading: val.heading?.trim() || DEFAULT_FROM_OUR_KITCHEN.heading,
        description: val.description?.trim() || DEFAULT_FROM_OUR_KITCHEN.description,
        instagramButtonText: val.instagramButtonText?.trim() || DEFAULT_FROM_OUR_KITCHEN.instagramButtonText,
        instagramUrl: val.instagramUrl?.trim() || DEFAULT_FROM_OUR_KITCHEN.instagramUrl,
        reelVideoUrl: val.reelVideoUrl || reels[0]?.video_url || null,
        reelVideoPublicId: val.reelVideoPublicId || reels[0]?.cloudinary_public_id || null,
        reelVideoAltText: val.reelVideoAltText || reels[0]?.alt_text || null,
        reels,
      };
    }
  } catch {
    // Fail safely
  }

  return DEFAULT_FROM_OUR_KITCHEN;
}
