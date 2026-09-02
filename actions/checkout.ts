"use server";

import { z } from "zod";
import { checkoutSchema } from "@/lib/checkout/schema";
import { getSafeErrorMessage } from "@/lib/server/errors";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { quantitySchema, uuidSchema } from "@/lib/validation/schemas";

const orderSubmissionSchema = z.object({
  idempotencyKey: uuidSchema,
  checkout: checkoutSchema,
  items: z.array(z.object({
    productId: uuidSchema,
    variantId: uuidSchema.nullable(),
    quantity: quantitySchema,
    unitPricePaise: z.number().int().nonnegative().safe(),
  })).min(1).max(100),
});

type OrderResultCode =
  | "created"
  | "duplicate"
  | "price_changed"
  | "item_unavailable"
  | "stock_unavailable"
  | "variant_required"
  | "delivery_unavailable"
  | "validation_error";

export type CreatePendingOrderResult =
  | { ok: true; status: "created" | "duplicate"; orderNumber: string }
  | { ok: false; message: string; fieldErrors?: Partial<Record<string, string>> };

function messageForCode(code: OrderResultCode): string {
  switch (code) {
    case "price_changed":
      return "A product price changed. Please review your cart and try again.";
    case "item_unavailable":
      return "One of the selections in your cart is no longer available.";
    case "stock_unavailable":
      return "One of the selections in your cart has insufficient availability.";
    case "variant_required":
      return "Please choose an option for each product before continuing.";
    case "delivery_unavailable":
      return "Delivery is not currently available for this order address or selection.";
    case "validation_error":
      return "Please review your details and cart before continuing.";
    default:
      return "Unable to create the pending order. Please try again.";
  }
}

export async function createPendingOrder(input: unknown): Promise<CreatePendingOrderResult> {
  const parsed = orderSubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Please review your details and cart before continuing." };
  }

  try {
    const { checkout, items } = parsed.data;
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.rpc("create_pending_order", {
      p_idempotency_key: parsed.data.idempotencyKey,
      p_full_name: checkout.fullName,
      p_phone: checkout.phone,
      p_email: checkout.email ?? null,
      p_address: checkout.address,
      p_city: checkout.city,
      p_state: checkout.state,
      p_pincode: checkout.pincode,
      p_cart: items.map((item) => ({
        product_id: item.productId,
        variant_id: item.variantId,
        quantity: item.quantity,
        unit_price_paise: item.unitPricePaise,
      })),
    });

    if (error) {
      return { ok: false, message: getSafeErrorMessage(error) };
    }

    const row = Array.isArray(data) ? data[0] as { result_code?: string; order_number?: string } | undefined : undefined;
    if (!row?.result_code) {
      return { ok: false, message: "Unable to create the pending order. Please try again." };
    }
    const code = row.result_code as OrderResultCode;
    if (code === "created" || code === "duplicate") {
      if (!row.order_number) return { ok: false, message: "Unable to create the pending order. Please try again." };
      return { ok: true, status: code, orderNumber: row.order_number };
    }
    return { ok: false, message: messageForCode(code) };
  } catch (error) {
    return { ok: false, message: getSafeErrorMessage(error) };
  }
}
