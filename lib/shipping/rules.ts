import "server-only";

import { unstable_cache } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { findState, getIndianStates, getStateCanonicalCode, getStateCanonicalName } from "@/lib/constants/india-geo";
import {
  toDeliveryType,
  resolveCategoryScope,
  getCategoryDeliveryScopes,
} from "@/lib/delivery/restricted-locations";
import {
  getBengaluruPincodeConfig,
  resolveBengaluruPincodeRate,
} from "@/lib/delivery/bengaluru-pincodes";

export type ShippingRuleRecord = {
  id: string;
  state_code: string;
  state_name: string;
  charge_paise: number;
  is_active: boolean;
};

export type StateShippingStatus = {
  code: string;
  name: string;
  isUnionTerritory: boolean;
  chargePaise: number;
  chargeRupees: number;
  isActive: boolean;
  isConfigured: boolean;
  isFreeShipping: boolean;
  id?: string;
};

export type StateShippingQuote = {
  isAvailable: boolean;
  chargePaise: number;
  chargeRupees: number;
  stateCode: string;
  stateName: string;
  message?: string;
  isFreeShipping: boolean;
};

export const BANGALORE_SHIPPING_SETTINGS_KEY = "bangalore_special_shipping";

export type BangaloreShippingConfig = {
  chargePaise: number;
  chargeRupees: number;
  isActive: boolean;
  isConfigured: boolean;
};

export type CartItemShippingInput = {
  productId: string;
  quantity: number;
  delivery_scope?: "all_india" | "bangalore_only" | null;
  is_free_shipping?: boolean;
};

export type CartShippingCalculationQuote = StateShippingQuote & {
  isBangaloreSpecial?: boolean;
  bangaloreRatePerUnitRupees?: number;
  bangaloreRatePerUnitPaise?: number;
  totalUnits?: number;
  hasBangaloreOnlyProducts?: boolean;
  isBangaloreDeliveryActive?: boolean;
  bangaloreUnavailable?: boolean;
  locality?: string;
  pincode?: string;
  isCustomPinRate?: boolean;
};

/**
 * Fetches Bangalore special shipping configuration directly from site_settings.
 */
export async function fetchRawBangaloreShippingConfig(): Promise<BangaloreShippingConfig> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", BANGALORE_SHIPPING_SETTINGS_KEY)
      .maybeSingle();

    if (error || !data?.value || typeof data.value !== "object") {
      return {
        chargePaise: 0,
        chargeRupees: 0,
        isActive: false,
        isConfigured: false,
      };
    }

    const val = data.value as { charge_paise?: number; is_active?: boolean };
    const chargePaise =
      typeof val.charge_paise === "number" && val.charge_paise >= 0 ? Math.round(val.charge_paise) : 0;
    const isActive = Boolean(val.is_active);

    return {
      chargePaise,
      chargeRupees: chargePaise / 100,
      isActive,
      isConfigured: true,
    };
  } catch (err) {
    console.error("[ShippingRules] Error fetching Bangalore shipping config:", err);
    return {
      chargePaise: 0,
      chargeRupees: 0,
      isActive: false,
      isConfigured: false,
    };
  }
}

/**
 * Cached getter for Bangalore special shipping configuration.
 * Tagged with ["shipping-rules"] so admin updates invalidate immediately.
 */
export const getBangaloreShippingConfig = unstable_cache(
  async (): Promise<BangaloreShippingConfig> => {
    return fetchRawBangaloreShippingConfig();
  },
  ["bangalore-shipping-config"],
  { tags: ["shipping-rules"], revalidate: 300 }
);

/**
 * Fetches all shipping rules directly from the database using the admin service-role client.
 */
async function fetchRawShippingRules(): Promise<ShippingRuleRecord[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("shipping_rules")
      .select("id, state_code, state_name, charge_paise, is_active")
      .order("state_name", { ascending: true });

    if (error || !data) {
      console.error("[ShippingRules] Error fetching shipping rules:", error);
      return [];
    }

    return (data ?? []) as ShippingRuleRecord[];
  } catch (err) {
    console.error("[ShippingRules] Unexpected query error:", err);
    return [];
  }
}

