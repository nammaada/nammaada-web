import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Mail, UserCheck, PackageCheck, CreditCard, ShieldCheck, ShieldAlert } from "lucide-react";
import { updateOrder } from "@/actions/admin";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminRow, adminRows, formatINR } from "@/lib/admin/data";
import { getOrderMetadata } from "@/lib/orders/metadata";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const instant = false;

type Order = {
  id: string;
  order_number: string;
  customer_id: string | null;
  subtotal_paise: number;
  shipping_fee_paise: number;
  total_amount_paise: number;
  order_status: string;
  payment_status: string;
  customer_name_snapshot: string;
  customer_phone_snapshot: string;
  customer_email_snapshot: string | null;
  delivery_address_snapshot: string;
  delivery_district_city: string;
  delivery_state: string;
  delivery_pincode: string;
  courier_partner_id: string | null;
  courier_name_snapshot: string | null;
  tracking_id: string | null;
  tracking_url_snapshot: string | null;
  created_at: string;
};

type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name_snapshot: string;
  variant_name_snapshot: string | null;
  sku_snapshot: string | null;
  unit_price_paise: number;
  quantity: number;
  line_total_paise: number;
};

type PaymentRecord = {
  id: string;
  order_id: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  signature_verified: boolean;
  status: string;
  amount_paise: number;
  currency: string;
  created_at: string;
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;

  // Fetch order, items, metadata, and payment record in parallel
  const supabase = createSupabaseAdminClient();
  const [order, allItems, orderMeta, paymentResult] = await Promise.all([
    adminRow<Order>("admin_orders", id),
    adminRows<OrderItem>("admin_order_items"),
    getOrderMetadata(id),
    supabase
      .from("payments")
      .select("id, order_id, razorpay_order_id, razorpay_payment_id, signature_verified, status, amount_paise, currency, created_at")
      .eq("order_id", id)
      .maybeSingle(),
  ]);

  if (!order) notFound();

  const items = allItems.filter((item) => item.order_id === id);

  // Payment record — null for COD orders which never insert a payments row
  const paymentRecord: PaymentRecord | null = paymentResult.data ?? null;
  if (paymentResult.error) {
    console.error("[OrderDetail] Failed to fetch payment record for order", id, paymentResult.error);
  }

  // Authoritative payment method from metadata snapshot
  const isCod = orderMeta?.paymentMethod === "COD";

  return (
    <>
      <PageHeader
        action={
          <Link href="/admin/orders">
            <Button size="sm" variant="secondary">
              <ArrowLeft size={16} />
              <span>Back to orders</span>
            </Button>
          </Link>
        }
        breadcrumbs={[
          { label: "Orders", href: "/admin/orders" },
          { label: order.order_number },
        ]}
        description={`Placed on ${new Date(order.created_at).toLocaleDateString("en-IN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`}
        eyebrow="OPERATIONS"
        title={order.order_number}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] items-start">
        {/* Left Column: Order Items & Delivery Info */}
        <div className="grid gap-6">
          {/* Order Items Table */}
          <Card className="p-6 shadow-xs">
            <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <PackageCheck className="size-5 text-primary" /> Order Items ({items.length})
            </h2>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-secondary/60 text-xs font-bold tracking-wider uppercase text-muted-foreground">
                  <tr>
                    <th className="p-3.5">Item</th>
                    <th className="p-3.5">Delivery Type</th>
                    <th className="p-3.5 text-right">Unit price</th>
                    <th className="p-3.5 text-center">Qty</th>
                    <th className="p-3.5 text-right">Line total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item) => {
                    const itemDeliveryType =
                      (item.product_id && orderMeta?.itemsDeliveryType[item.product_id]) ||
                      "INDIA_WIDE";

                    return (
                      <tr key={item.id}>
                        <td className="p-3.5">
                          <p className="font-semibold text-foreground">{item.product_name_snapshot}</p>
                          {item.variant_name_snapshot && (
                            <p className="text-xs text-muted-foreground">Variant: {item.variant_name_snapshot}</p>
                          )}
                          {item.sku_snapshot && (
                            <p className="text-[11px] font-mono text-muted-foreground/80">SKU: {item.sku_snapshot}</p>
                          )}
                        </td>
                        <td className="p-3.5">
                          {itemDeliveryType === "RESTRICTED_LOCATION" ? (
                            <span className="rounded-md bg-amber-500/15 text-amber-900 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold inline-block">
                              Restricted Location
                            </span>
                          ) : (
                            <span className="rounded-md bg-secondary text-muted-foreground border border-border px-2 py-0.5 text-[10px] font-medium inline-block">
                              India Wide
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right font-medium text-foreground">{formatINR(item.unit_price_paise)}</td>
                        <td className="p-3.5 text-center font-semibold text-foreground">{item.quantity}</td>
                        <td className="p-3.5 text-right font-semibold text-primary">{formatINR(item.line_total_paise)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="mt-6 border-t border-border pt-4 grid gap-2 max-w-xs ml-auto text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">{formatINR(order.subtotal_paise)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping Fee</span>
                <span className="font-medium text-foreground">{formatINR(order.shipping_fee_paise)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-primary">
                <span>Total Amount</span>
                <span>{formatINR(order.total_amount_paise)}</span>
              </div>
            </div>
          </Card>

          {/* Delivery & Customer Info */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Customer Details */}
            <Card className="p-6 shadow-xs">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <UserCheck className="size-5 text-primary" /> Customer Details
              </h2>
              <div className="grid gap-3 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Name</span>
                  <p className="font-semibold text-foreground mt-0.5">{order.customer_name_snapshot}</p>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Phone size={16} className="text-muted-foreground shrink-0" />
                  <a className="hover:text-primary transition-colors font-medium" href={`tel:${order.customer_phone_snapshot}`}>
                    {order.customer_phone_snapshot}
                  </a>
                </div>
                {order.customer_email_snapshot && (
                  <div className="flex items-center gap-2 text-foreground">
                    <Mail size={16} className="text-muted-foreground shrink-0" />
                    <a className="hover:text-primary transition-colors font-medium" href={`mailto:${order.customer_email_snapshot}`}>
                      {order.customer_email_snapshot}
                    </a>
                  </div>
                )}
              </div>
            </Card>

            {/* Shipping Address */}
            <Card className="p-6 shadow-xs">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="size-5 text-primary" /> Shipping Address
              </h2>
              <div className="text-sm text-foreground leading-relaxed">
                <p className="font-medium">{order.delivery_address_snapshot}</p>
                <p className="mt-1">
                  {order.delivery_district_city}, {order.delivery_state} — {order.delivery_pincode}
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Status & Fulfillment Actions */}
        <div className="grid gap-6">
          {/* Payment & Status summary card */}
          <Card className="p-6 shadow-xs">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <CreditCard className="size-5 text-primary" /> Payment & Status
            </h2>

            <div className="grid gap-4 mb-6">
              <div>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Payment Method</span>
                <div className="mt-1 flex items-center gap-2">
                  {isCod ? (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/15 text-amber-950 border border-amber-500/30 px-2.5 py-1 text-xs font-bold">
                      Cash on Delivery (COD)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/15 text-emerald-950 border border-emerald-500/30 px-2.5 py-1 text-xs font-bold">
                      Online (Razorpay)
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Payment Status</span>
                <div className="mt-1">
                  <StatusBadge status={order.payment_status} />
                </div>
              </div>

              <div>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Fulfillment Status</span>
                <div className="mt-1">
                  <StatusBadge status={order.order_status} />
                </div>
              </div>
            </div>

            {/* Update Status Form */}
            <form action={updateOrder} className="border-t border-border pt-4 grid gap-3">
              <input name="id" type="hidden" value={order.id} />
              <label className="text-xs font-semibold text-foreground">Update Order Status:</label>
              <select
                className="min-h-10 w-full rounded-lg border border-input bg-card px-3 text-sm font-medium text-foreground outline-none focus-visible:border-ring"
                defaultValue={order.order_status}
                name="order_status"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
              {/* COD-only: allow admin to update payment_status directly */}
              {isCod && (
                <>
                  <label className="text-xs font-semibold text-foreground">Update Payment Status (COD):</label>
                  <select
                    className="min-h-10 w-full rounded-lg border border-input bg-card px-3 text-sm font-medium text-foreground outline-none focus-visible:border-ring"
                    defaultValue={order.payment_status}
                    name="payment_status"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </>
              )}
              <Button size="sm" type="submit" variant="primary" className="w-full">
                Update status
              </Button>
            </form>
          </Card>

          {/* Payment Details Card — real DB values, no mock data */}
          <Card className="p-6 shadow-xs">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <CreditCard className="size-5 text-primary" /> Payment Details
            </h2>
            <div className="grid gap-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Amount</span>
                <p className="font-semibold text-foreground mt-0.5">{formatINR(order.total_amount_paise)}</p>
              </div>

              {!isCod && paymentRecord ? (
                /* Online order with a stored payment record */
                <>
                  <div>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Razorpay Order ID</span>
                    <p className="font-mono text-xs text-foreground mt-0.5 break-all">{paymentRecord.razorpay_order_id ?? "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Razorpay Payment ID</span>
                    <p className="font-mono text-xs text-foreground mt-0.5 break-all">{paymentRecord.razorpay_payment_id ?? "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Signature Verified</span>
                    <div className="mt-1">
                      {paymentRecord.signature_verified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-900 bg-emerald-900/10 rounded-full px-2.5 py-0.5">
                          <ShieldCheck size={13} /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 bg-amber-500/15 rounded-full px-2.5 py-0.5">
                          <ShieldAlert size={13} /> Pending
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Payment Date</span>
                    <p className="text-foreground mt-0.5">
                      {new Date(paymentRecord.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </>
              ) : !isCod && !paymentRecord ? (
                /* Online order but payment record not yet created (e.g. abandoned checkout) */
                <div>
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Razorpay Details</span>
                  <p className="text-xs text-muted-foreground mt-0.5">—</p>
                </div>
              ) : (
                /* COD order — Razorpay fields are not applicable */
                <div>
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Note</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Cash on Delivery — no online payment record.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
