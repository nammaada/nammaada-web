"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { checkoutSchema } from "@/lib/checkout/schema";
import { createRazorpayOrder, getRazorpayCredentials, verifyRazorpaySignature } from "@/lib/razorpay/server";
import { getSafeErrorMessage } from "@/lib/server/errors";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { quantitySchema, uuidSchema } from "@/lib/validation/schemas";
import { sendOrderConfirmationWhatsApp } from "@/lib/whatsapp/server";

const checkoutSessionInputSchema = z.object({
  idempotencyKey: uuidSchema,
  checkout: checkoutSchema,
  items: z
    .array(
      z.object({
        productId: uuidSchema,
        variantId: uuidSchema.nullable().optional(),
        quantity: quantitySchema,
      })
    )
    .min(1, "Your cart is empty.")
    .max(50, "Too many items in cart."),
});

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `NA-${timestamp}${random}`;
}

export type CreateRazorpaySessionResult =
  | {
      ok: true;
      razorpayOrderId: string;
      razorpayKeyId: string;
      amountPaise: number;
      currency: string;
      orderNumber: string;
    }
  | {
      ok: false;
      message: string;
    };

/**
 * Creates an authoritative pending order in the database and initiates a Razorpay Order.
 * CRITICAL SECURITY: All prices, subtotals, shipping, and totals are computed strictly
 * on the server from the database. Client prices are never accepted or trusted.
 */
