import { ShieldCheck, ShieldAlert } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";
import { MobileDataCard } from "@/components/admin/mobile-data-card";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card } from "@/components/ui/card";
import { adminRows, formatINR } from "@/lib/admin/data";

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

export default async function PaymentsPage() {
  const rows = await adminRows<PaymentRow>("admin_payments");

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
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Razorpay Order ID</th>
                  <th className="px-5 py-3.5">Razorpay Payment ID</th>
                  <th className="px-5 py-3.5">Signature Verified</th>
                  <th className="px-5 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-secondary/30">
                    <td className="px-5 py-4 font-semibold text-primary">
                      {formatINR(row.amount_paise)} <span className="text-xs font-mono text-muted-foreground">{row.currency}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{row.razorpay_order_id || "—"}</td>
                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{row.razorpay_payment_id || "—"}</td>
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
                    <td className="px-5 py-4 text-xs font-mono text-muted-foreground">
                      {new Date(row.created_at).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rows.length === 0 && (
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
        {rows.map((row) => (
          <MobileDataCard
            key={row.id}
            badge={<StatusBadge status={row.status} />}
            details={[
              { label: "Razorpay Order", value: row.razorpay_order_id || "—" },
              {
                label: "Verification",
                value: row.signature_verified ? "Verified" : "Pending",
              },
            ]}
            subtitle={new Date(row.created_at).toLocaleDateString("en-IN")}
            title={`${formatINR(row.amount_paise)} ${row.currency}`}
          />
        ))}

        {rows.length === 0 && (
          <EmptyState
            description="Payment transaction audit records will appear here as orders complete online payment verification."
            title="No payment records yet"
          />
        )}
      </div>
    </>
  );
}
