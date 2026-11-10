import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { DeliveryType } from "@/lib/delivery/restricted-locations";

export type OrderPaymentMethod = "COD" | "RAZORPAY";

export type OrderMetadata = {
  orderId: string;
  paymentMethod: OrderPaymentMethod;
  itemsDeliveryType: Record<string, DeliveryType>;
  customerEmailSent?: boolean;
  adminEmailSent?: boolean;
  userId?: string;
  createdAt?: string;
  deliveryDistrict?: string;
  deliveryCity?: string;
  shippingFeePaise?: number;
  shippingRatePerUnitPaise?: number;
  shippingLocality?: string;
  shippingPincode?: string;
  isBangaloreSpecial?: boolean;
};

const ORDER_META_PREFIX = "order_meta_";

/**
 * Validates and parses raw site_settings JSON value into typed OrderMetadata.
 * Performs strict runtime type validation:
 * - shippingFeePaise: non-negative finite integer
 * - shippingRatePerUnitPaise: non-negative finite integer
 * - shippingLocality: non-empty trimmed string
 * - shippingPincode: exactly 6 digits matching /^[1-9][0-9]{5}$/
 * - isBangaloreSpecial: strict boolean
 * - deliveryDistrict / deliveryCity: non-empty trimmed strings
 * - paymentMethod: "COD" | "RAZORPAY"
 * - itemsDeliveryType: object mapping product UUID to "RESTRICTED_LOCATION" | "INDIA_WIDE"
 *
 * Preserves backward compatibility: older order records missing these optional fields
 * gracefully return undefined for absent properties without throwing or corrupting data.
 */
export function parseOrderMetadata(orderId: string, raw: unknown): OrderMetadata | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }

  const val = raw as Record<string, unknown>;

  const paymentMethod: OrderPaymentMethod = val.paymentMethod === "COD" ? "COD" : "RAZORPAY";

  const itemsDeliveryType: Record<string, DeliveryType> = {};
  if (typeof val.itemsDeliveryType === "object" && val.itemsDeliveryType !== null) {
    for (const [productId, deliveryType] of Object.entries(val.itemsDeliveryType)) {
      if (deliveryType === "RESTRICTED_LOCATION" || deliveryType === "INDIA_WIDE") {
        itemsDeliveryType[productId] = deliveryType;
      }
    }
  }

  const customerEmailSent =
    typeof val.customerEmailSent === "boolean" ? val.customerEmailSent : false;
  const adminEmailSent =
    typeof val.adminEmailSent === "boolean" ? val.adminEmailSent : false;

  const userId =
    typeof val.userId === "string" && val.userId.trim().length > 0
      ? val.userId.trim()
      : undefined;

  const createdAt =
    typeof val.createdAt === "string" && val.createdAt.trim().length > 0
      ? val.createdAt.trim()
      : undefined;

  const deliveryDistrict =
    typeof val.deliveryDistrict === "string" && val.deliveryDistrict.trim().length > 0
      ? val.deliveryDistrict.trim()
      : undefined;

  const deliveryCity =
    typeof val.deliveryCity === "string" && val.deliveryCity.trim().length > 0
      ? val.deliveryCity.trim()
      : undefined;

  const shippingFeePaise =
    typeof val.shippingFeePaise === "number" &&
    Number.isFinite(val.shippingFeePaise) &&
    val.shippingFeePaise >= 0
      ? Math.round(val.shippingFeePaise)
      : undefined;

  const shippingRatePerUnitPaise =
    typeof val.shippingRatePerUnitPaise === "number" &&
    Number.isFinite(val.shippingRatePerUnitPaise) &&
    val.shippingRatePerUnitPaise >= 0
      ? Math.round(val.shippingRatePerUnitPaise)
      : undefined;

  const shippingLocality =
    typeof val.shippingLocality === "string" && val.shippingLocality.trim().length > 0
      ? val.shippingLocality.trim()
      : undefined;

  const shippingPincode =
    typeof val.shippingPincode === "string" &&
    /^[1-9][0-9]{5}$/.test(val.shippingPincode.trim())
      ? val.shippingPincode.trim()
      : undefined;

  const isBangaloreSpecial =
    typeof val.isBangaloreSpecial === "boolean" ? val.isBangaloreSpecial : undefined;

  return {
    orderId,
    paymentMethod,
    itemsDeliveryType,
    customerEmailSent,
    adminEmailSent,
    userId,
    createdAt,
    deliveryDistrict,
    deliveryCity,
    shippingFeePaise,
    shippingRatePerUnitPaise,
    shippingLocality,
    shippingPincode,
    isBangaloreSpecial,
  };
}

