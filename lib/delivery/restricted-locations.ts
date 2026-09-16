import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type DeliveryType = "INDIA_WIDE" | "RESTRICTED_LOCATION";

export type RestrictedLocation = {
  id: string;
  name: string;
  pincodes: string[];
};

export const RESTRICTED_LOCATIONS_SETTINGS_KEY = "restricted_locations";

/**
 * Normalizes internal delivery_scope enum values to application DeliveryType.
 */
export function toDeliveryType(scope?: string | null): DeliveryType {
  if (scope === "bangalore_only" || scope === "RESTRICTED_LOCATION") {
    return "RESTRICTED_LOCATION";
  }
  return "INDIA_WIDE";
}

/**
 * Normalizes application DeliveryType to database delivery_scope enum value.
 */
export function toDeliveryScope(type?: DeliveryType | string | null): "all_india" | "bangalore_only" {
  if (type === "RESTRICTED_LOCATION" || type === "bangalore_only") {
    return "bangalore_only";
  }
  return "all_india";
}

/**
 * Fetches all admin-configured restricted delivery locations from site_settings.
 * Returns an empty array if no locations have been configured yet.
 * Never inserts default or fake data.
 */
export async function getRestrictedLocations(): Promise<RestrictedLocation[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", RESTRICTED_LOCATIONS_SETTINGS_KEY)
    .maybeSingle();

  if (error || !data?.value || !Array.isArray(data.value)) {
    return [];
  }

  return (data.value as Array<unknown>)
    .filter((item): item is RestrictedLocation => {
      return (
        typeof item === "object" &&
        item !== null &&
        typeof (item as RestrictedLocation).id === "string" &&
        typeof (item as RestrictedLocation).name === "string" &&
        Array.isArray((item as RestrictedLocation).pincodes)
      );
    })
    .map((loc) => ({
      id: loc.id,
      name: loc.name.trim(),
      pincodes: loc.pincodes
        .map((p) => String(p).trim())
        .filter((p) => p.length > 0),
    }));
}

/**
 * Saves admin-configured restricted delivery locations into site_settings.
 */
