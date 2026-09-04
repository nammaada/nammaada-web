import "server-only";

import { getHeroImageUrl, getHeroVideoPosterUrl, getHeroVideoUrl } from "@/lib/cloudinary/delivery";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type HeroBanner = {
  id: string;
  cloudinary_public_id: string;
  poster_public_id: string | null;
  media_type: "image" | "video";
  eyebrow: string;
  headline: string;
  description: string;
  primary_cta_label: string;
  primary_cta_href: string;
  secondary_cta_label: string | null;
  secondary_cta_href: string | null;
  is_secondary_cta_enabled: boolean;
  display_order: number;
  is_active: boolean;
  alt_text: string | null;
  mobile_headline: string | null;
  mobile_description: string | null;
  mobile_media_public_id: string | null;
  mobile_media_type: "image" | "video" | null;
  // Dynamic Cloudinary Delivery URLs generated at runtime from public IDs
  media_url: string;
  poster_url: string | null;
  mobile_media_url: string | null;
};

export type HeroMediaConfig = {
  media_type: "image" | "video";
  cloudinary_public_id: string | null;
  media_url: string | null;
  poster_public_id: string | null;
  poster_url: string | null;
  alt_text: string | null;
  resource_type?: "image" | "video";
};

export function formatBannerWithUrls(row: Record<string, any>): HeroBanner {
  const isVideo = row.media_type === "video";
  const media_url = isVideo
    ? getHeroVideoUrl(row.cloudinary_public_id)
    : getHeroImageUrl(row.cloudinary_public_id, "desktop");

  // If banner is a video and has no distinct poster image uploaded, extract poster frame directly from the video!
  const isPosterFromVideo = isVideo && (!row.poster_public_id || row.poster_public_id === row.cloudinary_public_id);
  const poster_url = isPosterFromVideo
    ? getHeroVideoPosterUrl(row.cloudinary_public_id, "desktop")
    : row.poster_public_id
    ? getHeroImageUrl(row.poster_public_id, "desktop")
    : null;

  const mobile_media_url = row.mobile_media_public_id
    ? row.mobile_media_type === "video"
      ? getHeroVideoUrl(row.mobile_media_public_id)
      : getHeroImageUrl(row.mobile_media_public_id, "mobile")
    : null;

  return {
    id: row.id,
    cloudinary_public_id: row.cloudinary_public_id,
    poster_public_id: row.poster_public_id || null,
    media_type: isVideo ? "video" : "image",
    eyebrow: row.eyebrow || "AUTHENTIC KERALA FLAVOURS",
    headline: row.headline || "Soul of Kerala, served with heart.",
    description:
      row.description ||
      "At Namma Ada, we bring the soul of Kerala into the homes of Bangalore. Every delicacy is handcrafted with tradition and a whole lot of love.",
    primary_cta_label: row.primary_cta_label || "Explore Now",
    primary_cta_href: row.primary_cta_href || "/products",
    secondary_cta_label: row.secondary_cta_label || null,
    secondary_cta_href: row.secondary_cta_href || null,
    is_secondary_cta_enabled: Boolean(row.is_secondary_cta_enabled),
    display_order: Number(row.display_order ?? 0),
    is_active: Boolean(row.is_active),
    alt_text: row.alt_text || null,
    mobile_headline: row.mobile_headline || null,
    mobile_description: row.mobile_description || null,
    mobile_media_public_id: row.mobile_media_public_id || null,
    mobile_media_type: row.mobile_media_type || null,
    media_url,
    poster_url,
    mobile_media_url,
  };
}

export async function getActiveHeroBanners(): Promise<HeroBanner[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("hero_banners")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map(formatBannerWithUrls);
    }
  } catch {
    // Fail safely if database table is not deployed yet
  }

  return [];
}

export async function getAdminHeroBanners(): Promise<HeroBanner[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("hero_banners")
      .select("*")
      .order("display_order", { ascending: true });

    if (!error && data) {
      return data.map(formatBannerWithUrls);
    }
  } catch {
    // Fail safely if database table is not deployed yet
  }

  return [];
}

export async function getHeroBannerById(id: string): Promise<HeroBanner | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("hero_banners")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      return formatBannerWithUrls(data);
    }
  } catch {
    // Fail safely
  }

  return null;
}

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
    // Fail safely
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