/**
 * Saves immutable operational order metadata (Payment Method & Item Delivery Type snapshots).
 * Stored under site_settings key `order_meta_${orderId}`.
 * Merges with any existing record to ensure partial updates (such as email flags)
 * never overwrite existing snapshot fields.
 */
export async function saveOrderMetadata(meta: OrderMetadata): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  const key = `${ORDER_META_PREFIX}${meta.orderId}`;

  // If updating existing metadata, merge with existing values so partial updates
  // (e.g. updating email sent status) do not overwrite existing snapshot values with null.
  let existingVal: Record<string, unknown> = {};
  try {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (data?.value && typeof data.value === "object") {
      existingVal = data.value as Record<string, unknown>;
    }
  } catch {
    // Ignore fetch error, proceed with direct save
  }

  const mergedValue: Record<string, unknown> = {
    ...existingVal,
    orderId: meta.orderId,
    paymentMethod: meta.paymentMethod || existingVal.paymentMethod || "COD",
    itemsDeliveryType: meta.itemsDeliveryType || existingVal.itemsDeliveryType || {},
    customerEmailSent:
      meta.customerEmailSent !== undefined
        ? Boolean(meta.customerEmailSent)
        : Boolean(existingVal.customerEmailSent),
    adminEmailSent:
      meta.adminEmailSent !== undefined
        ? Boolean(meta.adminEmailSent)
        : Boolean(existingVal.adminEmailSent),
    userId:
      meta.userId !== undefined ? (meta.userId || null) : (existingVal.userId || null),
    deliveryDistrict:
      meta.deliveryDistrict !== undefined
        ? (meta.deliveryDistrict || null)
        : (existingVal.deliveryDistrict || null),
    deliveryCity:
      meta.deliveryCity !== undefined
        ? (meta.deliveryCity || null)
        : (existingVal.deliveryCity || null),
    shippingFeePaise:
      meta.shippingFeePaise !== undefined
        ? (meta.shippingFeePaise ?? null)
        : (existingVal.shippingFeePaise ?? null),
    shippingRatePerUnitPaise:
      meta.shippingRatePerUnitPaise !== undefined
        ? (meta.shippingRatePerUnitPaise ?? null)
        : (existingVal.shippingRatePerUnitPaise ?? null),
    shippingLocality:
      meta.shippingLocality !== undefined
        ? (meta.shippingLocality || null)
        : (existingVal.shippingLocality || null),
    shippingPincode:
      meta.shippingPincode !== undefined
        ? (meta.shippingPincode || null)
        : (existingVal.shippingPincode || null),
    isBangaloreSpecial:
      meta.isBangaloreSpecial !== undefined
        ? Boolean(meta.isBangaloreSpecial)
        : Boolean(existingVal.isBangaloreSpecial),
    createdAt:
      meta.createdAt ||
      (typeof existingVal.createdAt === "string"
        ? existingVal.createdAt
        : new Date().toISOString()),
  };

  const { error } = await supabase.from("site_settings").upsert({
    key,
    value: mergedValue,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Failed to save order metadata:", error);
    return false;
  }
  return true;
}

/**
 * Retrieves metadata for a single order.
 */
export async function getOrderMetadata(orderId: string): Promise<OrderMetadata | null> {
  const supabase = createSupabaseAdminClient();
  const key = `${ORDER_META_PREFIX}${orderId}`;

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error || !data?.value || typeof data.value !== "object") {
    return null;
  }

  return parseOrderMetadata(orderId, data.value);
}

/**
 * Batch retrieves metadata for multiple orders for listing efficiency.
 */
export async function batchGetOrderMetadata(
  orderIds: string[]
): Promise<Map<string, OrderMetadata>> {
  const map = new Map<string, OrderMetadata>();
  if (orderIds.length === 0) return map;

  const supabase = createSupabaseAdminClient();
  const keys = orderIds.map((id) => `${ORDER_META_PREFIX}${id}`);

  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", keys);

  if (error || !data) return map;

  for (const row of data) {
    if (row.value && typeof row.value === "object") {
      const orderId = String(
        (row.value as Record<string, unknown>).orderId ||
          row.key.replace(ORDER_META_PREFIX, "")
      );
      const parsed = parseOrderMetadata(orderId, row.value);
      if (parsed) {
        map.set(orderId, parsed);
      }
    }
  }

  return map;
}
