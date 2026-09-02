import { Mail, Phone } from "lucide-react";
import { updateEnquiry } from "@/actions/admin";
import { EmptyState } from "@/components/admin/empty-state";
import { MobileDataCard } from "@/components/admin/mobile-data-card";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminRows } from "@/lib/admin/data";

type EnquiryRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  product_requirement: string;
  quantity_details: string;
  status: string;
  created_at: string;
};

export default async function EnquiriesPage() {
  const rows = await adminRows<EnquiryRow>("admin_bulk_enquiries");

  return (
    <>
      <PageHeader
        description="Triage and manage bulk wholesale or custom order enquiries submitted by buyers."
        eyebrow="CONTENT"
        title="Bulk enquiries"
      />

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card className="overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-secondary/60 text-xs font-bold tracking-wider uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Product Requirement</th>
                  <th className="px-5 py-3.5">Quantity Details</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-secondary/30">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-foreground">{row.name}</p>
                      <a className="hover:text-primary text-xs text-muted-foreground flex items-center gap-1 mt-0.5" href={`tel:${row.phone}`}>
                        <Phone size={12} /> {row.phone}
                      </a>
                      {row.email && (
                        <a className="hover:text-primary text-xs text-muted-foreground flex items-center gap-1 mt-0.5" href={`mailto:${row.email}`}>
                          <Mail size={12} /> {row.email}
                        </a>
                      )}
                    </td>
                    <td className="px-5 py-4 font-medium text-foreground max-w-xs">{row.product_requirement}</td>
                    <td className="px-5 py-4 text-xs text-muted-foreground max-w-xs">{row.quantity_details}</td>
                    <td className="px-5 py-4">
                      <form action={updateEnquiry} className="flex items-center gap-2">
                        <input name="id" type="hidden" value={row.id} />
                        <select
                          aria-label={`Status for ${row.name}`}
                          className="rounded-lg border border-input bg-card px-2.5 py-1.5 text-xs font-medium text-foreground outline-none focus-visible:border-ring"
                          defaultValue={row.status}
                          name="status"
                        >
                          <option value="new">New</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                        <Button size="sm" type="submit" variant="secondary">
                          Save
                        </Button>
                      </form>
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
                description="Wholesale and bulk procurement enquiries submitted on the website will be listed here."
                title="No bulk enquiries received yet"
              />
            )}
          </div>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <MobileDataCard
            key={row.id}
            badge={<StatusBadge status={row.status} />}
            details={[
              { label: "Phone", value: row.phone },
              { label: "Requirement", value: row.product_requirement },
              { label: "Quantity", value: row.quantity_details },
              {
                label: "Date",
                value: new Date(row.created_at).toLocaleDateString("en-IN"),
              },
            ]}
            subtitle={row.email || row.phone}
            title={row.name}
          />
        ))}

        {rows.length === 0 && (
          <EmptyState
            description="Wholesale and bulk procurement enquiries submitted on the website will be listed here."
            title="No bulk enquiries received yet"
          />
        )}
      </div>
    </>
  );
}
