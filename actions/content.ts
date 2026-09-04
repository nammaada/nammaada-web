"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import {
  deleteCloudinaryImage,
  deleteCloudinaryMedia,
  uploadCloudinaryImage,
  uploadCloudinaryMedia,
  validateImage,
  validateMedia,
} from "@/lib/cloudinary/server";
import {
  DEFAULT_FROM_OUR_KITCHEN,
  DEFAULT_WHO_WE_ARE,
  FromOurKitchenContent,
  KitchenReel,
  WhoWeAreContent,
  WhoWeAreImage,
} from "@/lib/storefront/content";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

function bool(form: FormData, key: string) {
  return form.get(key) === "on" || form.get(key) === "true";
}

function integer(form: FormData, key: string, fallback = 1) {
  const val = Number.parseInt(text(form, key), 10);
  return Number.isSafeInteger(val) && val >= 0 ? val : fallback;
}

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function ok(path: string, message?: string): never {
  revalidatePath("/");
  revalidatePath(path);
  revalidatePath("/admin/our-story");
  revalidatePath("/admin/who-we-are");
  revalidatePath("/admin/kitchen-reels");
  revalidatePath("/admin/from-our-kitchen");
  if (message) {
    redirect(`${path}?success=${encodeURIComponent(message)}`);
  }
  redirect(path);
}

// ---------------------------------------------------------------------------
// OUR STORY / WHO WE ARE ACTIONS
// ---------------------------------------------------------------------------

async function getRawWhoWeAre(): Promise<WhoWeAreContent> {
  const client = createSupabaseAdminClient();
  const { data } = await client
    .from("site_settings")
    .select("value")
    .eq("key", "content_who_we_are")
    .maybeSingle();

  if (data?.value && typeof data.value === "object") {
    const val = data.value as Partial<WhoWeAreContent>;
    const images = Array.isArray(val.images) ? [...val.images] : [];
    images.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    return {
      label: val.label?.trim() || DEFAULT_WHO_WE_ARE.label,
      heading: val.heading?.trim() || DEFAULT_WHO_WE_ARE.heading,
      description: val.description?.trim() || DEFAULT_WHO_WE_ARE.description,
      buttonText: val.buttonText?.trim() || DEFAULT_WHO_WE_ARE.buttonText,
      buttonUrl: val.buttonUrl?.trim() || DEFAULT_WHO_WE_ARE.buttonUrl,
      images,
      primaryImageId: val.primaryImageId || images.find((i) => i.is_primary)?.id || images[0]?.id || null,
    };
  }

  return { ...DEFAULT_WHO_WE_ARE };
}

