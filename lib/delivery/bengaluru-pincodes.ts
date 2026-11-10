import "server-only";

import { unstable_cache } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  RESTRICTED_LOCATIONS_SETTINGS_KEY,
  type RestrictedLocation,
} from "@/lib/delivery/restricted-locations";

export const BENGALURU_PINCODES_SETTINGS_KEY = "bengaluru_delivery_pincodes";
export const BANGALORE_SHIPPING_SETTINGS_KEY = "bangalore_special_shipping";

export type BangaloreShippingConfig = {
  chargePaise: number;
  chargeRupees: number;
  isActive: boolean;
  isConfigured: boolean;
};

/**
 * Fetches Bangalore special default shipping configuration directly from site_settings.
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
    console.error("[BengaluruPincodes] Error fetching default Bangalore shipping config:", err);
    return {
      chargePaise: 0,
      chargeRupees: 0,
      isActive: false,
      isConfigured: false,
    };
  }
}

export type {
  BengaluruPincodeConfig,
  BengaluruDeliverySummary,
} from "./bengaluru-pincodes-types";
export { getBengaluruDeliverySummary } from "./bengaluru-pincodes-types";

import type { BengaluruPincodeConfig } from "./bengaluru-pincodes-types";

const DEFAULT_BENGALURU_SEED: BengaluruPincodeConfig[] = [
  {
    pincode: "560001",
    locality: "Bangalore G.P.O. / Central Bengaluru",
    isActive: true,
    chargePaise: null,
  },
  {
    pincode: "560005",
    locality: "Fraser Town / Pulakeshinagar",
    isActive: true,
    chargePaise: null,
  },
  {
    pincode: "560022",
    locality: "Yeshwanthpur",
    isActive: true,
    chargePaise: null,
  },
];

/**
 * Normalizes and sanitizes raw JSON data into typed BengaluruPincodeConfig objects.
 */
function parsePincodeConfig(item: unknown): BengaluruPincodeConfig | null {
  if (typeof item !== "object" || item === null) return null;
  const obj = item as Record<string, unknown>;

  const pincode = String(obj.pincode ?? "").trim();
  if (!/^[1-9][0-9]{5}$/.test(pincode)) return null;

  const locality = String(obj.locality ?? "").trim() || `Bengaluru (${pincode})`;
  const isActive = obj.isActive !== undefined ? Boolean(obj.isActive) : true;

  let chargePaise: number | null = null;
  if (obj.chargePaise !== null && obj.chargePaise !== undefined) {
    const parsed = Number(obj.chargePaise);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      chargePaise = Math.round(parsed);
    }
  }

  return {
    pincode,
    locality,
    isActive,
    chargePaise,
    createdAt: typeof obj.createdAt === "string" ? obj.createdAt : undefined,
    updatedAt: typeof obj.updatedAt === "string" ? obj.updatedAt : undefined,
  };
}

/**
 * Fetches raw Bengaluru PIN code configurations from site_settings.
 * Seeds with default allowlist if not yet populated.
 */
