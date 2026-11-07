import "server-only";

import { unstable_cache } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { findState, getIndianStates, getStateCanonicalCode, getStateCanonicalName } from "@/lib/constants/india-geo";

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