export async function saveWhoWeAreContent(form: FormData) {
  await requireAdmin();
  const label = text(form, "label") || DEFAULT_WHO_WE_ARE.label;
  const heading = text(form, "heading") || DEFAULT_WHO_WE_ARE.heading;
  const description = text(form, "description") || DEFAULT_WHO_WE_ARE.description;
  const buttonText = text(form, "button_text") || DEFAULT_WHO_WE_ARE.buttonText;
  const buttonUrl = text(form, "button_url") || DEFAULT_WHO_WE_ARE.buttonUrl;

  const current = await getRawWhoWeAre();
  const updated: WhoWeAreContent = {
    ...current,
    label,
    heading,
    description,
    buttonText,
    buttonUrl,
  };

  const client = createSupabaseAdminClient();
  const { error } = await client.from("site_settings").upsert({
    key: "content_who_we_are",
    value: updated,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    fail("/admin/our-story", "Failed to save Our Story content.");
  }

  ok("/admin/our-story", "Our Story content saved successfully.");
}

export async function uploadWhoWeAreImage(form: FormData) {
  await requireAdmin();
  const file = form.get("image_file");
  const altText = text(form, "alt_text") || "Namma Ada Kerala Delicacy";
  const isPrimary = bool(form, "is_primary");

  if (!(file instanceof File) || file.size === 0) {
    fail("/admin/our-story", "Please select an image file to upload.");
  }

  const validation = validateImage(file);
  if (validation) {
    fail("/admin/our-story", validation);
  }

  const current = await getRawWhoWeAre();
  if (current.images.length >= 3) {
    fail("/admin/our-story", "Maximum 3 images allowed. Please delete or replace an existing image.");
  }

  let uploaded;
  try {
    uploaded = await uploadCloudinaryImage(file);
  } catch {
    fail("/admin/our-story", "Image upload to Cloudinary failed. Check network and try again.");
  }

  const newId = randomUUID();
  const makePrimary = isPrimary || current.images.length === 0;

  const newImage: WhoWeAreImage = {
    id: newId,
    cloudinary_public_id: uploaded.public_id,
    secure_url: uploaded.secure_url,
    alt_text: altText,
    display_order: current.images.length + 1,
    is_primary: makePrimary,
  };

  const updatedImages = current.images.map((img) =>
    makePrimary ? { ...img, is_primary: false } : img
  );
  updatedImages.push(newImage);

  const updated: WhoWeAreContent = {
    ...current,
    images: updatedImages,
    primaryImageId: makePrimary ? newId : current.primaryImageId,
  };

  const client = createSupabaseAdminClient();
  const { error } = await client.from("site_settings").upsert({
    key: "content_who_we_are",
    value: updated,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    fail("/admin/our-story", "Failed to save image record.");
  }

  ok("/admin/our-story", "Image added to Our Story gallery.");
}

export async function updateWhoWeAreImage(form: FormData) {
  await requireAdmin();
  const imageId = text(form, "image_id");
  const altText = text(form, "alt_text");
  const isPrimary = bool(form, "is_primary");
  const order = integer(form, "display_order", 1);
  const file = form.get("image_file");

  if (!imageId) fail("/admin/our-story", "Missing image ID.");

  const current = await getRawWhoWeAre();
  const existingIdx = current.images.findIndex((img) => img.id === imageId);
  if (existingIdx === -1) fail("/admin/our-story", "Image not found.");

  const target = { ...current.images[existingIdx] };

  // If a replacement file was chosen, upload to Cloudinary
  if (file instanceof File && file.size > 0) {
    const validation = validateImage(file);
    if (validation) fail("/admin/our-story", validation);

    try {
      const uploaded = await uploadCloudinaryImage(file);
      if (target.cloudinary_public_id) {
        try {
          await deleteCloudinaryImage(target.cloudinary_public_id);
        } catch {
          // non-fatal
        }
      }
      target.cloudinary_public_id = uploaded.public_id;
      target.secure_url = uploaded.secure_url;
    } catch {
      fail("/admin/our-story", "Replacement image upload failed.");
    }
  }

  target.alt_text = altText || target.alt_text;
  target.display_order = order;

  // Handle primary flag
  if (isPrimary) {
    current.images.forEach((img) => {
      img.is_primary = img.id === imageId;
    });
    target.is_primary = true;
    current.primaryImageId = imageId;
  } else {
    target.is_primary = false;
  }

  current.images[existingIdx] = target;
  current.images.sort((a, b) => a.display_order - b.display_order);

  // If none is primary, ensure first is primary
  if (!current.images.some((i) => i.is_primary) && current.images.length > 0) {
    current.images[0].is_primary = true;
    current.primaryImageId = current.images[0].id;
  }

  const client = createSupabaseAdminClient();
  const { error } = await client.from("site_settings").upsert({
    key: "content_who_we_are",
    value: current,
    updated_at: new Date().toISOString(),
  });

  if (error) fail("/admin/our-story", "Failed to update image.");

  ok("/admin/our-story", "Image updated successfully.");
}

export async function replaceWhoWeAreImage(form: FormData) {
  return updateWhoWeAreImage(form);
}

export async function deleteWhoWeAreImage(form: FormData) {
  await requireAdmin();
  const imageId = text(form, "image_id");
  if (!imageId) fail("/admin/our-story", "Missing image ID.");

  const current = await getRawWhoWeAre();
  const target = current.images.find((img) => img.id === imageId);
  if (!target) fail("/admin/our-story", "Image not found.");

  try {
    if (target.cloudinary_public_id) {
      await deleteCloudinaryImage(target.cloudinary_public_id);
    }
  } catch {
    // Non-fatal
  }

  const remaining = current.images.filter((img) => img.id !== imageId);
  remaining.forEach((img, idx) => {
    img.display_order = idx + 1;
  });

  if (remaining.length > 0 && (!remaining.some((i) => i.is_primary) || target.is_primary)) {
    remaining[0].is_primary = true;
  }

  const updated: WhoWeAreContent = {
    ...current,
    images: remaining,
    primaryImageId: remaining.find((i) => i.is_primary)?.id || null,
  };

  const client = createSupabaseAdminClient();
  const { error } = await client.from("site_settings").upsert({
    key: "content_who_we_are",
    value: updated,
    updated_at: new Date().toISOString(),
  });

  if (error) fail("/admin/our-story", "Failed to delete image.");

  ok("/admin/our-story", "Image removed from Our Story gallery.");
}

export async function setPrimaryWhoWeAreImage(form: FormData) {
  await requireAdmin();
  const imageId = text(form, "image_id");
  if (!imageId) fail("/admin/our-story", "Missing image ID.");

  const current = await getRawWhoWeAre();
  let found = false;
  current.images.forEach((img) => {
    if (img.id === imageId) {
      img.is_primary = true;
      found = true;
    } else {
      img.is_primary = false;
    }
  });

  if (!found) fail("/admin/our-story", "Image not found.");

  const updated: WhoWeAreContent = {
    ...current,
    primaryImageId: imageId,
  };

  const client = createSupabaseAdminClient();
  const { error } = await client.from("site_settings").upsert({
    key: "content_who_we_are",
    value: updated,
    updated_at: new Date().toISOString(),
  });

  if (error) fail("/admin/our-story", "Failed to update primary image.");

  ok("/admin/our-story", "Primary image updated.");
}

export async function reorderWhoWeAreImages(form: FormData) {
  await requireAdmin();
  const imageId = text(form, "image_id");
  const direction = text(form, "direction");

  const current = await getRawWhoWeAre();
  const index = current.images.findIndex((img) => img.id === imageId);
  if (index === -1) fail("/admin/our-story", "Image not found.");

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= current.images.length) {
    ok("/admin/our-story");
  }

  const [item] = current.images.splice(index, 1);
  current.images.splice(targetIndex, 0, item);

  current.images.forEach((img, idx) => {
    img.display_order = idx + 1;
  });

  const client = createSupabaseAdminClient();
  const { error } = await client.from("site_settings").upsert({
    key: "content_who_we_are",
    value: current,
    updated_at: new Date().toISOString(),
  });

  if (error) fail("/admin/our-story", "Failed to reorder images.");

  ok("/admin/our-story", "Image order updated.");
}

export async function updateWhoWeAreImageAlt(form: FormData) {
  await requireAdmin();
  const imageId = text(form, "image_id");
  const altText = text(form, "alt_text");

  const current = await getRawWhoWeAre();
  const image = current.images.find((img) => img.id === imageId);
  if (!image) fail("/admin/our-story", "Image not found.");

  image.alt_text = altText || "Namma Ada Kerala Delicacy";

  const client = createSupabaseAdminClient();
  const { error } = await client.from("site_settings").upsert({
    key: "content_who_we_are",
    value: current,
    updated_at: new Date().toISOString(),
  });

  if (error) fail("/admin/our-story", "Failed to update alt text.");

  ok("/admin/our-story", "Alt text updated.");
}

// ---------------------------------------------------------------------------
// KITCHEN REELS (MULTI-REEL STOREFRONT SYSTEM)
// ---------------------------------------------------------------------------

async function getRawFromOurKitchen(): Promise<FromOurKitchenContent> {
  const client = createSupabaseAdminClient();
  const { data } = await client
    .from("site_settings")
    .select("value")
    .eq("key", "content_from_our_kitchen")
    .maybeSingle();

  if (data?.value && typeof data.value === "object") {
    const val = data.value as Partial<FromOurKitchenContent>;
    let reels: KitchenReel[] = Array.isArray(val.reels) ? [...val.reels] : [];

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

  return { ...DEFAULT_FROM_OUR_KITCHEN };
}

export async function saveFromOurKitchenContent(form: FormData) {
  await requireAdmin();
  const label = text(form, "label") || DEFAULT_FROM_OUR_KITCHEN.label;
  const heading = text(form, "heading") || DEFAULT_FROM_OUR_KITCHEN.heading;
  const description = text(form, "description") || DEFAULT_FROM_OUR_KITCHEN.description;
  const instagramButtonText = text(form, "instagram_button_text") || DEFAULT_FROM_OUR_KITCHEN.instagramButtonText;
  const instagramUrl = text(form, "instagram_url") || DEFAULT_FROM_OUR_KITCHEN.instagramUrl;

  const current = await getRawFromOurKitchen();
  const updated: FromOurKitchenContent = {
    ...current,
    label,
    heading,
    description,
    instagramButtonText,
    instagramUrl,
  };

  const client = createSupabaseAdminClient();
  const { error } = await client.from("site_settings").upsert({
    key: "content_from_our_kitchen",
    value: updated,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    fail("/admin/kitchen-reels", "Failed to save Kitchen Reels section content.");
  }

  ok("/admin/kitchen-reels", "Kitchen Reels section saved successfully.");
}

export async function createKitchenReel(form: FormData) {
  await requireAdmin();
  const file = form.get("video_file");
  const altText = text(form, "alt_text") || "Namma Ada kitchen preparation reel";
  const instagramUrl = text(form, "instagram_url") || "https://www.instagram.com/namma_ada/";
  const displayOrder = integer(form, "display_order", 1);
  const isPublished = bool(form, "is_published");

  if (!(file instanceof File) || file.size === 0) {
    fail("/admin/kitchen-reels", "Please select a reel video file to upload.");
  }

  const validation = validateMedia(file);
  if (validation) {
    fail("/admin/kitchen-reels", validation);
  }

  let uploaded;
  try {
    uploaded = await uploadCloudinaryMedia(file, "video");
  } catch {
    fail("/admin/kitchen-reels", "Reel video upload to Cloudinary failed. Check file size (under 25MB).");
  }

  const current = await getRawFromOurKitchen();
  const newReel: KitchenReel = {
    id: randomUUID(),
    video_url: uploaded.secure_url,
    cloudinary_public_id: uploaded.public_id,
    alt_text: altText,
    instagram_url: instagramUrl,
    display_order: displayOrder,
    is_published: isPublished,
    created_at: new Date().toISOString(),
  };

  const reels = [...current.reels, newReel];
  reels.sort((a, b) => a.display_order - b.display_order);

  const updated: FromOurKitchenContent = {
    ...current,
    reels,
    reelVideoUrl: reels[0]?.video_url || null,
    reelVideoPublicId: reels[0]?.cloudinary_public_id || null,
    reelVideoAltText: reels[0]?.alt_text || null,
  };

  const client = createSupabaseAdminClient();
  const { error } = await client.from("site_settings").upsert({
    key: "content_from_our_kitchen",
    value: updated,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    fail("/admin/kitchen-reels", "Failed to save new reel.");
  }

  ok("/admin/kitchen-reels", "Reel video added successfully.");
}

export async function updateKitchenReel(form: FormData) {
  await requireAdmin();
  const reelId = text(form, "reel_id");
  const altText = text(form, "alt_text");
  const instagramUrl = text(form, "instagram_url");
  const displayOrder = integer(form, "display_order", 1);
  const isPublished = bool(form, "is_published");
  const file = form.get("video_file");

  if (!reelId) fail("/admin/kitchen-reels", "Missing reel ID.");

  const current = await getRawFromOurKitchen();
  const idx = current.reels.findIndex((r) => r.id === reelId);
  if (idx === -1) fail("/admin/kitchen-reels", "Reel not found.");

  const reel = { ...current.reels[idx] };

  if (file instanceof File && file.size > 0) {
    const validation = validateMedia(file);
    if (validation) fail("/admin/kitchen-reels", validation);

    try {
      const uploaded = await uploadCloudinaryMedia(file, "video");
      if (reel.cloudinary_public_id) {
        try {
          await deleteCloudinaryMedia(reel.cloudinary_public_id, "video");
        } catch {
          // non-fatal
        }
      }
      reel.cloudinary_public_id = uploaded.public_id;
      reel.video_url = uploaded.secure_url;
    } catch {
      fail("/admin/kitchen-reels", "Video replacement upload failed.");
    }
  }

  reel.alt_text = altText || reel.alt_text;
  reel.instagram_url = instagramUrl || reel.instagram_url;
  reel.display_order = displayOrder;
  reel.is_published = isPublished;

  current.reels[idx] = reel;
  current.reels.sort((a, b) => a.display_order - b.display_order);

  const updated: FromOurKitchenContent = {
    ...current,
    reelVideoUrl: current.reels[0]?.video_url || null,
    reelVideoPublicId: current.reels[0]?.cloudinary_public_id || null,
    reelVideoAltText: current.reels[0]?.alt_text || null,
  };

  const client = createSupabaseAdminClient();
  const { error } = await client.from("site_settings").upsert({
    key: "content_from_our_kitchen",
    value: updated,
    updated_at: new Date().toISOString(),
  });

  if (error) fail("/admin/kitchen-reels", "Failed to update reel.");

  ok("/admin/kitchen-reels", "Reel updated successfully.");
}

export async function deleteKitchenReel(form: FormData) {
  await requireAdmin();
  const reelId = text(form, "reel_id");
  if (!reelId) fail("/admin/kitchen-reels", "Missing reel ID.");

  const current = await getRawFromOurKitchen();
  const target = current.reels.find((r) => r.id === reelId);
  if (!target) fail("/admin/kitchen-reels", "Reel not found.");

  if (target.cloudinary_public_id) {
    try {
      await deleteCloudinaryMedia(target.cloudinary_public_id, "video");
    } catch {
      // non-fatal
    }
  }

  const remaining = current.reels.filter((r) => r.id !== reelId);
  remaining.forEach((r, idx) => {
    r.display_order = idx + 1;
  });

  const updated: FromOurKitchenContent = {
    ...current,
    reels: remaining,
    reelVideoUrl: remaining[0]?.video_url || null,
    reelVideoPublicId: remaining[0]?.cloudinary_public_id || null,
    reelVideoAltText: remaining[0]?.alt_text || null,
  };

  const client = createSupabaseAdminClient();
  const { error } = await client.from("site_settings").upsert({
    key: "content_from_our_kitchen",
    value: updated,
    updated_at: new Date().toISOString(),
  });

  if (error) fail("/admin/kitchen-reels", "Failed to delete reel.");

  ok("/admin/kitchen-reels", "Reel deleted successfully.");
}

// Backward-compatibility aliases
export async function uploadReelVideo(form: FormData) {
  return createKitchenReel(form);
}

export async function deleteReelVideo() {
  const current = await getRawFromOurKitchen();
  if (current.reels.length > 0) {
    const fd = new FormData();
    fd.append("reel_id", current.reels[0].id);
    return deleteKitchenReel(fd);
  }
}
