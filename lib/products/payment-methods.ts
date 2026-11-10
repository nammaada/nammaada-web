import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { toDeliveryType } from "@/lib/delivery/restricted-locations";

export type ProductPaymentMethods = {
  allow_cod: boolean;
  allow_reserve_pay: boolean;
};

export type AuthoritativeProductPaymentInfo = {
  id: string;
  name: string;
  allow_cod: boolean;
  allow_reserve_pay: boolean;
  delivery_scope: "all_india" | "bangalore_only";
  is_active: boolean;
};

export type CartPaymentEligibility = {
  allowCod: boolean;
  allowReservePay: boolean;
  allowedMethods: Array<"COD" | "RAZORPAY">;
  hasConflict: boolean;
  conflictReason?: string;
  hasRestrictedBangaloreProducts: boolean;
  productMethods: Array<{
    productId: string;
    productName: string;
    allowCod: boolean;
    allowReservePay: boolean;
    deliveryScope: "all_india" | "bangalore_only";
  }>;
};

export const PRODUCT_PAYMENT_METHODS_SETTINGS_KEY = "product_payment_methods";

/**
 * Reads product payment settings from site_settings.
 * Acts as a backward-compatible and fail-safe persistence mechanism
 * ensuring end-to-end functionality even before database migrations are executed in production.
 */
export async function getProductPaymentMethodsFallback(): Promise<Record<string, ProductPaymentMethods>> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", PRODUCT_PAYMENT_METHODS_SETTINGS_KEY)
      .maybeSingle();

    if (data?.value && typeof data.value === "object" && !Array.isArray(data.value)) {
      return data.value as Record<string, ProductPaymentMethods>;
    }
  } catch (err) {
    console.warn("[payment-methods] Could not load fallback settings:", err);
  }
  return {};
}

/**
 * Persists product payment settings in site_settings as a resilient fallback.
 */
