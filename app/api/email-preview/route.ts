import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { renderCustomerOrderEmail } from "@/lib/email/templates/customer-order-email";
import { renderAdminOrderEmail } from "@/lib/email/templates/admin-order-email";
import { OrderEmailData, EmailOrderItem } from "@/lib/email/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "customer";
  const orderNumber = searchParams.get("orderNumber");

  try {
    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from("orders")
      .select("*, order_items(*), payments!payments_order_id_fkey(razorpay_payment_id, status)")
      .order("created_at", { ascending: false })
      .limit(1);

    if (orderNumber) {
      query = supabase
        .from("orders")
        .select("*, order_items(*), payments!payments_order_id_fkey(razorpay_payment_id, status)")
        .eq("order_number", orderNumber)
        .limit(1);
    }

    const { data: orders, error } = await query;
    if (error) {
      console.error("[Email Preview] Query error:", error);
    }
    const order = orders?.[0];

    if (!order) {
      return new NextResponse(
        `<div style="font-family: sans-serif; padding: 40px; text-align: center; color: #2b1719;">
          <h2>No Real Orders Found</h2>
          <p>There are no orders in the database yet. Place an order through checkout to preview emails with 100% real order data.</p>
        </div>`,
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

  const latestPayment = Array.isArray(order.payments) ? order.payments[0] : null;
  const isCod = order.payment_status === "pending";

  const emailItems: EmailOrderItem[] = (order.order_items || []).map((i: any) => ({
    name: i.product_name_snapshot,
    variantName: i.variant_name_snapshot,
    quantity: i.quantity,
    unitPricePaise: i.unit_price_paise,
    lineTotalPaise: i.line_total_paise || (i.quantity * i.unit_price_paise),
  }));

  const realOrderData: OrderEmailData = {
    orderId: order.id,
    orderNumber: order.order_number,
    orderDate: new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
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
    paymentMethod: isCod ? "COD" : "ONLINE",
    paymentStatus: order.payment_status as any,
    orderStatus: order.order_status,
    razorpayPaymentId: latestPayment?.razorpay_payment_id || null,
    items: emailItems,
  };

  const html = type.startsWith("admin")
    ? renderAdminOrderEmail(realOrderData)
    : renderCustomerOrderEmail(realOrderData);

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("[Email Preview Error]:", error);
    return new NextResponse(`<div style="padding:20px; font-family:sans-serif;">Error loading preview: ${String(error)}</div>`, { status: 500 });
  }
}

