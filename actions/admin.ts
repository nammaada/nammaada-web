"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { deleteCloudinaryImage, deleteCloudinaryMedia, uploadCloudinaryImage, uploadCloudinaryMedia, validateImage, validateMedia } from "@/lib/cloudinary/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function text(form: FormData, key: string) { return String(form.get(key) ?? "").trim(); }
function bool(form: FormData, key: string) { return form.get(key) === "on" || form.get(key) === "true"; }
function integer(form: FormData, key: string, fallback = 0) { const value = Number.parseInt(text(form, key), 10); return Number.isSafeInteger(value) && value >= 0 ? value : fallback; }
function uuid(form: FormData, key: string) { const value = text(form, key); return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : null; }
function moneyPaise(form: FormData, key: string) {
  const raw = text(form, key).replace(/,/g, "").trim();
  if (!raw) return 0;
  const rupees = Number.parseFloat(raw);
  if (Number.isNaN(rupees) || rupees < 0) return -1;
  return Math.round(rupees * 100);
}
function fail(path: string, message: string): never { redirect(`${path}?error=${encodeURIComponent(message)}`); }
function ok(path: string): never { revalidatePath(path); redirect(path); }
function required(form: FormData, key: string, label: string, max: number, failPath = "/admin") { const value = text(form, key); if (!value || value.length > max) return fail(failPath, `${label} is required and must be ${max} characters or fewer.`); return value; }
function dbMessage() { return "Unable to save this change. Check the values and try again."; }

export async function saveCategory(form: FormData) { await requireAdmin(); const id = uuid(form, "id"); const name = required(form, "name", "Name", 120); const slug = text(form, "slug").toLowerCase(); if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fail("/admin/categories", "Enter a valid lowercase slug."); const client = createSupabaseAdminClient(); const values = { name, slug, description: text(form, "description") || null, is_active: bool(form, "is_active"), display_order: integer(form, "display_order") }; const result = id ? await client.from("categories").update(values).eq("id", id) : await client.from("categories").insert(values); if (result.error) fail("/admin/categories", dbMessage()); ok("/admin/categories"); }
export async function deleteCategory(form: FormData) { await requireAdmin(); const id = uuid(form, "id"); if (!id) fail("/admin/categories", "Invalid category."); const client = createSupabaseAdminClient(); const result = await client.from("categories").delete().eq("id", id); if (result.error) fail("/admin/categories", "This category cannot be deleted while products still reference it."); ok("/admin/categories"); }