export async function createRazorpayCheckoutSession(
  input: unknown
): Promise<CreateRazorpaySessionResult> {
  const parsed = checkoutSessionInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Please check your details and cart items before continuing." };
  }

  const { idempotencyKey, checkout, items } = parsed.data;
  const supabase = createSupabaseAdminClient();

  try {
    const { keyId } = getRazorpayCredentials();

    // 1. Check if an order already exists for this idempotency key
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("order_id, razorpay_order_id, amount_paise, status, orders(order_number, payment_status)")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (existingPayment && existingPayment.razorpay_order_id) {
      const orderData = existingPayment.orders as unknown as { order_number: string; payment_status: string } | null;
      if (orderData?.order_number && existingPayment.status !== "failed") {
        return {
          ok: true,
          razorpayOrderId: existingPayment.razorpay_order_id,
          razorpayKeyId: keyId,
          amountPaise: existingPayment.amount_paise,
          currency: "INR",
          orderNumber: orderData.order_number,
        };
      }
    }

    // 2. Fetch authoritative products and variants directly from the database
    const productIds = Array.from(new Set(items.map((i) => i.productId)));
    const { data: dbProducts, error: prodErr } = await supabase
      .from("products")
      .select("id, name, price_paise, stock_quantity, is_active, is_free_shipping, delivery_scope")
      .in("id", productIds)
      .eq("is_active", true);

    if (prodErr || !dbProducts || dbProducts.length === 0) {
      return { ok: false, message: "One or more items in your cart are no longer available." };
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Fetch variants if applicable
    const variantIds = items
      .map((i) => i.variantId)
      .filter((v): v is string => typeof v === "string" && v.length > 0);

    let variantMap = new Map<string, { id: string; name: string; sku: string | null; price_paise: number; stock_quantity: number; is_active: boolean }>();

    if (variantIds.length > 0) {
      const { data: dbVariants, error: varErr } = await supabase
        .from("product_variants")
        .select("id, product_id, name, sku, price_paise, stock_quantity, is_active")
        .in("id", variantIds)
        .eq("is_active", true);

      if (varErr || !dbVariants) {
        return { ok: false, message: "Selected product options are unavailable. Please review your cart." };
      }

      variantMap = new Map(dbVariants.map((v) => [v.id, v]));
    }

    // 3. Validate stock and calculate authoritative prices
    let subtotalPaise = 0;
    let allFreeShipping = true;
    const resolvedItems: Array<{
      productId: string;
      variantId: string | null;
      productName: string;
      variantName: string | null;
      sku: string | null;
      unitPricePaise: number;
      quantity: number;
      lineTotalPaise: number;
    }> = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return { ok: false, message: "An item in your cart is no longer available." };
      }

      let unitPricePaise = product.price_paise;
      let availableStock = product.stock_quantity;
      let variantName: string | null = null;
      let sku: string | null = null;

      if (item.variantId) {
        const variant = variantMap.get(item.variantId);
        if (!variant) {
          return { ok: false, message: `The selected variant for "${product.name}" is no longer available.` };
        }
        unitPricePaise = variant.price_paise;
        availableStock = variant.stock_quantity;
        variantName = variant.name;
        sku = variant.sku;
      }

      if (availableStock < item.quantity) {
        return {
          ok: false,
          message: `Only ${availableStock} units of "${product.name}${variantName ? ` (${variantName})` : ""}" are available in stock.`,
        };
      }

      if (!product.is_free_shipping) {
        allFreeShipping = false;
      }

      const lineTotal = unitPricePaise * item.quantity;
      subtotalPaise += lineTotal;

      resolvedItems.push({
        productId: product.id,
        variantId: item.variantId ?? null,
        productName: product.name,
        variantName,
        sku,
        unitPricePaise,
        quantity: item.quantity,
        lineTotalPaise: lineTotal,
      });
    }

    // 4. Calculate authoritative shipping fee
    let shippingFeePaise = 0;
    if (!allFreeShipping) {
      const customerState = checkout.state.trim().toLowerCase();
      const { data: shippingRules } = await supabase
        .from("shipping_rules")
        .select("state_name, charge_paise")
        .eq("is_active", true);

      const matchingRule = shippingRules?.find(
        (r) => r.state_name.trim().toLowerCase() === customerState
      );

      if (matchingRule) {
        shippingFeePaise = matchingRule.charge_paise;
      } else {
        // Standard baseline delivery charge across India if state not explicitly customized
        shippingFeePaise = 0; // Or standard default rate
      }
    }

    const totalAmountPaise = subtotalPaise + shippingFeePaise;
    const orderNumber = generateOrderNumber();

    // 5. Insert Customer Record
    const { data: customer, error: custErr } = await supabase
      .from("customers")
      .insert({
        full_name: checkout.fullName.trim(),
        phone: checkout.phone.trim(),
        email: checkout.email?.trim() || null,
        address: checkout.address.trim(),
        district_city: checkout.city.trim(),
        state: checkout.state.trim(),
        pincode: checkout.pincode.trim(),
      })
      .select("id")
      .single();

    if (custErr || !customer) {
      console.error("Customer creation error:", custErr);
      return { ok: false, message: "Unable to record customer details. Please try again." };
    }

    // 6. Insert Order Record
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: customer.id,
        subtotal_paise: subtotalPaise,
        shipping_fee_paise: shippingFeePaise,
        total_amount_paise: totalAmountPaise,
        order_status: "pending",
        payment_status: "pending",
        customer_name_snapshot: checkout.fullName.trim(),
        customer_phone_snapshot: checkout.phone.trim(),
        customer_email_snapshot: checkout.email?.trim() || null,
        delivery_address_snapshot: checkout.address.trim(),
        delivery_district_city: checkout.city.trim(),
        delivery_state: checkout.state.trim(),
        delivery_pincode: checkout.pincode.trim(),
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      console.error("Order creation error:", orderErr);
      return { ok: false, message: "Could not create order. Please try again." };
    }

    // 7. Insert Order Items Record
    const itemInserts = resolvedItems.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_variant_id: item.variantId,
      product_name_snapshot: item.productName,
      variant_name_snapshot: item.variantName,
      sku_snapshot: item.sku,
      unit_price_paise: item.unitPricePaise,
      quantity: item.quantity,
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(itemInserts);
    if (itemsErr) {
      console.error("Order items creation error:", itemsErr);
      return { ok: false, message: "Could not record order items. Please try again." };
    }

    // 8. Create Razorpay Order via Razorpay API
    const razorpayOrder = await createRazorpayOrder({
      amountPaise: totalAmountPaise,
      receipt: orderNumber,
      notes: {
        orderId: order.id,
        orderNumber,
        customerName: checkout.fullName,
        phone: checkout.phone,
      },
    });

    // 9. Insert/Update Payment Record
    const { error: payErr } = await supabase.from("payments").insert({
      order_id: order.id,
      idempotency_key: idempotencyKey,
      razorpay_order_id: razorpayOrder.id,
      amount_paise: totalAmountPaise,
      currency: "INR",
      status: "pending",
      signature_verified: false,
    });

    if (payErr) {
      console.error("Payment record creation error:", payErr);
    }

    return {
      ok: true,
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: keyId,
      amountPaise: totalAmountPaise,
      currency: "INR",
      orderNumber,
    };
  } catch (error) {
    console.error("Checkout session creation exception:", error);
    return { ok: false, message: getSafeErrorMessage(error) };
  }
}

const verifyPaymentInputSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
  orderNumber: z.string().min(1),
});

export type VerifyPaymentResult =
  | { ok: true; orderNumber: string }
  | { ok: false; message: string };

/**
 * Verifies Razorpay HMAC signature on the server, transitions order to paid,
 * atomically decrements stock, and triggers WhatsApp notification.
 */
export async function verifyAndFinalizePayment(
  input: unknown
): Promise<VerifyPaymentResult> {
  const parsed = verifyPaymentInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid payment verification details." };
  }

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderNumber } = parsed.data;

  // 1. Strict Server-Side HMAC Signature Verification
  const isValidSignature = verifyRazorpaySignature({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

  const supabase = createSupabaseAdminClient();

  if (!isValidSignature) {
    console.error(`Invalid payment signature for order #${orderNumber}, payment ${razorpayPaymentId}`);
    // Record failed attempt in payments table
    await supabase
      .from("payments")
      .update({
        status: "failed",
        razorpay_payment_id: razorpayPaymentId,
      })
      .eq("razorpay_order_id", razorpayOrderId);

    return {
      ok: false,
      message: "Payment signature verification failed. If your account was debited, please contact support with payment ID: " + razorpayPaymentId,
    };
  }

  try {
    // 2. Lookup Order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, order_number, total_amount_paise, payment_status, customer_phone_snapshot, order_items(id, product_id, product_variant_id, product_name_snapshot, variant_name_snapshot, quantity, unit_price_paise)")
      .eq("order_number", orderNumber)
      .maybeSingle();

    if (orderErr || !order) {
      return { ok: false, message: "Order not found. Please contact support." };
    }

    // Idempotency: If already paid, return success immediately
    if (order.payment_status === "paid") {
      return { ok: true, orderNumber: order.order_number };
    }

    // 3. Mark Payment as Paid & Verified
    await supabase
      .from("payments")
      .update({
        status: "paid",
        signature_verified: true,
        razorpay_payment_id: razorpayPaymentId,
        updated_at: new Date().toISOString(),
      })
      .eq("razorpay_order_id", razorpayOrderId);

    // 4. Mark Order as Paid & Processing
    await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        order_status: "processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    // 5. Atomically decrement stock for each item using private.decrement_stock
    const orderItems = (order.order_items as unknown as Array<{
      product_id: string | null;
      product_variant_id: string | null;
      product_name_snapshot: string;
      variant_name_snapshot: string | null;
      quantity: number;
      unit_price_paise: number;
    }>) || [];

    for (const item of orderItems) {
      if (item.product_id) {
        try {
          await supabase.rpc("decrement_stock", {
            p_product_id: item.product_id,
            p_product_variant_id: item.product_variant_id,
            p_quantity: item.quantity,
          });
        } catch (stockErr) {
          console.error("Stock decrement error for item:", item, stockErr);
        }
      }
    }

    // 6. Trigger WhatsApp order confirmation message
    if (order.customer_phone_snapshot) {
      const whatsappItems = orderItems.map((i) => ({
        name: i.product_name_snapshot,
        variantName: i.variant_name_snapshot,
        quantity: i.quantity,
        unitPricePaise: i.unit_price_paise,
      }));

      // Fire and log asynchronously
      sendOrderConfirmationWhatsApp({
        phone: order.customer_phone_snapshot,
        orderNumber: order.order_number,
        totalAmountPaise: order.total_amount_paise,
        items: whatsappItems,
      }).catch((wErr) => console.error("WhatsApp notification dispatch failed:", wErr));
    }

    // 7. Revalidate admin and product caches
    revalidatePath("/admin/orders");
    revalidatePath("/admin/payments");
    revalidatePath(`/admin/orders/${order.id}`);
    revalidatePath("/products");
    revalidatePath("/");

    return { ok: true, orderNumber: order.order_number };
  } catch (error) {
    console.error("Payment finalization error:", error);
    return { ok: false, message: getSafeErrorMessage(error) };
  }
}