/**
 * Cached getter for active shipping rules.
 * Uses unstable_cache tagged with ["shipping-rules"] so updates from the admin panel
 * reflect immediately upon cache revalidation.
 */
export const getActiveShippingRules = unstable_cache(
  async (): Promise<ShippingRuleRecord[]> => {
    const all = await fetchRawShippingRules();
    return all.filter((r) => r.is_active && r.charge_paise >= 0);
  },
  ["active-shipping-rules"],
  { tags: ["shipping-rules"], revalidate: 300 }
);

/**
 * Retrieves the authoritative shipping quote for a given state code or name.
 * Strictly adheres to Business Decision 1:
 * If a state does not have an active shipping rule, delivery is unavailable (never default to 0).
 */
export async function getAuthoritativeShippingQuote(
  stateCodeOrName: string
): Promise<StateShippingQuote> {
  const canonicalState = findState(stateCodeOrName);
  const stateCode = canonicalState ? canonicalState.code : getStateCanonicalCode(stateCodeOrName);
  const stateName = canonicalState ? canonicalState.name : getStateCanonicalName(stateCodeOrName);

  if (!stateCode) {
    return {
      isAvailable: false,
      chargePaise: 0,
      chargeRupees: 0,
      stateCode: "",
      stateName: stateCodeOrName || "",
      message: "Please select a valid Indian State or Union Territory.",
      isFreeShipping: false,
    };
  }

  const activeRules = await getActiveShippingRules();
  const rule = activeRules.find(
    (r) =>
      r.state_code.toUpperCase() === stateCode.toUpperCase() ||
      r.state_name.toLowerCase().trim() === stateName.toLowerCase().trim()
  );

  if (!rule || !rule.is_active) {
    return {
      isAvailable: false,
      chargePaise: 0,
      chargeRupees: 0,
      stateCode,
      stateName,
      message: `Delivery is currently not available for ${stateName}.`,
      isFreeShipping: false,
    };
  }

  return {
    isAvailable: true,
    chargePaise: rule.charge_paise,
    chargeRupees: rule.charge_paise / 100,
    stateCode: rule.state_code,
    stateName: rule.state_name,
    isFreeShipping: rule.charge_paise === 0,
  };
}

/**
 * Returns all 36 Indian States & Union Territories merged with their configured Supabase shipping status.
 * Used by the Admin Shipping Management portal to clearly show configured vs unconfigured states.
 */
export async function getAllStatesWithShippingStatus(): Promise<StateShippingStatus[]> {
  const allStates = getIndianStates();
  const dbRules = await fetchRawShippingRules();

  const ruleByCode = new Map<string, ShippingRuleRecord>();
  const ruleByName = new Map<string, ShippingRuleRecord>();

  for (const r of dbRules) {
    ruleByCode.set(r.state_code.toUpperCase(), r);
    ruleByName.set(r.state_name.toLowerCase().trim(), r);
  }

  return allStates.map((state) => {
    const rule =
      ruleByCode.get(state.code.toUpperCase()) ||
      ruleByName.get(state.name.toLowerCase().trim());

    if (rule) {
      return {
        code: state.code,
        name: state.name,
        isUnionTerritory: state.isUnionTerritory,
        chargePaise: rule.charge_paise,
        chargeRupees: rule.charge_paise / 100,
        isActive: rule.is_active,
        isConfigured: true,
        isFreeShipping: rule.is_active && rule.charge_paise === 0,
        id: rule.id,
      };
    }

    return {
      code: state.code,
      name: state.name,
      isUnionTerritory: state.isUnionTerritory,
      chargePaise: 0,
      chargeRupees: 0,
      isActive: false,
      isConfigured: false,
      isFreeShipping: false,
    };
  });
}

/**
 * Authoritatively calculates cart shipping considering state-based rates,
 * Bangalore-only perishable products, and free shipping precedence.
 */
