import Link from "next/link";
import { Eye } from "lucide-react";
import { updateOrder } from "@/actions/admin";
import { EmptyState } from "@/components/admin/empty-state";
import { MobileDataCard } from "@/components/admin/mobile-data-card";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminRows, formatINR } from "@/lib/admin/data";

type OrderRow = {
  id: string;
  order_number: string;
  customer_name_snapshot: string;
  customer_phone_snapshot: string;
  total_amount_paise: number;
  order_status: string;
  payment_status: string;
  created_at: string;
};

export default async function OrdersPage() {
  const rows = await adminRows<OrderRow>("admin_orders");

  return (
    <>
      <PageHeader
        description="Review real guest checkout orders, delivery information, and operational statuses."
        eyebrow="OPERATIONS"
        title="Orders"
      />

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card className="overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-secondary/60 text-xs font-bold tracking-wider uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Order</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Total</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5">Fulfillment Status</th>
                  <th className="px-5 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-secondary/30">
                    <td className="px-5 py-4">
                      <Link className="font-semibold text-primary hover:underline font-mono text-xs" href={`/admin/orders/${row.id}`}>
                        {row.order_number}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-foreground">{row.customer_name_snapshot}</p>
                      <p className="text-xs text-muted-foreground">{row.customer_phone_snapshot}</p>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-muted-foreground">
                      {new Date(row.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4 font-semibold text-foreground">{formatINR(row.total_amount_paise)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={row.payment_status} />
                    </td>
                    <td className="px-5 py-4">
                      <form action={updateOrder} className="flex items-center gap-2">
                        <input name="id" type="hidden" value={row.id} />
                        <select
                          aria-label={`Status for ${row.order_number}`}
                          className="rounded-lg border border-input bg-card px-2.5 py-1.5 text-xs font-medium text-foreground outline-none focus-visible:border-ring"
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
                        <Button size="sm" type="submit" variant="secondary">
                          Save
                        </Button>
                      </form>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/admin/orders/${row.id}`}>
                        <Button size="sm" variant="ghost">
                          <Eye size={14} />
                          <span>View</span>
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rows.length === 0 && (
              <EmptyState
                description="When customers place guest orders on Namma Ada, they will appear here for operational processing."
                title="No orders yet"
              />
            )}
          </div>
        </Card>
      </div>

      {/* Mobile Cards View */}
      <div className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <MobileDataCard
            key={row.id}
            actions={
              <Link href={`/admin/orders/${row.id}`}>
                <Button size="sm" variant="outline">
                  <Eye size={14} />
                  <span>View Details</span>
                </Button>
              </Link>
            }
            badge={<StatusBadge status={row.order_status} />}
            details={[
              { label: "Phone", value: row.customer_phone_snapshot },
              { label: "Total", value: formatINR(row.total_amount_paise) },
              { label: "Payment", value: <StatusBadge status={row.payment_status} /> },
              {
                label: "Date",
                value: new Date(row.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                }),
              },
            ]}
            subtitle={new Date(row.created_at).toLocaleDateString("en-IN")}
            title={row.customer_name_snapshot}
          />
        ))}

        {rows.length === 0 && (
          <EmptyState
            description="When customers place guest orders on Namma Ada, they will appear here for operational processing."
            title="No orders yet"
          />
        )}
      </div>
    </>
  );
}
