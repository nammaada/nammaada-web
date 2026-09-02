import { deleteShippingRule, saveShippingRule } from "@/actions/admin";
import { AdminField, CheckField, MoneyField, Submit } from "@/components/admin/admin-form";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card } from "@/components/ui/card";
import { adminRows, formatINR } from "@/lib/admin/data";

type ShippingRule = {
  id: string;
  state_code: string;
  state_name: string;
  charge_paise: number;
  is_active: boolean;
};

export default async function ShippingPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const rows = await adminRows<ShippingRule>("admin_shipping_rules");
  const params = await searchParams;

  return (
    <>
      <PageHeader
        description="Configure state-specific delivery charges applied at checkout."
        eyebrow="OPERATIONS"
        title="Shipping rules"
      />

      {params.error && (
        <div role="alert" className="mb-6 rounded-xl border border-red-900/20 bg-red-900/5 p-4 text-sm font-medium text-red-900">
          {params.error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] items-start">
        {/* Shipping Rules Table */}
        <Card className="overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-secondary/60 text-xs font-bold tracking-wider uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">State</th>
                  <th className="px-5 py-3.5">Code</th>
                  <th className="px-5 py-3.5">Delivery charge</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-secondary/30">
                    <td className="px-5 py-4 font-semibold text-foreground">{row.state_name}</td>
                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{row.state_code}</td>
                    <td className="px-5 py-4 font-semibold text-primary">{formatINR(row.charge_paise)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={row.is_active ? "active" : "inactive"} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <ConfirmDialog
                        action={deleteShippingRule}
                        confirmLabel="Delete"
                        description={`Remove shipping rule for "${row.state_name}"?`}
                        hiddenFields={{ id: row.id }}
                        title="Delete shipping rule?"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rows.length === 0 && (
              <EmptyState
                description="Configure state-specific delivery charges when approved."
                title="No shipping rules configured yet"
              />
            )}
          </div>
        </Card>

        {/* Add Shipping Rule Form Card */}
        <Card className="p-6 shadow-xs">
          <h2 className="font-display text-xl font-semibold text-foreground mb-4">Add shipping rule</h2>
          <form action={saveShippingRule} className="grid gap-4">
            <AdminField label="State name" name="state_name" placeholder="e.g. Kerala" required />
            <AdminField helperText="2-3 letter uppercase code (e.g. KL, KA, TN)" label="State code" name="state_code" placeholder="e.g. KL" required />
            <MoneyField label="Delivery charge" name="charge" required />
            <CheckField defaultChecked label="Active" name="is_active" />
            <div className="pt-2">
              <Submit className="w-full" label="Create shipping rule" />
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
