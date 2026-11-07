"use server";

import { getActiveShippingRules, getAuthoritativeShippingQuote, type StateShippingQuote } from "@/lib/shipping/rules";

/**
 * Server action to get real-time authoritative shipping quote for a state.
 * Safe for client-side invocation from PDP, Cart, and Checkout.
 */
export async function getShippingQuoteAction(
  stateCodeOrName: string
): Promise<StateShippingQuote> {
  return getAuthoritativeShippingQuote(stateCodeOrName);
}

/**
 * Returns a map of all currently active state rates: { [stateCode]: chargeRupees }
 */
export async function getAllActiveShippingRatesAction(): Promise<
  Record<string, { chargeRupees: number; chargePaise: number; stateName: string }>
> {
  const rules = await getActiveShippingRules();
  const map: Record<string, { chargeRupees: number; chargePaise: number; stateName: string }> = {};

  for (const r of rules) {
    if (r.is_active) {
      map[r.state_code.toUpperCase()] = {
        chargeRupees: r.charge_paise / 100,
        chargePaise: r.charge_paise,
        stateName: r.state_name,
      };
      // Also map by lowercase name for easy lookup
      map[r.state_name.toLowerCase().trim()] = {
        chargeRupees: r.charge_paise / 100,
        chargePaise: r.charge_paise,
        stateName: r.state_name,
      };
    }
  }

  return map;
}

