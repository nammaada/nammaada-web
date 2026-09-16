"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import {
  saveRestrictedLocations,
  type RestrictedLocation,
} from "@/lib/delivery/restricted-locations";

export async function saveRestrictedLocationsAction(
  locations: RestrictedLocation[]
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  // Validate locations and pincodes
  for (const loc of locations) {
    if (!loc.name || loc.name.trim().length === 0) {
      return { ok: false, error: "Location name cannot be empty." };
    }
    for (const pin of loc.pincodes) {
      if (!/^[1-9][0-9]{5}$/.test(pin.trim())) {
        return {
          ok: false,
          error: `Invalid 6-digit Indian pincode: "${pin}" in location "${loc.name}".`,
        };
      }
    }
  }

  const result = await saveRestrictedLocations(locations);
  if (!result.ok) {
    return { ok: false, error: result.error || "Failed to update locations." };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
  revalidatePath("/admin/products");

  return { ok: true };
}