export async function saveRestrictedLocations(
  locations: RestrictedLocation[]
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();

  const cleaned = locations.map((loc) => ({
    id: loc.id,
    name: loc.name.trim(),
    pincodes: Array.from(
      new Set(
        loc.pincodes
          .map((p) => String(p).trim())
          .filter((p) => /^[1-9][0-9]{5}$/.test(p))
      )
    ),
  }));

  const { error } = await supabase.from("site_settings").upsert({
    key: RESTRICTED_LOCATIONS_SETTINGS_KEY,
    value: cleaned,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Failed to save restricted locations:", error);
    return { ok: false, error: "Failed to save restricted locations." };
  }

  return { ok: true };
}

export type PincodeValidationResult = {
  isValid: boolean;
  code?: "RESTRICTED_PRODUCTS_UNAVAILABLE" | "OK";
  message?: string;
  hasRestrictedProducts: boolean;
  unavailableProducts: Array<{
    productId: string;
    productName: string;
  }>;
  allowedPaymentMethods: Array<"COD" | "RAZORPAY">;
};

/**
 * Dynamically validates whether the customer's pincode can receive all cart products.
 * Queries actual database products for delivery_scope and checks against admin-configured pincodes.
 */
export async function validatePincodeAvailability(
  pincode: string,
  productIds: string[]
): Promise<PincodeValidationResult> {
  const cleanPincode = pincode.trim();
  const uniqueIds = Array.from(new Set(productIds.filter(Boolean)));

  if (uniqueIds.length === 0) {
    return {
      isValid: true,
      code: "OK",
      hasRestrictedProducts: false,
      unavailableProducts: [],
      allowedPaymentMethods: ["RAZORPAY", "COD"],
    };
  }

  const supabase = createSupabaseAdminClient();

  const scopesMap = await getCategoryDeliveryScopes();

  // Fetch actual products and their category from DB
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, delivery_scope, category_id, categories(id, name)")
    .in("id", uniqueIds);

  if (error || !products) {
    return {
      isValid: false,
      message: "Unable to verify product delivery availability at this time.",
      hasRestrictedProducts: false,
      unavailableProducts: [],
      allowedPaymentMethods: [],
    };
  }

  const restrictedProducts = products.filter((p) => {
    if (toDeliveryType(p.delivery_scope) === "RESTRICTED_LOCATION") return true;
    const cat = Array.isArray(p.categories) ? p.categories[0] : (p.categories as { id?: string; name?: string } | null);
    if (cat) {
      const scope = resolveCategoryScope(cat, scopesMap);
      if (scope === "bangalore_only") return true;
    }
    return false;
  });

  // If no products in the cart are restricted, India-wide delivery applies
  if (restrictedProducts.length === 0) {
    return {
      isValid: true,
      code: "OK",
      hasRestrictedProducts: false,
      unavailableProducts: [],
      allowedPaymentMethods: ["RAZORPAY", "COD"],
    };
  }

  // There are restricted products: Fetch admin-configured restricted locations from DB
  const configuredLocations = await getRestrictedLocations();
  const allowedPincodesSet = new Set<string>();

  for (const loc of configuredLocations) {
    for (const p of loc.pincodes) {
      allowedPincodesSet.add(p.trim());
    }
  }

  // Check if customer's pincode is in the allowed set
  const isPincodeAllowed = allowedPincodesSet.has(cleanPincode);

  if (!isPincodeAllowed) {
    return {
      isValid: false,
      code: "RESTRICTED_PRODUCTS_UNAVAILABLE",
      message: "Some products are not available in your location.",
      hasRestrictedProducts: true,
      unavailableProducts: restrictedProducts.map((p) => ({
        productId: p.id,
        productName: p.name,
      })),
      // If unavailable, these cannot proceed until removed
      allowedPaymentMethods: [],
    };
  }

  // Pincode is eligible, but since restricted products exist: COD ONLY
  return {
    isValid: true,
    code: "OK",
    hasRestrictedProducts: true,
    unavailableProducts: [],
    allowedPaymentMethods: ["COD"],
  };
}

export const CATEGORY_DELIVERY_SCOPES_KEY = "category_delivery_scopes";

/**
 * Fetches the mapping of category IDs to their delivery scope ('all_india' or 'bangalore_only').
 * Unniyappam and Payasam default to 'bangalore_only' if not explicitly configured.
 */
export async function getCategoryDeliveryScopes(): Promise<Record<string, "all_india" | "bangalore_only">> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", CATEGORY_DELIVERY_SCOPES_KEY)
    .maybeSingle();

  if (data?.value && typeof data.value === "object" && !Array.isArray(data.value)) {
    return data.value as Record<string, "all_india" | "bangalore_only">;
  }

  return {};
}

/**
 * Saves or updates a category's delivery scope in site_settings.
 */
export async function saveCategoryDeliveryScope(
  categoryId: string,
  scope: "all_india" | "bangalore_only"
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const current = await getCategoryDeliveryScopes();
  current[categoryId] = scope;

  await supabase.from("site_settings").upsert({
    key: CATEGORY_DELIVERY_SCOPES_KEY,
    value: current,
    updated_at: new Date().toISOString(),
  });
}

/**
 * Resolves a category's delivery scope from column, site_settings, or known names (UNNIYAPPAM, PAYASAM).
 */
export function resolveCategoryScope(
  category: { id?: string; name?: string; delivery_scope?: string | null },
  scopesMap?: Record<string, "all_india" | "bangalore_only">
): "all_india" | "bangalore_only" {
  if (category.delivery_scope === "bangalore_only" || category.delivery_scope === "all_india") {
    return category.delivery_scope;
  }
  if (category.id && scopesMap?.[category.id]) {
    return scopesMap[category.id];
  }
  const nameUpper = (category.name || "").trim().toUpperCase();
  if (nameUpper === "UNNIYAPPAM" || nameUpper === "PAYASAM") {
    return "bangalore_only";
  }
  return "all_india";
}