export async function calculateAuthoritativeCartShipping(params: {
  stateCodeOrName: string;
  pincode?: string;
  items?: CartItemShippingInput[];
  hasBangaloreOnlyProducts?: boolean;
  allFreeShipping?: boolean;
  bangaloreConfig?: BangaloreShippingConfig;
}): Promise<CartShippingCalculationQuote> {
  const canonicalState = findState(params.stateCodeOrName);
  const stateCode = canonicalState ? canonicalState.code : getStateCanonicalCode(params.stateCodeOrName);
  const stateName = canonicalState ? canonicalState.name : getStateCanonicalName(params.stateCodeOrName);

  const totalUnits =
    params.items && params.items.length > 0
      ? params.items.reduce((acc, curr) => acc + Math.max(1, Math.round(curr.quantity || 1)), 0)
      : 1;

  if (!stateCode) {
    return {
      isAvailable: false,
      chargePaise: 0,
      chargeRupees: 0,
      stateCode: "",
      stateName: params.stateCodeOrName || "",
      message: "Please select a valid Indian State or Union Territory.",
      isFreeShipping: false,
      hasBangaloreOnlyProducts: false,
      totalUnits,
    };
  }

  let hasBangaloreOnly = Boolean(params.hasBangaloreOnlyProducts);
  let allFreeShipping = Boolean(params.allFreeShipping);

  // Check items from DB or input if not already explicitly true
  if (params.items && params.items.length > 0) {
    if (!hasBangaloreOnly) {
      // Fast check from item metadata if present
      if (params.items.some((i) => i.delivery_scope === "bangalore_only")) {
        hasBangaloreOnly = true;
      }
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const productIds = Array.from(new Set(params.items.map((i) => i.productId).filter((id): id is string => Boolean(id) && uuidRegex.test(id))));
    if (productIds.length > 0) {
      try {
        const supabase = createSupabaseAdminClient();
        const scopesMap = await getCategoryDeliveryScopes();
        const { data: dbProducts } = await supabase
          .from("products")
          .select("id, delivery_scope, category_id, is_free_shipping, categories(id, name, delivery_scope)")
          .in("id", productIds);

        if (dbProducts && dbProducts.length > 0) {
          if (!hasBangaloreOnly) {
            hasBangaloreOnly = dbProducts.some((p) => {
              if (toDeliveryType(p.delivery_scope) === "RESTRICTED_LOCATION") return true;
              const cat = Array.isArray(p.categories)
                ? p.categories[0]
                : (p.categories as { id?: string; name?: string; delivery_scope?: string | null } | null);
              if (cat && resolveCategoryScope(cat, scopesMap) === "bangalore_only") {
                return true;
              }
              return false;
            });
          }

          if (params.allFreeShipping === undefined) {
            allFreeShipping =
              dbProducts.length === productIds.length && dbProducts.every((p) => Boolean(p.is_free_shipping));
          }
        }
      } catch (err) {
        console.error("[calculateAuthoritativeCartShipping] Error fetching products:", err);
      }
    }
  }

  // 1. Mixed or restricted cart containing at least one Bangalore-only product
  if (hasBangaloreOnly) {
    // Restricted delicacies can only be delivered within Karnataka (Bangalore)
    if (stateCode.toUpperCase() !== "KA") {
      return {
        isAvailable: false,
        chargePaise: 0,
        chargeRupees: 0,
        stateCode,
        stateName,
        message: "Restricted Bangalore-only delicacies cannot be delivered outside Karnataka / Bangalore.",
        isFreeShipping: false,
        isBangaloreSpecial: false,
        hasBangaloreOnlyProducts: true,
        totalUnits,
      };
    }

    const bangaloreConfig = params.bangaloreConfig ?? (await getBangaloreShippingConfig());

    // If customer PIN is provided, authoritatively resolve PIN-specific rate & locality
    const cleanPin = (params.pincode ?? "").trim();
    if (cleanPin.length > 0) {
      if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
        return {
          isAvailable: false,
          chargePaise: 0,
          chargeRupees: 0,
          stateCode,
          stateName,
          pincode: cleanPin,
          message: "Please enter a valid 6-digit Indian postal PIN code.",
          isFreeShipping: false,
          isBangaloreSpecial: true,
          hasBangaloreOnlyProducts: true,
          totalUnits,
        };
      }

      let pinConfig = null;
      try {
        pinConfig = await getBengaluruPincodeConfig(cleanPin);
      } catch (pinErr) {
        console.error("[calculateAuthoritativeCartShipping] Error fetching PIN config:", pinErr);
      }

      const rateResolution = resolveBengaluruPincodeRate(
        pinConfig,
        bangaloreConfig.chargePaise,
        bangaloreConfig.isActive && bangaloreConfig.isConfigured
      );

      if (!rateResolution.isAvailable) {
        return {
          isAvailable: false,
          chargePaise: 0,
          chargeRupees: 0,
          stateCode,
          stateName,
          pincode: cleanPin,
          locality: rateResolution.locality,
          message: rateResolution.reason || `Delivery is unavailable for PIN code ${cleanPin}.`,
          isFreeShipping: false,
          isBangaloreSpecial: true,
          hasBangaloreOnlyProducts: true,
          bangaloreUnavailable: true,
          isBangaloreDeliveryActive: false,
          totalUnits,
        };
      }

      const effectiveRatePaise = rateResolution.ratePaise;
      const isFree = allFreeShipping || effectiveRatePaise === 0;
      const chargePaise = isFree ? 0 : totalUnits * effectiveRatePaise;

      return {
        isAvailable: true,
        chargePaise,
        chargeRupees: chargePaise / 100,
        stateCode,
        stateName,
        pincode: cleanPin,
        locality: rateResolution.locality,
        isFreeShipping: isFree,
        isBangaloreSpecial: true,
        isCustomPinRate: rateResolution.isCustomRate,
        bangaloreRatePerUnitPaise: effectiveRatePaise,
        bangaloreRatePerUnitRupees: effectiveRatePaise / 100,
        totalUnits,
        hasBangaloreOnlyProducts: true,
        isBangaloreDeliveryActive: true,
      };
    }

    // PIN not provided yet: initial estimate using Bengaluru-wide default (Mode A)
    if (!bangaloreConfig.isActive || !bangaloreConfig.isConfigured) {
      return {
        isAvailable: false,
        chargePaise: 0,
        chargeRupees: 0,
        stateCode,
        stateName,
        message: "Bangalore delivery is currently unavailable.",
        isFreeShipping: false,
        isBangaloreSpecial: false,
        hasBangaloreOnlyProducts: true,
        isBangaloreDeliveryActive: false,
        bangaloreUnavailable: true,
        totalUnits,
      };
    }

    // Bangalore Special Shipping default rate applies per product unit across all cart items
    const isFree = allFreeShipping || bangaloreConfig.chargePaise === 0;
    const chargePaise = isFree ? 0 : totalUnits * bangaloreConfig.chargePaise;

    return {
      isAvailable: true,
      chargePaise,
      chargeRupees: chargePaise / 100,
      stateCode,
      stateName,
      isFreeShipping: isFree,
      isBangaloreSpecial: true,
      bangaloreRatePerUnitPaise: bangaloreConfig.chargePaise,
      bangaloreRatePerUnitRupees: bangaloreConfig.chargeRupees,
      totalUnits,
      hasBangaloreOnlyProducts: true,
      isBangaloreDeliveryActive: true,
    };
  }

  // 2. Normal cart without Bangalore-only products -> Standard state-based shipping
  const standardQuote = await getAuthoritativeShippingQuote(stateCode);

  if (!standardQuote.isAvailable) {
    return {
      ...standardQuote,
      isBangaloreSpecial: false,
      hasBangaloreOnlyProducts: false,
      totalUnits,
    };
  }

  const isFree = allFreeShipping || standardQuote.chargePaise === 0;
  const chargePaise = isFree ? 0 : standardQuote.chargePaise;

  return {
    ...standardQuote,
    chargePaise,
    chargeRupees: chargePaise / 100,
    isFreeShipping: isFree,
    isBangaloreSpecial: false,
    hasBangaloreOnlyProducts: false,
    totalUnits,
  };
}


