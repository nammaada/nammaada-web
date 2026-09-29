import Link from "next/link";
import { connection } from "next/server";
import { Eye, MapPin } from "lucide-react";
import { updateOrder } from "@/actions/admin";
import { EmptyState } from "@/components/admin/empty-state";
import { MobileDataCard } from "@/components/admin/mobile-data-card";
import { OrderFilter } from "@/components/admin/order-filter";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminRows, formatINR } from "@/lib/admin/data";
import { batchGetOrderMetadata } from "@/lib/orders/metadata";

export const instant = false;

type OrderRow = {
  id: string;
  order_number: string;
  customer_name_snapshot: string;
  customer_phone_snapshot: string;
  delivery_district_city: string;
  delivery_state: string;
  delivery_pincode: string;
  total_amount_paise: number;
  order_status: string;
  payment_status: string;
  created_at: string;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_name_snapshot: string;
  quantity: number;
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentFilter?: string }>;
}) {
  await connection();
  const { paymentFilter = "all" } = await searchParams;

  const [orders, allItems] = await Promise.all([
    adminRows<OrderRow>("admin_orders"),
    adminRows<OrderItemRow>("admin_order_items"),
  ]);

  const orderMetaMap = await batchGetOrderMetadata(orders.map((o) => o.id));

  // Build item maps and determine payment method
  const enrichedOrders = orders.map((order) => {
    const meta = orderMetaMap.get(order.id);
    const isCod = meta?.paymentMethod === "COD" || order.order_number.startsWith("NA-COD");
    const paymentMethod = isCod ? "COD" : "RAZORPAY";

    const items = allItems.filter((item) => item.order_id === order.id);
    const productsSummary =
      items.length > 0
        ? items.map((i) => `${i.product_name_snapshot} (${i.quantity})`).join(", ")
        : "Delicacies";

    const deliveryLocation = `${order.delivery_district_city}, ${order.delivery_pincode}`;

    return {
      ...order,
      paymentMethod,
      productsSummary,
      deliveryLocation,
    };
  });

  // Apply Payment Status Filter (Requirement 16)
  const filteredOrders = enrichedOrders.filter((order) => {
    if (paymentFilter === "paid") {
      return order.payment_status === "paid";
    }
    if (paymentFilter === "pending") {
      return order.payment_status === "pending";
    }
    if (paymentFilter === "cod") {
      return order.paymentMethod === "COD";
    }
    return true;
  });

  return (
    <>
      <PageHeader
        action={<OrderFilter />}
        description="Review real guest checkout orders, delivery information, COD status, and operational fulfillment."
        eyebrow="OPERATIONS"
        title="Orders"
      />

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <Card className="overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-secondary/60 text-xs font-bold tracking-wider uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3.5">Order</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Products</th>
                  <th className="px-4 py-3.5">Delivery Location</th>
                  <th className="px-4 py-3.5">Payment Method</th>
                  <th className="px-4 py-3.5">Payment Status</th>
                  <th className="px-4 py-3.5">Order Status</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-secondary/30">
                    {/* Order ID */}
                    <td className="px-4 py-4">
                      <Link
                        className="font-semibold text-primary hover:underline font-mono text-xs block"
                        href={`/admin/orders/${row.id}`}
                      >
                        {row.order_number}
                      </Link>
                      <span className="text-xs font-semibold text-foreground">
                        {formatINR(row.total_amount_paise)}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-4">
                      <p className="font-semibold text-foreground text-xs">{row.customer_name_snapshot}</p>
                      <p className="text-[11px] text-muted-foreground">{row.customer_phone_snapshot}</p>
                    </td>

                    {/* Products */}
                    <td className="px-4 py-4 max-w-[200px]">
                      <p className="text-xs text-foreground font-medium truncate" title={row.productsSummary}>
                        {row.productsSummary}
                      </p>
                    </td>

                    {/* Delivery Location */}
                    <td className="px-4 py-4 text-xs font-medium text-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin size={13} className="text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[140px]" title={row.deliveryLocation}>
                          {row.deliveryLocation}
                        </span>
                      </div>
                    </td>

                    {/* Payment Method */}
                    <td className="px-4 py-4">
                      {row.paymentMethod === "COD" ? (
                        <span className="inline-flex items-center rounded-md bg-amber-500/15 text-amber-950 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold">
                          COD
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-emerald-500/15 text-emerald-950 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                          Online
                        </span>
                      )}
                    </td>

                    {/* Payment Status */}
                    <td className="px-4 py-4">
                      <StatusBadge status={row.payment_status} />
                    </td>

                    {/* Order Status */}
                    <td className="px-4 py-4">
                      <form action={updateOrder} className="flex flex-col gap-1.5">
                        <input name="id" type="hidden" value={row.id} />
                        {/* Order Status dropdown — always shown */}
                        <select
                          aria-label={`Order status for ${row.order_number}`}
                          className="rounded-md border border-input bg-card px-2 py-1 text-xs font-medium text-foreground outline-none focus-visible:border-ring"
                          defaultValue={row.order_status}
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
                        {/* Payment Status dropdown — COD only; Razorpay status is system-controlled */}
                        {row.paymentMethod === "COD" && (
                          <select
                            aria-label={`Payment status for ${row.order_number}`}
                            className="rounded-md border border-input bg-card px-2 py-1 text-xs font-medium text-foreground outline-none focus-visible:border-ring"
                            defaultValue={row.payment_status}
                            name="payment_status"
                          >
                            <option value="pending">Pay: Pending</option>
                            <option value="paid">Pay: Paid</option>
                            <option value="refunded">Pay: Refunded</option>
                          </select>
                        )}
                        <Button size="sm" type="submit" variant="secondary" className="h-7 px-2 text-xs">
                          Save
                        </Button>
                      </form>
                    </td>


                    {/* Date */}
                    <td className="px-4 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(row.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>

                    {/* Details Link */}
                    <td className="px-4 py-4 text-right">
                      <Link href={`/admin/orders/${row.id}`}>
                        <Button size="sm" variant="ghost" className="h-8 px-2">
                          <Eye size={14} />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <EmptyState
                description={
                  paymentFilter !== "all"
                    ? `No orders matching "${paymentFilter.toUpperCase()}" payment filter.`
                    : "When customers place orders, they will appear here for operational processing."
                }
                title="No orders found"
              />
            )}
          </div>
        </Card>
      </div>

      {/* Mobile / Tablet Card View */}
      <div className="grid gap-3 lg:hidden">
        {filteredOrders.map((row) => (
          <MobileDataCard
            key={row.id}
            badge={
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={row.payment_status} />
                <span className="rounded-md bg-secondary text-foreground text-[10px] font-bold px-2 py-0.5 border border-border">
                  {row.paymentMethod}
                </span>
              </div>
            }
            details={[
              { label: "Customer", value: `${row.customer_name_snapshot} (${row.customer_phone_snapshot})` },
              { label: "Products", value: row.productsSummary },
              { label: "Location", value: row.deliveryLocation },
              { label: "Order Status", value: row.order_status.toUpperCase() },
            ]}
            subtitle={new Date(row.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            title={
              <Link className="hover:text-primary" href={`/admin/orders/${row.id}`}>
                {row.order_number} · {formatINR(row.total_amount_paise)}
              </Link>
            }
          />
        ))}

        {filteredOrders.length === 0 && (
          <EmptyState
            description={
              paymentFilter !== "all"
                ? `No orders matching "${paymentFilter.toUpperCase()}" payment filter.`
                : "When customers place orders, they will appear here for operational processing."
            }
            title="No orders found"
          />
        )}
      </div>
    </>
  );
}