export async function fetchRawBengaluruPincodeConfigs(): Promise<BengaluruPincodeConfig[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", BENGALURU_PINCODES_SETTINGS_KEY)
      .maybeSingle();

    if (error) {
      console.error("[BengaluruPincodes] Error fetching from site_settings:", error);
      throw new Error(`Database error fetching Bengaluru PIN configurations: ${error.message}`);
    }

    if (data?.value && Array.isArray(data.value) && data.value.length > 0) {
      const parsed = (data.value as unknown[])
        .map(parsePincodeConfig)
        .filter((p): p is BengaluruPincodeConfig => p !== null);

      if (parsed.length > 0) {
        return parsed.sort((a, b) => a.pincode.localeCompare(b.pincode));
      }
    }

    // If key not configured yet, attempt migration from legacy restricted_locations
    const legacyPincodes = new Set<string>();
    try {
      const { data: legacyData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", RESTRICTED_LOCATIONS_SETTINGS_KEY)
        .maybeSingle();

      if (legacyData?.value && Array.isArray(legacyData.value)) {
        for (const loc of legacyData.value as RestrictedLocation[]) {
          if (Array.isArray(loc.pincodes)) {
            for (const p of loc.pincodes) {
              if (/^[1-9][0-9]{5}$/.test(String(p).trim())) {
                legacyPincodes.add(String(p).trim());
              }
            }
          }
        }
      }
    } catch (legacyErr) {
      console.warn("[BengaluruPincodes] Could not read legacy restricted_locations:", legacyErr);
    }

    // Merge default seed with any extra legacy PIN codes
    const mergedMap = new Map<string, BengaluruPincodeConfig>();
    for (const seed of DEFAULT_BENGALURU_SEED) {
      mergedMap.set(seed.pincode, seed);
    }
    for (const pin of legacyPincodes) {
      if (!mergedMap.has(pin)) {
        mergedMap.set(pin, {
          pincode: pin,
          locality: `Bengaluru (${pin})`,
          isActive: true,
          chargePaise: null,
        });
      }
    }

    const initialConfigs = Array.from(mergedMap.values()).sort((a, b) =>
      a.pincode.localeCompare(b.pincode)
    );

    // Save initial configuration in background
    try {
      await supabase.from("site_settings").upsert({
        key: BENGALURU_PINCODES_SETTINGS_KEY,
        value: initialConfigs,
        updated_at: new Date().toISOString(),
      });
    } catch (saveErr) {
      console.warn("[BengaluruPincodes] Auto-seed upsert warning:", saveErr);
    }

    return initialConfigs;
  } catch (err) {
    console.error("[BengaluruPincodes] Unexpected fetch error:", err);
    throw err;
  }
}

/**
 * Cached getter for Bengaluru delivery PIN codes.
 * Tagged with ["shipping-rules", "bengaluru-pincodes"] for instant revalidation.
 */
export const getBengaluruPincodeConfigs = unstable_cache(
  async (): Promise<BengaluruPincodeConfig[]> => {
    return fetchRawBengaluruPincodeConfigs();
  },
  ["bengaluru-delivery-pincodes-list"],
  { tags: ["shipping-rules", "bengaluru-pincodes"], revalidate: 300 }
);

/**
 * Retrieves the specific configuration for a single 6-digit PIN code.
 */
export async function getBengaluruPincodeConfig(
  pincode: string
): Promise<BengaluruPincodeConfig | null> {
  const clean = pincode.trim();
  if (!/^[1-9][0-9]{5}$/.test(clean)) return null;

  const all = await getBengaluruPincodeConfigs();
  return all.find((p) => p.pincode === clean) || null;
}

/**
 * Saves all Bengaluru delivery PIN codes to site_settings and synchronizes
 * active PINs to restricted_locations for backwards compatibility.
 */