export async function saveProductPaymentMethodsFallback(
  productId: string,
  methods: ProductPaymentMethods
): Promise<void> {
  try {
    const supabase = createSupabaseAdminClient();
    const current = await getProductPaymentMethodsFallback();
    current[productId] = {
      allow_cod: methods.allow_cod,
      allow_reserve_pay: methods.allow_reserve_pay,
    };

    await supabase.from("site_settings").upsert({
      key: PRODUCT_PAYMENT_METHODS_SETTINGS_KEY,
      value: current,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("[payment-methods] Could not persist fallback settings:", err);
  }
}

/**
 * Pure calculation function for cart payment method eligibility.
 * Calculates the intersection of allowed methods across all products in the cart
 * based solely on product-level payment configuration (allow_cod, allow_reserve_pay).
 * Delivery location restrictions (Bengaluru pincode validation) are handled separately
 * and do not affect payment method eligibility.
 */
export function calculateCartPaymentEligibility(
  products: Array<{
    id: string;
    name: string;
    allow_cod?: boolean | null;
    allow_reserve_pay?: boolean | null;
    delivery_scope?: string | null;
  }>
): CartPaymentEligibility {
  if (products.length === 0) {
    return {
      allowCod: true,
      allowReservePay: true,
      allowedMethods: ["RAZORPAY", "COD"],
      hasConflict: false,
      hasRestrictedBangaloreProducts: false,
      productMethods: [],
    };
  }

  const productMethods = products.map((p) => {
    // Backward-compatible defaults: if null or undefined, default to true
    const allowCod = p.allow_cod !== false;
    const allowReservePay = p.allow_reserve_pay !== false;
    const deliveryScope = toDeliveryType(p.delivery_scope) === "RESTRICTED_LOCATION"
      ? ("bangalore_only" as const)
      : ("all_india" as const);

    return {
      productId: p.id,
      productName: p.name,
      allowCod,
      allowReservePay,
      deliveryScope,
    };
  });

  const hasRestrictedBangaloreProducts = productMethods.some(
    (p) => p.deliveryScope === "bangalore_only"
  );

  // Calculate intersection across all products based purely on product-level configuration.
  // delivery_scope does NOT restrict payment methods — only allow_cod / allow_reserve_pay do.
  const allAllowCod = productMethods.every((p) => p.allowCod);
  const allAllowReservePay = productMethods.every((p) => p.allowReservePay);

  if (allAllowCod && allAllowReservePay) {
    return {
      allowCod: true,
      allowReservePay: true,
      allowedMethods: ["RAZORPAY", "COD"],
      hasConflict: false,
      hasRestrictedBangaloreProducts,
      productMethods,
    };
  }

  if (allAllowCod && !allAllowReservePay) {
    return {
      allowCod: true,
      allowReservePay: false,
      allowedMethods: ["COD"],
      hasConflict: false,
      hasRestrictedBangaloreProducts,
      productMethods,
    };
  }

  if (!allAllowCod && allAllowReservePay) {
    return {
      allowCod: false,
      allowReservePay: true,
      allowedMethods: ["RAZORPAY"],
      hasConflict: false,
      hasRestrictedBangaloreProducts,
      productMethods,
    };
  }

  // Neither common method exists (intersection is empty)
  const codOnlyItems = productMethods
    .filter((p) => p.allowCod && !p.allowReservePay)
    .map((p) => `"${p.productName}" (COD only)`);
  const reserveOnlyItems = productMethods
    .filter((p) => !p.allowCod && p.allowReservePay)
    .map((p) => `"${p.productName}" (Online Payment only)`);

  let conflictReason =
    "The items in your cart do not share a common payment method. Please place separate orders for these items.";

  if (codOnlyItems.length > 0 && reserveOnlyItems.length > 0) {
    conflictReason = `These items cannot be ordered together: ${codOnlyItems.join(
      ", "
    )} and ${reserveOnlyItems.join(", ")}. Please place separate orders.`;
  }

  return {
    allowCod: false,
    allowReservePay: false,
    allowedMethods: [],
    hasConflict: true,
    conflictReason,
    hasRestrictedBangaloreProducts,
    productMethods,
  };
}

/**
 * Authoritatively fetches product payment settings from Supabase by product IDs.
 * Combines database columns with site_settings fallback, ensuring accurate data.
 */
export async function getAuthoritativeProductPaymentMethods(
  productIds: string[]
): Promise<AuthoritativeProductPaymentInfo[]> {
  const uniqueIds = Array.from(new Set(productIds.filter(Boolean)));
  if (uniqueIds.length === 0) return [];

  const supabase = createSupabaseAdminClient();

  // Try querying with allow_cod and allow_reserve_pay columns
  let rawProducts: Array<{
    id: string;
    name: string;
    delivery_scope: string | null;
    is_active: boolean;
    allow_cod?: boolean | null;
    allow_reserve_pay?: boolean | null;
  }> | null = null;

  const { data: dbData, error } = await supabase
    .from("products")
    .select("id, name, delivery_scope, is_active, allow_cod, allow_reserve_pay")
    .in("id", uniqueIds);

  if (error) {
    // If column doesn't exist yet (migration pending), fall back to querying without them
    if (error.code === "42703") {
      const { data: fallbackData } = await supabase
        .from("products")
        .select("id, name, delivery_scope, is_active")
        .in("id", uniqueIds);
      rawProducts = fallbackData ?? [];
    } else {
      console.error("[payment-methods] Error querying products:", error);
      rawProducts = [];
    }
  } else {
    rawProducts = dbData ?? [];
  }

  const fallbackSettings = await getProductPaymentMethodsFallback();

  return (rawProducts ?? []).map((p) => {
    const fallback = fallbackSettings[p.id];
    const allow_cod =
      typeof p.allow_cod === "boolean"
        ? p.allow_cod
        : fallback?.allow_cod ?? true;
    const allow_reserve_pay =
      typeof p.allow_reserve_pay === "boolean"
        ? p.allow_reserve_pay
        : fallback?.allow_reserve_pay ?? true;

    return {
      id: p.id,
      name: p.name,
      allow_cod,
      allow_reserve_pay,
      delivery_scope:
        toDeliveryType(p.delivery_scope) === "RESTRICTED_LOCATION"
          ? "bangalore_only"
          : "all_india",
      is_active: Boolean(p.is_active),
    };
  });
}

