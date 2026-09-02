import { Mail, MapPin, Phone } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";
import { MobileDataCard } from "@/components/admin/mobile-data-card";
import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { adminRows } from "@/lib/admin/data";

type CustomerRow = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  address: string;
  district_city: string;
  state: string;
  pincode: string;
  created_at: string;
};

export default async function CustomersPage() {
  const rows = await adminRows<CustomerRow>("admin_customers");

  return (
    <>
      <PageHeader
        description="Guest customer contact and shipping records captured through checkout orders."
        eyebrow="OPERATIONS"
        title="Customers"
      />

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card className="overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-secondary/60 text-xs font-bold tracking-wider uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Phone</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-secondary/30">
                    <td className="px-5 py-4 font-semibold text-foreground">{row.full_name}</td>
                    <td className="px-5 py-4 font-medium text-foreground">
                      <a className="hover:text-primary transition-colors flex items-center gap-1.5" href={`tel:${row.phone}`}>
                        <Phone size={14} className="text-muted-foreground" />
                        <span>{row.phone}</span>
                      </a>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {row.email ? (
                        <a className="hover:text-primary transition-colors flex items-center gap-1.5" href={`mailto:${row.email}`}>
                          <Mail size={14} className="text-muted-foreground" />
                          <span>{row.email}</span>
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} className="text-muted-foreground shrink-0" />
                        <span>
                          {row.district_city}, {row.state} {row.pincode}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground font-mono">
                      {new Date(row.created_at).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rows.length === 0 && (
              <EmptyState
                description="Customer records will automatically populate when guest purchases are completed."
                title="No customer records yet"
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
            details={[
              { label: "Phone", value: row.phone },
              { label: "Email", value: row.email || "—" },
              { label: "City", value: `${row.district_city}, ${row.state}` },
              { label: "Pincode", value: row.pincode },
            ]}
            subtitle={`Joined ${new Date(row.created_at).toLocaleDateString("en-IN")}`}
            title={row.full_name}
          />
        ))}

        {rows.length === 0 && (
          <EmptyState
            description="Customer records will automatically populate when guest purchases are completed."
            title="No customer records yet"
          />
        )}
      </div>
    </>
  );
}
