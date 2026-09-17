"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type CustomerOrderItem = {
  id: string;
  productName: string;
  variantName: string | null;
  unitPricePaise: number;
  quantity: number;
  lineTotalPaise: number;
};

export type CustomerOrder = {
  id: string;
  orderNumber: string;
  subtotalPaise: number;
  shippingFeePaise: number;
  totalAmountPaise: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  deliveryAddress: string;
  city: string;
  pincode: string;
  trackingId: string | null;
  trackingUrl: string | null;
  courierName: string | null;
  createdAt: string;
  items: CustomerOrderItem[];
};

export async function getCustomerOrdersAction(): Promise<{ ok: boolean; orders: CustomerOrder[]; message?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userErr } = await supabase.auth.getUser();

    if (userErr || !userData.user || !userData.user.email) {
      return { ok: false, orders: [], message: "Not authenticated" };
    }

    const email = userData.user.email.trim().toLowerCase();
    const adminSupabase = createSupabaseAdminClient();

    // Query orders for this customer's email
    const { data: dbOrders, error: ordersErr } = await adminSupabase
      .from("orders")
      .select(`
        id,
        order_number,
        subtotal_paise,
        shipping_fee_paise,
        total_amount_paise,
        order_status,
        payment_status,
        payment_method,
        delivery_address_snapshot,
        delivery_district_city,
        delivery_pincode,
        tracking_id,
        tracking_url_snapshot,
        courier_name_snapshot,
        created_at,
        order_items (
          id,
          product_name_snapshot,
          variant_name_snapshot,
          unit_price_paise,
          quantity,
          line_total_paise
        )
      `)
      .ilike("customer_email_snapshot", email)
      .order("created_at", { ascending: false });

    if (ordersErr) {
      console.error("Error fetching customer orders:", ordersErr);
      return { ok: false, orders: [], message: "Could not retrieve orders" };
    }

    const orders: CustomerOrder[] = (dbOrders || []).map((ord) => ({
      id: ord.id,
      orderNumber: ord.order_number,
      subtotalPaise: ord.subtotal_paise,
      shippingFeePaise: ord.shipping_fee_paise,
      totalAmountPaise: ord.total_amount_paise,
      orderStatus: ord.order_status,
      paymentStatus: ord.payment_status,
      paymentMethod: ord.payment_method || "ONLINE",
      deliveryAddress: ord.delivery_address_snapshot,
      city: ord.delivery_district_city,
      pincode: ord.delivery_pincode,
      trackingId: ord.tracking_id,
      trackingUrl: ord.tracking_url_snapshot,
      courierName: ord.courier_name_snapshot,
      createdAt: ord.created_at,
      items: ((ord.order_items as unknown as Array<{
        id: string;
        product_name_snapshot: string;
        variant_name_snapshot: string | null;
        unit_price_paise: number;
        quantity: number;
        line_total_paise: number;
      }>) || []).map((item) => ({
        id: item.id,
        productName: item.product_name_snapshot,
        variantName: item.variant_name_snapshot,
        unitPricePaise: item.unit_price_paise,
        quantity: item.quantity,
        lineTotalPaise: item.line_total_paise,
      })),
    }));

    return { ok: true, orders };
  } catch (err) {
    console.error("Exception fetching customer orders:", err);
    return { ok: false, orders: [], message: "Failed to load orders" };
  }
}

export async function registerCustomerAction(input: {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}): Promise<{ ok: boolean; message?: string }> {
  try {
    const adminSupabase = createSupabaseAdminClient();
    const cleanEmail = input.email.trim().toLowerCase();

    // Directly create customer with email_confirm: true (no verification codes/emails required!)
    const { error: createErr } = await adminSupabase.auth.admin.createUser({
      email: cleanEmail,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        full_name: input.fullName.trim(),
        phone: input.phone?.trim() || "",
      },
    });

    if (createErr) {
      if (
        createErr.message.toLowerCase().includes("already registered") ||
        createErr.message.toLowerCase().includes("already exists")
      ) {
        // If user already exists, update and confirm them
        const { data: listData } = await adminSupabase.auth.admin.listUsers();
        const existing = listData?.users.find((u) => u.email?.toLowerCase() === cleanEmail);
        if (existing) {
          await adminSupabase.auth.admin.updateUserById(existing.id, {
            password: input.password,
            email_confirm: true,
            user_metadata: {
              full_name: input.fullName.trim(),
              phone: input.phone?.trim() || "",
            },
          });
          return { ok: true };
        }
      }
      return { ok: false, message: createErr.message };
    }

    return { ok: true };
  } catch (err) {
    console.error("Registration exception:", err);
    return { ok: false, message: "Could not create account. Please try again." };
  }
}

export async function autoConfirmCustomerAction(email: string): Promise<boolean> {
  try {
    const adminSupabase = createSupabaseAdminClient();
    const cleanEmail = email.trim().toLowerCase();
    const { data: listData } = await adminSupabase.auth.admin.listUsers();
    const existing = listData?.users.find((u) => u.email?.toLowerCase() === cleanEmail);
    if (existing) {
      await adminSupabase.auth.admin.updateUserById(existing.id, { email_confirm: true });
      return true;
    }
  } catch {}
  return false;
}