export async function saveBengaluruPincodeConfigs(
  configs: BengaluruPincodeConfig[]
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = createSupabaseAdminClient();

    // Deduplicate and validate
    const validMap = new Map<string, BengaluruPincodeConfig>();
    const nowIso = new Date().toISOString();

    for (const item of configs) {
      const pin = item.pincode.trim();
      if (!/^[1-9][0-9]{5}$/.test(pin)) {
        return { ok: false, error: `Invalid 6-digit Indian PIN code: "${item.pincode}".` };
      }
      const loc = item.locality.trim();
      if (!loc) {
        return { ok: false, error: `Locality name is required for PIN code ${pin}.` };
      }

      let chargePaise: number | null = null;
      if (item.chargePaise !== null && item.chargePaise !== undefined) {
        const parsed = Number(item.chargePaise);
        if (Number.isNaN(parsed) || parsed < 0) {
          return { ok: false, error: `Invalid shipping charge for PIN code ${pin}. Must be ₹0 or greater.` };
        }
        if (parsed > 5000000) {
          return { ok: false, error: `Shipping charge for PIN code ${pin} exceeds maximum allowed limit.` };
        }
        chargePaise = Math.round(parsed);
      }

      validMap.set(pin, {
        pincode: pin,
        locality: loc,
        isActive: Boolean(item.isActive),
        chargePaise,
        createdAt: item.createdAt || nowIso,
        updatedAt: nowIso,
      });
    }

    const cleanedList = Array.from(validMap.values()).sort((a, b) =>
      a.pincode.localeCompare(b.pincode)
    );

    // 1. Save to bengaluru_delivery_pincodes
    const { error: saveErr } = await supabase.from("site_settings").upsert({
      key: BENGALURU_PINCODES_SETTINGS_KEY,
      value: cleanedList,
      updated_at: nowIso,
    });

    if (saveErr) {
      console.error("[BengaluruPincodes] Save error:", saveErr);
      return { ok: false, error: `Database error: ${saveErr.message}` };
    }

    // 2. Synchronize active PINs to restricted_locations for backward compatibility
    try {
      const activePincodes = cleanedList.filter((p) => p.isActive).map((p) => p.pincode);
      const { data: legacyData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", RESTRICTED_LOCATIONS_SETTINGS_KEY)
        .maybeSingle();

      let legacyList: RestrictedLocation[] = [];
      if (legacyData?.value && Array.isArray(legacyData.value)) {
        legacyList = legacyData.value as RestrictedLocation[];
      }

      const bangaloreIdx = legacyList.findIndex((l) =>
        l.name.toLowerCase().includes("bangalore") || l.name.toLowerCase().includes("bengaluru")
      );

      if (bangaloreIdx >= 0) {
        legacyList[bangaloreIdx] = {
          ...legacyList[bangaloreIdx],
          pincodes: activePincodes,
        };
      } else {
        legacyList.push({
          id: "loc_bangalore_default",
          name: "Bangalore",
          pincodes: activePincodes,
        });
      }

      await supabase.from("site_settings").upsert({
        key: RESTRICTED_LOCATIONS_SETTINGS_KEY,
        value: legacyList,
        updated_at: nowIso,
      });
    } catch (syncErr) {
      console.warn("[BengaluruPincodes] Sync to restricted_locations warning:", syncErr);
    }

    return { ok: true };
  } catch (err) {
    console.error("[BengaluruPincodes] Unexpected save exception:", err);
    return { ok: false, error: "An unexpected error occurred while saving PIN codes." };
  }
}

/**
 * Adds or updates a single Bengaluru delivery PIN code.
 */
