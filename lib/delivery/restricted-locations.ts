import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getBengaluruPincodeConfig,
  resolveBengaluruPincodeRate,
  fetchRawBangaloreShippingConfig,
  type BengaluruPincodeConfig,
} from "@/lib/delivery/bengaluru-pincodes";
import {
  getAuthoritativeProductPaymentMethods,
  calculateCartPaymentEligibility,
} from "@/lib/products/payment-methods";

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

  if (error) {
    console.error("Database error in getRestrictedLocations:", error);
    throw new Error(`Database error fetching restricted locations: ${error.message}`);
  }

  if (!data?.value || !Array.isArray(data.value)) {
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

export type PincodeValidationCode =
  | "OK"
  | "RESTRICTED_PRODUCTS_UNAVAILABLE"
  | "INVALID_PIN"
  | "SERVICE_ERROR";

export type PincodeValidationStatus =
  | "ELIGIBLE"
  | "OUTSIDE_SERVICE_AREA"
  | "INVALID_PIN"
  | "SERVICE_ERROR";

export type PincodeValidationResult = {
  isValid: boolean;
  code: PincodeValidationCode;
  status?: PincodeValidationStatus;
  message?: string;
  hasRestrictedProducts: boolean;
  unavailableProducts: Array<{
    productId: string;
    productName: string;
  }>;
  allowedPaymentMethods: Array<"COD" | "RAZORPAY">;
  locality?: string;
  pincode?: string;
  ratePerUnitPaise?: number;
  ratePerUnitRupees?: number;
  isCustomRate?: boolean;
};

/**
 * Dynamically validates whether the customer's pincode can receive all cart products.
 * Queries actual database products for delivery_scope and checks against admin-configured pincodes.
 */
export async function validatePincodeAvailability(
  pincode: string,
  productIds: string[]
): Promise<PincodeValidationResult> {
  const cleanPincode = (pincode ?? "").trim();
  const uniqueIds = Array.from(new Set(productIds.filter(Boolean)));

  // 1. PIN format validation
  if (!/^[1-9][0-9]{5}$/.test(cleanPincode)) {
    return {
      isValid: false,
      code: "INVALID_PIN",
      status: "INVALID_PIN",
      message: "Please enter a valid 6-digit Indian pincode.",
      hasRestrictedProducts: false,
      unavailableProducts: [],
      allowedPaymentMethods: [],
    };
  }

  if (uniqueIds.length === 0) {
    return {
      isValid: true,
      code: "OK",
      status: "ELIGIBLE",
      message: "No products in cart.",
      hasRestrictedProducts: false,
      unavailableProducts: [],
      allowedPaymentMethods: ["RAZORPAY", "COD"],
    };
  }

  try {
    const supabase = createSupabaseAdminClient();

    let scopesMap: Record<string, "all_india" | "bangalore_only"> = {};
    try {
      scopesMap = await getCategoryDeliveryScopes();
    } catch (err) {
      console.warn("Could not load category delivery scopes:", err);
    }

    // Fetch actual products and their category from DB
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, delivery_scope, category_id, categories(id, name)")
      .in("id", uniqueIds);

    if (error || !products) {
      console.error("Database error in validatePincodeAvailability while fetching products:", error);
      return {
        isValid: false,
        code: "SERVICE_ERROR",
        status: "SERVICE_ERROR",
        message: "Unable to verify product delivery availability due to a service error. Please try again.",
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

    // Authoritative payment methods configuration (from product-level settings only)
    const authoritativePaymentInfo = await getAuthoritativeProductPaymentMethods(uniqueIds);
    const paymentEligibility = calculateCartPaymentEligibility(authoritativePaymentInfo);

    // If no products in the cart are restricted, India-wide delivery applies
    if (restrictedProducts.length === 0) {
      if (paymentEligibility.hasConflict || paymentEligibility.allowedMethods.length === 0) {
        return {
          isValid: false,
          code: "RESTRICTED_PRODUCTS_UNAVAILABLE",
          status: "OUTSIDE_SERVICE_AREA",
          message:
            paymentEligibility.conflictReason ||
            "The items in your cart do not share a common payment method.",
          hasRestrictedProducts: false,
          unavailableProducts: [],
          allowedPaymentMethods: [],
        };
      }

      return {
        isValid: true,
        code: "OK",
        status: "ELIGIBLE",
        message: "This product is available for delivery in your location.",
        hasRestrictedProducts: false,
        unavailableProducts: [],
        allowedPaymentMethods: paymentEligibility.allowedMethods,
      };
    }

    // There are restricted products: Validate against configured Bengaluru PIN codes
    let pinConfig: BengaluruPincodeConfig | null = null;
    let defaultBangaloreConfig = {
      chargePaise: 0,
      chargeRupees: 0,
      isActive: false,
      isConfigured: false,
    };

    try {
      const [resolvedPin, rawConfig] = await Promise.all([
        getBengaluruPincodeConfig(cleanPincode),
        fetchRawBangaloreShippingConfig(),
      ]);
      pinConfig = resolvedPin;
      defaultBangaloreConfig = rawConfig;
    } catch (err) {
      console.error("Database error in validatePincodeAvailability:", err);
      return {
        isValid: false,
        code: "SERVICE_ERROR",
        status: "SERVICE_ERROR",
        message: "Unable to verify delivery coverage due to a service error. Please try again.",
        hasRestrictedProducts: true,
        unavailableProducts: [],
        allowedPaymentMethods: [],
      };
    }

    const rateResolution = resolveBengaluruPincodeRate(
      pinConfig,
      defaultBangaloreConfig.chargePaise,
      defaultBangaloreConfig.isActive && defaultBangaloreConfig.isConfigured
    );

    if (!rateResolution.isAvailable) {
      return {
        isValid: false,
        code: "RESTRICTED_PRODUCTS_UNAVAILABLE",
        status: "OUTSIDE_SERVICE_AREA",
        message: rateResolution.reason || `Some products are not available in your location (${cleanPincode}).`,
        hasRestrictedProducts: true,
        locality: rateResolution.locality,
        pincode: cleanPincode,
        unavailableProducts: restrictedProducts.map((p) => ({
          productId: p.id,
          productName: p.name,
        })),
        allowedPaymentMethods: [],
      };
    }

    // Pincode is eligible. Return product-level payment methods (no payment override for Bengaluru).
    return {
      isValid: true,
      code: "OK",
      status: "ELIGIBLE",
      message: `Available for delivery in ${rateResolution.locality || "Bengaluru"}.`,
      hasRestrictedProducts: true,
      locality: rateResolution.locality,
      pincode: cleanPincode,
      ratePerUnitPaise: rateResolution.ratePaise,
      ratePerUnitRupees: rateResolution.rateRupees,
      isCustomRate: rateResolution.isCustomRate,
      unavailableProducts: [],
      allowedPaymentMethods: paymentEligibility.allowedMethods,
    };
  } catch (error) {
    console.error("Unexpected error in validatePincodeAvailability:", error);
    return {
      isValid: false,
      code: "SERVICE_ERROR",
      status: "SERVICE_ERROR",
      message: "Unable to verify delivery availability due to a system error. Please try again.",
      hasRestrictedProducts: false,
      unavailableProducts: [],
      allowedPaymentMethods: [],
    };
  }
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
