import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendOrderConfirmationWhatsApp } from "@/lib/whatsapp/server";

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

    // Handle payment.captured or order.paid
    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = event.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id || event.payload?.order?.entity?.id;
      const razorpayPaymentId = paymentEntity?.id;

      if (!razorpayOrderId) {
        return NextResponse.json({ received: true });
      }

      const supabase = createSupabaseAdminClient();

      // 1. Look up payment and order in database
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
        total_amount_paise: number;
        payment_status: string;
        customer_phone_snapshot: string;
        order_items: Array<{
          product_id: string | null;
          product_variant_id: string | null;
          product_name_snapshot: string;
          variant_name_snapshot: string | null;
          quantity: number;
          unit_price_paise: number;
        }>;
      };

      // Idempotency: If already paid, acknowledge without re-processing
      if (order.payment_status === "paid") {
        return NextResponse.json({ received: true, already_processed: true });
      }

      // 2. Mark Payment as Paid
      await supabase
        .from("payments")
        .update({
          status: "paid",
          signature_verified: true,
          razorpay_payment_id: razorpayPaymentId || paymentEntity?.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      // 3. Mark Order as Paid
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          order_status: "processing",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      // 4. Decrement Stock
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

      // 5. Send WhatsApp Confirmation
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

      // 6. Revalidate Caches
      revalidatePath("/admin/orders");
      revalidatePath("/admin/payments");
      revalidatePath(`/admin/orders/${order.id}`);
      revalidatePath("/products");
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Razorpay Webhook] Error processing webhook:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