export async function saveProduct(form: FormData) {
  await requireAdmin();
  const id = uuid(form, "id");
  const failPath = id ? `/admin/products/${id}` : "/admin/products/new";
  const name = required(form, "name", "Name", 160, failPath);
  const slug = text(form, "slug").toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fail(failPath, "Enter a valid lowercase slug.");
  const price = moneyPaise(form, "price");
  if (price < 0) fail(failPath, "Enter a valid INR price.");
  const client = createSupabaseAdminClient();
  const values = {
    category_id: uuid(form, "category_id"),
    name,
    slug,
    short_description: text(form, "short_description") || null,
    description: text(form, "description") || null,
    price_paise: price,
    stock_quantity: integer(form, "stock_quantity"),
    delivery_scope: text(form, "delivery_scope") === "bangalore_only" ? "bangalore_only" : "all_india",
    is_free_shipping: bool(form, "is_free_shipping"),
    is_active: bool(form, "is_active"),
    is_featured: bool(form, "is_featured"),
    display_order: integer(form, "display_order"),
  };

  let newId: string | null = null;
  if (id) {
    const result = await client.from("products").update(values).eq("id", id);
    if (result.error) fail(failPath, dbMessage());
  } else {
    const result = await client.from("products").insert(values).select("id").single();
    if (result.error) fail(failPath, dbMessage());
    newId = (result.data as { id: string } | null)?.id ?? null;
  }

  const targetProductId = id || newId;

  // If an image file was provided, upload to Cloudinary & insert into product_images
  const file = form.get("image_file") || form.get("file");
  if (targetProductId && file instanceof File && file.size > 0) {
    const alt = text(form, "image_alt") || text(form, "alt_text") || name;
    const validation = validateImage(file);
    if (validation) fail(`/admin/products/${targetProductId}`, validation);
    try {
      const uploaded = await uploadCloudinaryImage(file);
      if (uploaded.width > 6000 || uploaded.height > 6000) {
        await deleteCloudinaryImage(uploaded.public_id);
        fail(`/admin/products/${targetProductId}`, "Images must not exceed 6000 pixels on either side.");
      }
      const { count } = await client
        .from("product_images")
        .select("id", { count: "exact", head: true })
        .eq("product_id", targetProductId);
      const imgResult = await client.from("product_images").insert({
        product_id: targetProductId,
        cloudinary_public_id: uploaded.public_id,
        secure_url: uploaded.secure_url,
        alt_text: alt,
        display_order: count ?? 0,
        is_primary: (count ?? 0) === 0,
      });
      if (imgResult.error) {
        await deleteCloudinaryImage(uploaded.public_id);
      }
    } catch (err) {
      if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
      fail(`/admin/products/${targetProductId}`, "Image upload failed. The product was created, please upload the image from the imagery section.");
    }
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  if (targetProductId) {
    revalidatePath(`/admin/products/${targetProductId}`);
    ok(`/admin/products/${targetProductId}`);
  } else {
    ok("/admin/products");
  }
}
export async function deleteProduct(form: FormData) { await requireAdmin(); const id = uuid(form, "id"); if (!id) fail("/admin/products", "Invalid product."); const result = await createSupabaseAdminClient().from("products").delete().eq("id", id); if (result.error) fail("/admin/products", "This product cannot be deleted while related records reference it."); ok("/admin/products"); }
export async function saveVariant(form: FormData) { await requireAdmin(); const id = uuid(form, "id"); const productId = uuid(form, "product_id"); const name = required(form, "name", "Variant name", 120); const price = moneyPaise(form, "price"); if (!productId || price < 0) fail(`/admin/products/${productId ?? ""}`, "Enter valid variant values."); const values = { product_id: productId, name, sku: text(form, "sku") || null, price_paise: price, stock_quantity: integer(form, "stock_quantity"), is_active: bool(form, "is_active"), display_order: integer(form, "display_order") }; const client = createSupabaseAdminClient(); const result = id ? await client.from("product_variants").update(values).eq("id", id) : await client.from("product_variants").insert(values); if (result.error) fail(`/admin/products/${productId}`, "Unable to save variant. Check that its SKU and name are unique."); ok(`/admin/products/${productId}`); }
export async function deleteVariant(form: FormData) { await requireAdmin(); const productId = uuid(form, "product_id"); const id = uuid(form, "id"); if (!productId || !id) fail("/admin/products", "Invalid variant."); const result = await createSupabaseAdminClient().from("product_variants").delete().eq("id", id); if (result.error) fail(`/admin/products/${productId}`, "Unable to remove this variant."); ok(`/admin/products/${productId}`); }

export async function saveShippingRule(form: FormData) { await requireAdmin(); const id = uuid(form, "id"); const stateCode = text(form, "state_code").toUpperCase(); const stateName = required(form, "state_name", "State name", 100); const charge = moneyPaise(form, "charge"); if (!/^[A-Z]{2,3}$/.test(stateCode) || charge < 0) fail("/admin/shipping", "Enter a valid state code and INR charge."); const values = { state_code: stateCode, state_name: stateName, charge_paise: charge, is_active: bool(form, "is_active") }; const client = createSupabaseAdminClient(); const result = id ? await client.from("shipping_rules").update(values).eq("id", id) : await client.from("shipping_rules").insert(values); if (result.error) fail("/admin/shipping", "Unable to save shipping rule. State codes must be unique."); ok("/admin/shipping"); }
export async function deleteShippingRule(form: FormData) { await requireAdmin(); const id = uuid(form, "id"); if (!id) fail("/admin/shipping", "Invalid rule."); const result = await createSupabaseAdminClient().from("shipping_rules").delete().eq("id", id); if (result.error) fail("/admin/shipping", "Unable to delete this shipping rule."); ok("/admin/shipping"); }

export async function saveCourier(form: FormData) { await requireAdmin(); const id = uuid(form, "id"); const name = required(form, "name", "Name", 120); const template = text(form, "tracking_url_template"); if (template && !template.startsWith("https://")) fail("/admin/couriers", "Tracking URL templates must use HTTPS."); const values = { name, tracking_url_template: template || null, is_active: bool(form, "is_active") }; const client = createSupabaseAdminClient(); const result = id ? await client.from("courier_partners").update(values).eq("id", id) : await client.from("courier_partners").insert(values); if (result.error) fail("/admin/couriers", "Unable to save courier partner."); ok("/admin/couriers"); }
export async function deleteCourier(form: FormData) { await requireAdmin(); const id = uuid(form, "id"); if (!id) fail("/admin/couriers", "Invalid courier."); const result = await createSupabaseAdminClient().from("courier_partners").delete().eq("id", id); if (result.error) fail("/admin/couriers", "This courier cannot be deleted while orders reference it."); ok("/admin/couriers"); }

export async function saveTestimonial(form: FormData) {
  await requireAdmin();
  const id = uuid(form, "id");
  const displayName = required(form, "display_name", "Name", 120, "/admin/testimonials");
  const content = required(form, "content", "Content", 1000, "/admin/testimonials");
  const values = {
    display_name: displayName,
    location: text(form, "location") || null,
    content,
    is_active: bool(form, "is_active"),
    display_order: integer(form, "display_order"),
    updated_at: new Date().toISOString()
  };
  const client = createSupabaseAdminClient();
  const result = id
    ? await client.from("testimonials").update(values).eq("id", id)
    : await client.from("testimonials").insert(values);
  if (result.error) fail("/admin/testimonials", dbMessage());
  revalidatePath("/");
  ok("/admin/testimonials");
}

export async function deleteTestimonial(form: FormData) {
  await requireAdmin();
  const id = uuid(form, "id");
  if (!id) fail("/admin/testimonials", "Invalid testimonial.");
  const result = await createSupabaseAdminClient().from("testimonials").delete().eq("id", id);
  if (result.error) fail("/admin/testimonials", "Unable to delete testimonial.");
  revalidatePath("/");
  ok("/admin/testimonials");
}

export async function toggleTestimonialActive(form: FormData) {
  await requireAdmin();
  const id = uuid(form, "id");
  const isActive = bool(form, "is_active");
  if (!id) fail("/admin/testimonials", "Invalid testimonial.");

  const result = await createSupabaseAdminClient()
    .from("testimonials")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (result.error) fail("/admin/testimonials", "Unable to update testimonial status.");

  revalidatePath("/");
  ok("/admin/testimonials");
}

export async function moveTestimonial(form: FormData) {
  await requireAdmin();
  const id = uuid(form, "id");
  const direction = text(form, "direction");
  if (!id || !["up", "down"].includes(direction)) fail("/admin/testimonials", "Invalid testimonial order.");

  const client = createSupabaseAdminClient();
  const { data: current } = await client
    .from("testimonials")
    .select("id,display_order")
    .eq("id", id)
    .maybeSingle();
  if (!current) fail("/admin/testimonials", "Testimonial not found.");

  const query = direction === "up"
    ? client.from("testimonials").select("id,display_order").lt("display_order", current.display_order).order("display_order", { ascending: false }).limit(1)
    : client.from("testimonials").select("id,display_order").gt("display_order", current.display_order).order("display_order", { ascending: true }).limit(1);

  const { data: sibling } = await query.maybeSingle();
  if (!sibling) ok("/admin/testimonials");

  const first = await client.from("testimonials").update({ display_order: -1 }).eq("id", current.id);
  const second = await client.from("testimonials").update({ display_order: current.display_order }).eq("id", sibling.id);
  const third = await client.from("testimonials").update({ display_order: sibling.display_order }).eq("id", current.id);

  if (first.error || second.error || third.error) fail("/admin/testimonials", "Unable to reorder testimonial.");

  revalidatePath("/");
  ok("/admin/testimonials");
}

export async function updateOrder(form: FormData) { await requireAdmin(); const id = uuid(form, "id"); const status = text(form, "order_status"); const allowed = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"]; if (!id || !allowed.includes(status)) fail("/admin/orders", "Invalid order status."); const values = { order_status: status }; const result = await createSupabaseAdminClient().from("orders").update(values).eq("id", id); if (result.error) fail("/admin/orders", "Unable to update order status."); ok("/admin/orders"); }
export async function updateEnquiry(form: FormData) { await requireAdmin(); const id = uuid(form, "id"); const status = text(form, "status"); const allowed = ["new", "in_progress", "resolved", "closed"]; if (!id || !allowed.includes(status)) fail("/admin/enquiries", "Invalid enquiry status."); const result = await createSupabaseAdminClient().from("bulk_enquiries").update({ status }).eq("id", id); if (result.error) fail("/admin/enquiries", "Unable to update enquiry."); ok("/admin/enquiries"); }

export async function uploadProductImage(form: FormData) { await requireAdmin(); const productId = uuid(form, "product_id"); const file = form.get("file"); const alt = text(form, "alt_text"); if (!productId || !(file instanceof File) || !file.size || !alt || alt.length > 240) fail(`/admin/products/${productId ?? ""}`, "Choose an image and provide meaningful alt text."); const validation = validateImage(file); if (validation) fail(`/admin/products/${productId}`, validation); try { const uploaded = await uploadCloudinaryImage(file); if (uploaded.width > 6000 || uploaded.height > 6000) { await deleteCloudinaryImage(uploaded.public_id); fail(`/admin/products/${productId}`, "Images must not exceed 6000 pixels on either side."); } const client = createSupabaseAdminClient(); const { count } = await client.from("product_images").select("id", { count: "exact", head: true }).eq("product_id", productId); const result = await client.from("product_images").insert({ product_id: productId, cloudinary_public_id: uploaded.public_id, secure_url: uploaded.secure_url, alt_text: alt, display_order: count ?? 0, is_primary: (count ?? 0) === 0 }); if (result.error) { await deleteCloudinaryImage(uploaded.public_id); fail(`/admin/products/${productId}`, "Image metadata could not be saved."); } } catch { fail(`/admin/products/${productId}`, "Image upload failed. Please try again."); } ok(`/admin/products/${productId}`); }
export async function deleteProductImage(form: FormData) { await requireAdmin(); const productId = uuid(form, "product_id"); const id = uuid(form, "id"); const publicId = text(form, "public_id"); if (!productId || !id || !publicId) fail("/admin/products", "Invalid image."); try { await deleteCloudinaryImage(publicId); const result = await createSupabaseAdminClient().from("product_images").delete().eq("id", id).eq("product_id", productId); if (result.error) fail(`/admin/products/${productId}`, "Image metadata could not be deleted."); } catch { fail(`/admin/products/${productId}`, "Image deletion failed. Please try again."); } ok(`/admin/products/${productId}`); }
export async function setPrimaryImage(form: FormData) { await requireAdmin(); const productId = uuid(form, "product_id"); const id = uuid(form, "id"); if (!productId || !id) fail("/admin/products", "Invalid image."); const client = createSupabaseAdminClient(); const clear = await client.from("product_images").update({ is_primary: false }).eq("product_id", productId); const set = await client.from("product_images").update({ is_primary: true }).eq("id", id).eq("product_id", productId); if (clear.error || set.error) fail(`/admin/products/${productId}`, "Unable to update primary image."); ok(`/admin/products/${productId}`); }
export async function updateProductImage(form: FormData) { await requireAdmin(); const productId = uuid(form, "product_id"); const id = uuid(form, "id"); const alt = text(form, "alt_text"); if (!productId || !id || !alt || alt.length > 240) fail(`/admin/products/${productId ?? ""}`, "Provide meaningful alt text."); const displayOrder = integer(form, "display_order"); const result = await createSupabaseAdminClient().from("product_images").update({ alt_text: alt, display_order: displayOrder }).eq("id", id).eq("product_id", productId); if (result.error) fail(`/admin/products/${productId}`, "Unable to update image details."); ok(`/admin/products/${productId}`); }
export async function moveProductImage(form: FormData) { await requireAdmin(); const productId = uuid(form, "product_id"); const id = uuid(form, "id"); const direction = text(form, "direction"); if (!productId || !id || !["up", "down"].includes(direction)) fail(`/admin/products/${productId ?? ""}`, "Invalid image order."); const client = createSupabaseAdminClient(); const { data: current } = await client.from("product_images").select("id,display_order").eq("id", id).eq("product_id", productId).maybeSingle(); if (!current) fail(`/admin/products/${productId}`, "The image could not be found."); const query = direction === "up" ? client.from("product_images").select("id,display_order").eq("product_id", productId).lt("display_order", current.display_order).order("display_order", { ascending: false }).limit(1) : client.from("product_images").select("id,display_order").eq("product_id", productId).gt("display_order", current.display_order).order("display_order", { ascending: true }).limit(1); const { data: sibling } = await query.maybeSingle(); if (!sibling) ok(`/admin/products/${productId}`); const first = await client.from("product_images").update({ display_order: -1 }).eq("id", current.id); const second = await client.from("product_images").update({ display_order: current.display_order }).eq("id", sibling.id); const third = await client.from("product_images").update({ display_order: sibling.display_order }).eq("id", current.id); if (first.error || second.error || third.error) fail(`/admin/products/${productId}`, "Unable to reorder image."); ok(`/admin/products/${productId}`); }
export async function replaceProductImage(form: FormData) { await requireAdmin(); const productId = uuid(form, "product_id"); const id = uuid(form, "id"); const file = form.get("file"); if (!productId || !id || !(file instanceof File) || !file.size) fail(`/admin/products/${productId ?? ""}`, "Choose a replacement image."); const validation = validateImage(file); if (validation) fail(`/admin/products/${productId}`, validation); const client = createSupabaseAdminClient(); const { data: existing, error: lookupError } = await client.from("product_images").select("cloudinary_public_id").eq("id", id).eq("product_id", productId).maybeSingle(); if (lookupError || !existing) fail(`/admin/products/${productId}`, "The image could not be found."); let uploaded: Awaited<ReturnType<typeof uploadCloudinaryImage>>; try { uploaded = await uploadCloudinaryImage(file); if (uploaded.width > 6000 || uploaded.height > 6000) { await deleteCloudinaryImage(uploaded.public_id); fail(`/admin/products/${productId}`, "Images must not exceed 6000 pixels on either side."); } } catch { fail(`/admin/products/${productId}`, "Replacement upload failed. The existing image is unchanged."); } const result = await client.from("product_images").update({ cloudinary_public_id: uploaded.public_id, secure_url: uploaded.secure_url }).eq("id", id).eq("product_id", productId); if (result.error) { await deleteCloudinaryImage(uploaded.public_id).catch(() => undefined); fail(`/admin/products/${productId}`, "The replacement could not be saved. The existing image is unchanged."); } try { await deleteCloudinaryImage(existing.cloudinary_public_id); } catch { fail(`/admin/products/${productId}`, "Replacement saved, but the old Cloudinary asset could not be cleaned up."); } ok(`/admin/products/${productId}`); }

export async function saveHeroMedia(form: FormData) {
  await requireAdmin();
  const mediaType = text(form, "media_type") === "video" ? "video" : "image";
  const altText = text(form, "alt_text");
  const mediaFile = form.get("media_file");
  const posterFile = form.get("poster_file");

  const client = createSupabaseAdminClient();
  const { data: current } = await client.from("site_settings").select("value").eq("key", "hero_media").maybeSingle();
  const currentVal = (current?.value || {}) as Record<string, string | null>;

  let mediaUrl = currentVal.media_url || null;
  let mediaPublicId = currentVal.cloudinary_public_id || null;
  let posterUrl = currentVal.poster_url || null;
  let posterPublicId = currentVal.poster_public_id || null;

  if (mediaFile instanceof File && mediaFile.size > 0) {
    const validation = validateMedia(mediaFile);
    if (validation) fail("/admin/hero", validation);
    try {
      const uploaded = await uploadCloudinaryMedia(mediaFile, mediaType === "video" ? "video" : "image");
      mediaUrl = uploaded.secure_url;
      mediaPublicId = uploaded.public_id;
    } catch {
      fail("/admin/hero", "Hero media upload failed. Please try again.");
    }
  }

  if (posterFile instanceof File && posterFile.size > 0) {
    try {
      const uploadedPoster = await uploadCloudinaryMedia(posterFile, "image");
      posterUrl = uploadedPoster.secure_url;
      posterPublicId = uploadedPoster.public_id;
    } catch {
      fail("/admin/hero", "Poster image upload failed. Please try again.");
    }
  }

  const newValue = {
    media_type: mediaType,
    cloudinary_public_id: mediaPublicId,
    media_url: mediaUrl,
    poster_public_id: posterPublicId,
    poster_url: posterUrl,
    alt_text: altText || "Namma Ada authentic Kerala handcrafted delicacies",
    resource_type: mediaType,
  };

  const result = await client.from("site_settings").upsert({ key: "hero_media", value: newValue, updated_at: new Date().toISOString() });
  if (result.error) fail("/admin/hero", dbMessage());

  revalidatePath("/");
  ok("/admin/hero");
}

export async function getCloudinaryUploadSignatureAction() {
  await requireAdmin();
  const { createUploadSignature } = await import("@/lib/cloudinary/server");
  return createUploadSignature();
}

export async function saveHeroBanner(form: FormData) {
  await requireAdmin();

  const id = uuid(form, "id");
  const failPath = id ? `/admin/hero-banners/${id}` : "/admin/hero-banners/new";

  const mediaType = text(form, "media_type") === "video" ? "video" : "image";
  const cloudinaryPublicId = required(form, "cloudinary_public_id", "Hero media", 250, failPath);
  let posterPublicId = text(form, "poster_public_id") || null;

  // Default video poster to the video public ID if no separate poster image was uploaded
  if (mediaType === "video" && !posterPublicId) {
    posterPublicId = cloudinaryPublicId;
  }

  const eyebrow = required(form, "eyebrow", "Eyebrow", 100, failPath);
  const headline = required(form, "headline", "Headline", 200, failPath);
  const description = required(form, "description", "Description", 1000, failPath);

  const primaryCtaLabel = required(form, "primary_cta_label", "Primary button label", 100, failPath);
  const primaryCtaHref = required(form, "primary_cta_href", "Primary button destination", 250, failPath);
  const isSecondaryEnabled = bool(form, "is_secondary_cta_enabled");
  const secondaryCtaLabel = isSecondaryEnabled ? text(form, "secondary_cta_label") || null : null;
  const secondaryCtaHref = isSecondaryEnabled ? text(form, "secondary_cta_href") || null : null;

  const displayOrder = integer(form, "display_order", 0);
  const isActive = bool(form, "is_active");
  const altText = text(form, "alt_text") || null;

  const mobileHeadline = text(form, "mobile_headline") || null;
  const mobileDescription = text(form, "mobile_description") || null;
  const mobileMediaPublicId = text(form, "mobile_media_public_id") || null;
  const mobileMediaType = text(form, "mobile_media_type") === "video" ? "video" : text(form, "mobile_media_type") === "image" ? "image" : null;

  const client = createSupabaseAdminClient();

  const { data: existing } = id
    ? await client.from("hero_banners").select("cloudinary_public_id, poster_public_id, media_type").eq("id", id).maybeSingle()
    : { data: null };

  const oldPublicId = existing?.cloudinary_public_id || null;
  const oldPosterPublicId = existing?.poster_public_id || null;
  const oldMediaType = existing?.media_type || "image";

  if (mediaType === "video") {
    const { verifyCloudinaryVideoDuration } = await import("@/lib/cloudinary/server");
    const videoError = await verifyCloudinaryVideoDuration(cloudinaryPublicId, 20);
    if (videoError) {
      if (cloudinaryPublicId && cloudinaryPublicId !== oldPublicId) {
        await deleteCloudinaryMedia(cloudinaryPublicId, "video").catch(() => undefined);
      }
      fail(failPath, videoError);
    }
  }

  const values = {
    cloudinary_public_id: cloudinaryPublicId,
    poster_public_id: posterPublicId,
    media_type: mediaType,
    eyebrow,
    headline,
    description,
    primary_cta_label: primaryCtaLabel,
    primary_cta_href: primaryCtaHref,
    secondary_cta_label: secondaryCtaLabel,
    secondary_cta_href: secondaryCtaHref,
    is_secondary_cta_enabled: isSecondaryEnabled,
    display_order: displayOrder,
    is_active: isActive,
    alt_text: altText,
    mobile_headline: mobileHeadline,
    mobile_description: mobileDescription,
    mobile_media_public_id: mobileMediaPublicId,
    mobile_media_type: mobileMediaType,
    updated_at: new Date().toISOString(),
  };

  const result = id
    ? await client.from("hero_banners").update(values).eq("id", id)
    : await client.from("hero_banners").insert(values);

  if (result.error) {
    if (cloudinaryPublicId && cloudinaryPublicId !== oldPublicId) {
      await deleteCloudinaryMedia(cloudinaryPublicId, mediaType).catch(() => undefined);
    }
    if (posterPublicId && posterPublicId !== oldPosterPublicId && posterPublicId !== cloudinaryPublicId) {
      await deleteCloudinaryMedia(posterPublicId, "image").catch(() => undefined);
    }
    fail(failPath, result.error?.message || dbMessage());
  }

  if (oldPublicId && oldPublicId !== cloudinaryPublicId) {
    await deleteCloudinaryMedia(oldPublicId, oldMediaType === "video" ? "video" : "image").catch(() => undefined);
  }
  if (oldPosterPublicId && oldPosterPublicId !== posterPublicId && oldPosterPublicId !== oldPublicId) {
    await deleteCloudinaryMedia(oldPosterPublicId, "image").catch(() => undefined);
  }

  revalidatePath("/");
  ok("/admin/hero-banners");
}

export async function deleteHeroBanner(form: FormData) {
  await requireAdmin();
  const id = uuid(form, "id");
  if (!id) fail("/admin/hero-banners", "Invalid banner ID.");

  const client = createSupabaseAdminClient();
  const { data: existing } = await client.from("hero_banners").select("cloudinary_public_id, poster_public_id, media_type").eq("id", id).maybeSingle();

  const result = await client.from("hero_banners").delete().eq("id", id);
  if (result.error) fail("/admin/hero-banners", "Unable to delete banner.");

  if (existing?.cloudinary_public_id) {
    await deleteCloudinaryMedia(existing.cloudinary_public_id, existing.media_type === "video" ? "video" : "image").catch(() => undefined);
  }
  if (existing?.poster_public_id && existing.poster_public_id !== existing.cloudinary_public_id) {
    await deleteCloudinaryMedia(existing.poster_public_id, "image").catch(() => undefined);
  }

  revalidatePath("/");
  ok("/admin/hero-banners");
}

export async function toggleHeroBannerActive(form: FormData) {
  await requireAdmin();
  const id = uuid(form, "id");
  const isActive = bool(form, "is_active");
  if (!id) fail("/admin/hero-banners", "Invalid banner.");

  const result = await createSupabaseAdminClient().from("hero_banners").update({ is_active: isActive, updated_at: new Date().toISOString() }).eq("id", id);
  if (result.error) fail("/admin/hero-banners", "Unable to update banner status.");

  revalidatePath("/");
  ok("/admin/hero-banners");
}

export async function moveHeroBanner(form: FormData) {
  await requireAdmin();
  const id = uuid(form, "id");
  const direction = text(form, "direction");
  if (!id || !["up", "down"].includes(direction)) fail("/admin/hero-banners", "Invalid banner order.");

  const client = createSupabaseAdminClient();
  const { data: current } = await client.from("hero_banners").select("id,display_order").eq("id", id).maybeSingle();
  if (!current) fail("/admin/hero-banners", "Banner not found.");

  const query = direction === "up"
    ? client.from("hero_banners").select("id,display_order").lt("display_order", current.display_order).order("display_order", { ascending: false }).limit(1)
    : client.from("hero_banners").select("id,display_order").gt("display_order", current.display_order).order("display_order", { ascending: true }).limit(1);

  const { data: sibling } = await query.maybeSingle();
  if (!sibling) ok("/admin/hero-banners");

  const first = await client.from("hero_banners").update({ display_order: -1 }).eq("id", current.id);
  const second = await client.from("hero_banners").update({ display_order: current.display_order }).eq("id", sibling.id);
  const third = await client.from("hero_banners").update({ display_order: sibling.display_order }).eq("id", current.id);

  if (first.error || second.error || third.error) fail("/admin/hero-banners", "Unable to reorder banner.");

  revalidatePath("/");
  ok("/admin/hero-banners");
}
