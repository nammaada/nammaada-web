import { deleteCourier, saveCourier } from "@/actions/admin";
import { AdminField, CheckField, Submit } from "@/components/admin/admin-form";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card } from "@/components/ui/card";
import { adminRows } from "@/lib/admin/data";

type CourierRow = {
  id: string;
  name: string;
  tracking_url_template: string | null;
  is_active: boolean;
};

export default async function CouriersPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const rows = await adminRows<CourierRow>("admin_courier_partners");
  const q = await searchParams;

  return (
    <>
      <PageHeader
        description="Maintain courier logistics partner references and tracking link patterns."
        eyebrow="OPERATIONS"
        title="Courier partners"
      />

      {q.error && (
        <div role="alert" className="mb-6 rounded-xl border border-red-900/20 bg-red-900/5 p-4 text-sm font-medium text-red-900">
          {q.error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] items-start">
        {/* Couriers Table */}
        <Card className="overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-secondary/60 text-xs font-bold tracking-wider uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Courier Partner</th>
                  <th className="px-5 py-3.5">Tracking Template</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-secondary/30">
                    <td className="px-5 py-4 font-semibold text-foreground">{row.name}</td>
                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground max-w-xs truncate">
                      {row.tracking_url_template || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={row.is_active ? "active" : "inactive"} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <ConfirmDialog
                        action={deleteCourier}
                        confirmLabel="Delete"
                        description={`Delete courier partner "${row.name}"?`}
                        hiddenFields={{ id: row.id }}
                        title="Delete courier partner?"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rows.length === 0 && (
              <EmptyState
                description="Add courier partners such as India Post, BlueDart, or Porter for order tracking."
                title="No courier partners configured"
              />
            )}
          </div>
        </Card>

        {/* Add Courier Form Card */}
        <Card className="p-6 shadow-xs">
          <h2 className="font-display text-xl font-semibold text-foreground mb-4">Add courier</h2>
          <form action={saveCourier} className="grid gap-4">
            <AdminField label="Courier name" name="name" placeholder="e.g. BlueDart Express" required />
            <AdminField
              helperText="Must start with https:// (optional)"
              label="Tracking URL template"
              name="tracking_url_template"
              placeholder="e.g. https://www.bluedart.com/tracking/..."
            />
            <CheckField defaultChecked label="Active" name="is_active" />
            <div className="pt-2">
              <Submit className="w-full" label="Create courier partner" />
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
