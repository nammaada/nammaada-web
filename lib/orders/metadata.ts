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
};

const ORDER_META_PREFIX = "order_meta_";

/**
 * Saves immutable operational order metadata (Payment Method & Item Delivery Type snapshots).
 * Stored under site_settings key `order_meta_${orderId}`.
 */
export async function saveOrderMetadata(meta: OrderMetadata): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  const key = `${ORDER_META_PREFIX}${meta.orderId}`;

  const { error } = await supabase.from("site_settings").upsert({
    key,
    value: {
      orderId: meta.orderId,
      paymentMethod: meta.paymentMethod,
      itemsDeliveryType: meta.itemsDeliveryType,
      customerEmailSent: Boolean(meta.customerEmailSent),
      adminEmailSent: Boolean(meta.adminEmailSent),
      userId: meta.userId || null,
      createdAt: meta.createdAt || new Date().toISOString(),
    },
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

  const val = data.value as Record<string, unknown>;
  return {
    orderId,
    paymentMethod: val.paymentMethod === "COD" ? "COD" : "RAZORPAY",
    itemsDeliveryType: (val.itemsDeliveryType as Record<string, DeliveryType>) || {},
    customerEmailSent: Boolean(val.customerEmailSent),
    adminEmailSent: Boolean(val.adminEmailSent),
    userId: typeof val.userId === "string" ? val.userId : undefined,
    createdAt: typeof val.createdAt === "string" ? val.createdAt : undefined,
  };
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
      const val = row.value as Record<string, unknown>;
      const orderId = String(val.orderId || row.key.replace(ORDER_META_PREFIX, ""));
      map.set(orderId, {
        orderId,
        paymentMethod: val.paymentMethod === "COD" ? "COD" : "RAZORPAY",
        itemsDeliveryType: (val.itemsDeliveryType as Record<string, DeliveryType>) || {},
        customerEmailSent: Boolean(val.customerEmailSent),
        adminEmailSent: Boolean(val.adminEmailSent),
        userId: typeof val.userId === "string" ? val.userId : undefined,
        createdAt: typeof val.createdAt === "string" ? val.createdAt : undefined,
      });
    }
  }

  return map;
}
