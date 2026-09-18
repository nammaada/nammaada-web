import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendOrderConfirmationWhatsApp } from "@/lib/whatsapp/server";
import { sendOrderConfirmationEmails } from "@/lib/email/server";
import type { EmailOrderItem } from "@/lib/email/types";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
    }

    const isValid = verifyRazorpayWebhookSignature({ rawBody, signature });
    if (!isValid) {
      console.warn("[Razorpay Webhook] Invalid webhook signature rejected.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    const supabase = createSupabaseAdminClient();

    // -------------------------------------------------------------------------
    // 1. PAYMENT CAPTURED or ORDER PAID
    // -------------------------------------------------------------------------
    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = event.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id || event.payload?.order?.entity?.id;
      const razorpayPaymentId = paymentEntity?.id;

      if (!razorpayOrderId) {
        console.warn("[Razorpay Webhook] Missing razorpayOrderId in payload for event:", eventType);
        return NextResponse.json({ received: true });
      }

      // Look up payment and order in database
      const { data: payment } = await supabase
        .from("payments")
        .select("id, status, order_id, orders(*, order_items(*))")
        .eq("razorpay_order_id", razorpayOrderId)
        .maybeSingle();

      if (!payment || !payment.orders) {
        console.warn("[Razorpay Webhook] No matching order found for razorpay_order_id:", razorpayOrderId);
        return NextResponse.json({ received: true });
      }

      const order = payment.orders as unknown as {
        id: string;
        order_number: string;
        subtotal_paise: number;
        shipping_fee_paise: number;
        total_amount_paise: number;
        payment_status: string;
        order_status: string;
        customer_name_snapshot: string;
        customer_phone_snapshot: string;
        customer_email_snapshot: string | null;
        delivery_address_snapshot: string;
        delivery_district_city: string;
        delivery_state: string;
        delivery_pincode: string;
        order_items: Array<{
          product_id: string | null;
          product_variant_id: string | null;
          product_name_snapshot: string;
          variant_name_snapshot: string | null;
          quantity: number;
          unit_price_paise: number;
          line_total_paise: number;
        }>;
      };

      // Idempotency: If already marked paid, acknowledge without double-processing
      if (order.payment_status === "paid") {
        return NextResponse.json({ received: true, already_processed: true });
      }

      // A. Mark Payment as Paid
      await supabase
        .from("payments")
        .update({
          status: "paid",
          signature_verified: true,
          razorpay_payment_id: razorpayPaymentId || paymentEntity?.id || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      // B. Mark Order as Paid and Processing
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          order_status: "processing",
          payment_method: "RAZORPAY",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      // C. Atomically Decrement Stock
      if (Array.isArray(order.order_items)) {
        for (const item of order.order_items) {
          if (item.product_id) {
            try {
              await supabase.rpc("decrement_stock", {
                p_product_id: item.product_id,
                p_product_variant_id: item.product_variant_id,
                p_quantity: item.quantity,
              });
            } catch (err) {
              console.error("[Razorpay Webhook] Stock decrement error:", err);
            }
          }
        }
      }

      // D. Send WhatsApp Confirmation
      if (order.customer_phone_snapshot && Array.isArray(order.order_items)) {
        const whatsappItems = order.order_items.map((i) => ({
          name: i.product_name_snapshot,
          variantName: i.variant_name_snapshot,
          quantity: i.quantity,
          unitPricePaise: i.unit_price_paise,
        }));

        sendOrderConfirmationWhatsApp({
          phone: order.customer_phone_snapshot,
          orderNumber: order.order_number,
          totalAmountPaise: order.total_amount_paise,
          items: whatsappItems,
        }).catch((wErr) => console.error("[Razorpay Webhook] WhatsApp dispatch error:", wErr));
      }

      // E. Send Order Confirmation Emails (Customer + Admin)
      if (Array.isArray(order.order_items)) {
        const emailItems: EmailOrderItem[] = order.order_items.map((i) => ({
          name: i.product_name_snapshot,
          variantName: i.variant_name_snapshot,
          quantity: i.quantity,
          unitPricePaise: i.unit_price_paise,
          lineTotalPaise: i.line_total_paise || i.quantity * i.unit_price_paise,
        }));

        sendOrderConfirmationEmails({
          orderId: order.id,
          orderNumber: order.order_number,
          orderDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          customerName: order.customer_name_snapshot || "",
          customerPhone: order.customer_phone_snapshot || "",
          customerEmail: order.customer_email_snapshot || null,
          deliveryAddress: order.delivery_address_snapshot || "",
          deliveryDistrictCity: order.delivery_district_city || "",
          deliveryState: order.delivery_state || "",
          deliveryCountry: "India",
          deliveryPincode: order.delivery_pincode || "",
          subtotalPaise: order.subtotal_paise || order.total_amount_paise,
          shippingFeePaise: order.shipping_fee_paise || 0,
          totalAmountPaise: order.total_amount_paise,
          paymentMethod: "ONLINE",
          paymentStatus: "paid",
          orderStatus: "confirmed",
          razorpayPaymentId: razorpayPaymentId || paymentEntity?.id || null,
          items: emailItems,
        }).catch((eErr) => console.error("[Razorpay Webhook] Email dispatch error:", eErr));
      }

      // F. Revalidate Caches
      revalidatePath("/admin/orders");
      revalidatePath("/admin/payments");
      revalidatePath(`/admin/orders/${order.id}`);
      revalidatePath("/products");
      revalidatePath("/");

      return NextResponse.json({ received: true, processed: true });
    }

    // -------------------------------------------------------------------------
    // 2. PAYMENT FAILED
    // -------------------------------------------------------------------------
    if (eventType === "payment.failed") {
      const paymentEntity = event.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const razorpayPaymentId = paymentEntity?.id;
      const failureReason =
        paymentEntity?.error_description ||
        paymentEntity?.error_reason ||
        paymentEntity?.error_code ||
        "Payment attempt failed";

      if (!razorpayOrderId) {
        console.warn("[Razorpay Webhook] payment.failed: Missing razorpayOrderId in payload.");
        return NextResponse.json({ received: true });
      }

      // Look up payment and order in database
      const { data: payment } = await supabase
        .from("payments")
        .select("id, status, order_id, orders(id, order_number, payment_status, order_status)")
        .eq("razorpay_order_id", razorpayOrderId)
        .maybeSingle();

      if (!payment || !payment.orders) {
        console.warn(
          "[Razorpay Webhook] payment.failed: No matching order found for razorpay_order_id:",
          razorpayOrderId
        );
        return NextResponse.json({ received: true });
      }

      const order = payment.orders as unknown as {
        id: string;
        order_number: string;
        payment_status: string;
        order_status: string;
      };

      // Guard: Do not overwrite an already successful payment status
      // (e.g., if a retry succeeded earlier or webhooks arrived out of order)
      if (order.payment_status === "paid") {
        console.info(
          `[Razorpay Webhook] payment.failed received for already-paid order #${order.order_number}. Preserving paid status.`
        );
        return NextResponse.json({ received: true, ignored: "Order is already paid" });
      }

      // A. Update Payment record to failed
      await supabase
        .from("payments")
        .update({
          status: "failed",
          razorpay_payment_id: razorpayPaymentId || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      // B. Update Order payment_status to failed
      await supabase
        .from("orders")
        .update({
          payment_status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      console.warn(
        `[Razorpay Webhook] Order #${order.order_number} marked payment_status="failed". Reason: ${failureReason} (Payment ID: ${razorpayPaymentId || "unknown"})`
      );

      // C. Revalidate Caches
      revalidatePath("/admin/orders");
      revalidatePath("/admin/payments");
      revalidatePath(`/admin/orders/${order.id}`);

      return NextResponse.json({ received: true, status: "payment_marked_failed" });
    }

    // Default acknowledgement for any other Razorpay events
    return NextResponse.json({ received: true, ignored: `Unhandled event ${eventType}` });
  } catch (err) {
    console.error("[Razorpay Webhook] Error processing webhook:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