export async function upsertBengaluruPincode(
  item: BengaluruPincodeConfig
): Promise<{ ok: boolean; error?: string }> {
  const all = await fetchRawBengaluruPincodeConfigs();
  const existingIdx = all.findIndex((p) => p.pincode === item.pincode.trim());

  if (existingIdx >= 0) {
    all[existingIdx] = {
      ...all[existingIdx],
      ...item,
      pincode: item.pincode.trim(),
      locality: item.locality.trim(),
      updatedAt: new Date().toISOString(),
    };
  } else {
    all.push({
      ...item,
      pincode: item.pincode.trim(),
      locality: item.locality.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return saveBengaluruPincodeConfigs(all);
}

/**
 * Toggles a PIN's active status (activating or pausing delivery).
 */
export async function toggleBengaluruPincodeActive(
  pincode: string,
  isActive: boolean
): Promise<{ ok: boolean; error?: string }> {
  const clean = pincode.trim();
  const all = await fetchRawBengaluruPincodeConfigs();
  const target = all.find((p) => p.pincode === clean);

  if (!target) {
    return { ok: false, error: `PIN code ${clean} was not found.` };
  }

  target.isActive = isActive;
  target.updatedAt = new Date().toISOString();

  return saveBengaluruPincodeConfigs(all);
}

/**
 * Deletes a PIN code from Bengaluru delivery coverage.
 */
export async function deleteBengaluruPincode(
  pincode: string
): Promise<{ ok: boolean; error?: string }> {
  const clean = pincode.trim();
  const all = await fetchRawBengaluruPincodeConfigs();
  const filtered = all.filter((p) => p.pincode !== clean);

  if (filtered.length === all.length) {
    return { ok: false, error: `PIN code ${clean} was not found.` };
  }

  return saveBengaluruPincodeConfigs(filtered);
}

/**
 * Bulk adds or updates multiple PIN codes.
 */
export async function bulkAddBengaluruPincodes(
  inputs: Array<{
    pincode: string;
    locality?: string;
    chargePaise?: number | null;
    isActive?: boolean;
  }>
): Promise<{ ok: boolean; addedCount: number; updatedCount: number; error?: string }> {
  const all = await fetchRawBengaluruPincodeConfigs();
  const map = new Map<string, BengaluruPincodeConfig>(all.map((p) => [p.pincode, p]));

  let addedCount = 0;
  let updatedCount = 0;
  const nowIso = new Date().toISOString();

  for (const input of inputs) {
    const pin = input.pincode.trim();
    if (!/^[1-9][0-9]{5}$/.test(pin)) continue;

    const locality = input.locality?.trim() || `Bengaluru (${pin})`;
    const isActive = input.isActive !== undefined ? input.isActive : true;
    const chargePaise =
      input.chargePaise !== undefined
        ? input.chargePaise !== null
          ? Math.max(0, Math.round(Number(input.chargePaise)))
          : null
        : null;

    if (map.has(pin)) {
      const existing = map.get(pin)!;
      map.set(pin, {
        ...existing,
        locality: input.locality ? locality : existing.locality,
        isActive,
        chargePaise: input.chargePaise !== undefined ? chargePaise : existing.chargePaise,
        updatedAt: nowIso,
      });
      updatedCount++;
    } else {
      map.set(pin, {
        pincode: pin,
        locality,
        isActive,
        chargePaise,
        createdAt: nowIso,
        updatedAt: nowIso,
      });
      addedCount++;
    }
  }

  const saveRes = await saveBengaluruPincodeConfigs(Array.from(map.values()));
  if (!saveRes.ok) {
    return { ok: false, addedCount: 0, updatedCount: 0, error: saveRes.error };
  }

  return { ok: true, addedCount, updatedCount };
}



/**
 * Resolves the effective per-unit shipping rate and availability for a Bengaluru delivery PIN.
 * Adheres strictly to Mode A vs Mode B rules:
 * - Mode B (PIN-specific override) takes precedence if configured (even ₹0).
 * - Otherwise Mode A (Bengaluru-wide default) is used.
 * - Inactive or unconfigured PINs are unavailable (never fall back to Karnataka state rate).
 */
export function resolveBengaluruPincodeRate(
  pinConfig: BengaluruPincodeConfig | null,
  defaultRatePaise: number,
  isDefaultActive: boolean
): {
  isAvailable: boolean;
  ratePaise: number;
  rateRupees: number;
  isCustomRate: boolean;
  locality?: string;
  pincode?: string;
  reason?: string;
} {
  if (!pinConfig) {
    return {
      isAvailable: false,
      ratePaise: 0,
      rateRupees: 0,
      isCustomRate: false,
      reason: "PIN code is not within our Bengaluru special delivery coverage area.",
    };
  }

  if (!pinConfig.isActive) {
    return {
      isAvailable: false,
      ratePaise: 0,
      rateRupees: 0,
      isCustomRate: false,
      locality: pinConfig.locality,
      pincode: pinConfig.pincode,
      reason: `Delivery is currently paused for ${pinConfig.locality} (${pinConfig.pincode}).`,
    };
  }

  // Check if PIN has custom rate override (Mode B)
  if (pinConfig.chargePaise !== null) {
    const ratePaise = pinConfig.chargePaise;
    return {
      isAvailable: true,
      ratePaise,
      rateRupees: ratePaise / 100,
      isCustomRate: true,
      locality: pinConfig.locality,
      pincode: pinConfig.pincode,
    };
  }

  // Uses Mode A (Bengaluru-wide default rate)
  if (!isDefaultActive) {
    return {
      isAvailable: false,
      ratePaise: 0,
      rateRupees: 0,
      isCustomRate: false,
      locality: pinConfig.locality,
      pincode: pinConfig.pincode,
      reason: "Bengaluru delivery is currently unavailable.",
    };
  }

  return {
    isAvailable: true,
    ratePaise: defaultRatePaise,
    rateRupees: defaultRatePaise / 100,
    isCustomRate: false,
    locality: pinConfig.locality,
    pincode: pinConfig.pincode,
  };
}
