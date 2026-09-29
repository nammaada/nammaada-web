import { connection } from "next/server";
import Link from "next/link";
import { ShieldCheck, ShieldAlert, Eye } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";
import { MobileDataCard } from "@/components/admin/mobile-data-card";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/admin/data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const instant = false;

type PaymentRow = {
  id: string;
  order_id: string;
  amount_paise: number;
  currency: string;
  status: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  signature_verified: boolean;
  created_at: string;
};

type OrderSnap = {
  id: string;
  order_number: string;
  customer_name_snapshot: string;
  customer_phone_snapshot: string;
  customer_email_snapshot: string | null;
};

export default async function PaymentsPage() {
  await connection();

  const supabase = createSupabaseAdminClient();

  // Step 1: Fetch all payment records (same as the original page did)
  const { data: paymentData, error: paymentError } = await supabase
    .from("payments")
    .select("id, order_id, amount_paise, currency, status, razorpay_order_id, razorpay_payment_id, signature_verified, created_at")
    .order("created_at", { ascending: false });

  if (paymentError) {
    console.error("[PaymentsPage] Failed to fetch payments:", paymentError);
  }

  const payments: PaymentRow[] = (paymentData ?? []) as PaymentRow[];

  // Step 2: Batch-fetch related orders in one query (no N+1)
  const orderIds = [...new Set(payments.map((p) => p.order_id).filter(Boolean))];
  const orderMap = new Map<string, OrderSnap>();

  if (orderIds.length > 0) {
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("id, order_number, customer_name_snapshot, customer_phone_snapshot, customer_email_snapshot")
      .in("id", orderIds);

    if (orderError) {
      console.error("[PaymentsPage] Failed to fetch related orders:", orderError);
    }

    for (const o of orderData ?? []) {
      orderMap.set(o.id, o as OrderSnap);
    }
  }

  return (
    <>
      <PageHeader
        description="Read-only audit record of online gateway payments and signature verifications."
        eyebrow="OPERATIONS"
        title="Payments"
      />

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card className="overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-secondary/60 text-xs font-bold tracking-wider uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Order</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Razorpay Order ID</th>
                  <th className="px-5 py-3.5">Razorpay Payment ID</th>
                  <th className="px-5 py-3.5">Signature Verified</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((row) => {
                  const order = orderMap.get(row.order_id) ?? null;
                  return (
                    <tr key={row.id} className="transition-colors hover:bg-secondary/30">
                      {/* Customer — from order snapshot, works for guest & registered alike */}
                      <td className="px-5 py-4">
                        {order ? (
                          <>
                            <p className="font-semibold text-foreground text-xs">{order.customer_name_snapshot}</p>
                            <p className="text-[11px] text-muted-foreground">{order.customer_phone_snapshot}</p>
                            {order.customer_email_snapshot && (
                              <p className="text-[11px] text-muted-foreground truncate max-w-[160px]" title={order.customer_email_snapshot}>
                                {order.customer_email_snapshot}
                              </p>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Order reference */}
                      <td className="px-5 py-4">
                        {order ? (
                          <span className="font-mono text-xs text-foreground">{order.order_number}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground font-mono">{row.order_id.slice(0, 8)}…</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4 font-semibold text-primary">
                        {formatINR(row.amount_paise)}{" "}
                        <span className="text-xs font-mono text-muted-foreground">{row.currency}</span>
                      </td>

                      {/* Payment status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={row.status} />
                      </td>

                      {/* Razorpay Order ID */}
                      <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{row.razorpay_order_id ?? "—"}</td>

                      {/* Razorpay Payment ID */}
                      <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{row.razorpay_payment_id ?? "—"}</td>

                      {/* Signature Verified */}
                      <td className="px-5 py-4">
                        {row.signature_verified ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-900 bg-emerald-900/10 rounded-full px-2.5 py-0.5">
                            <ShieldCheck size={14} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 bg-amber-500/15 rounded-full px-2.5 py-0.5">
                            <ShieldAlert size={14} /> Pending
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-xs font-mono text-muted-foreground">
                        {new Date(row.created_at).toLocaleDateString("en-IN")}
                      </td>

                      {/* View — opens the related order detail page */}
                      <td className="px-5 py-4 text-right">
                        {order ? (
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button size="sm" variant="ghost" className="h-8 px-2">
                              <Eye size={14} />
                              <span className="hidden sm:inline ml-1">View</span>
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {payments.length === 0 && (
              <EmptyState
                description="Payment transaction audit records will appear here as orders complete online payment verification."
                title="No payment records yet"
              />
            )}
          </div>
        </Card>
      </div>

      {/* Mobile View */}
      <div className="grid gap-3 md:hidden">
        {payments.map((row) => {
          const order = orderMap.get(row.order_id) ?? null;
          const customerLabel = order
            ? `${order.customer_name_snapshot} · ${order.customer_phone_snapshot}`
            : "—";
          const orderLabel = order ? order.order_number : row.order_id.slice(0, 8) + "…";
          return (
            <MobileDataCard
              key={row.id}
              badge={<StatusBadge status={row.status} />}
              details={[
                { label: "Customer", value: customerLabel },
                { label: "Order", value: orderLabel },
                { label: "Razorpay Order", value: row.razorpay_order_id ?? "—" },
                {
                  label: "Verification",
                  value: row.signature_verified ? "Verified" : "Pending",
                },
              ]}
              subtitle={new Date(row.created_at).toLocaleDateString("en-IN")}
              title={`${formatINR(row.amount_paise)} ${row.currency}`}
            />
          );
        })}

        {payments.length === 0 && (
          <EmptyState
            description="Payment transaction audit records will appear here as orders complete online payment verification."
            title="No payment records yet"
          />
        )}
      </div>
    </>
  );
}
