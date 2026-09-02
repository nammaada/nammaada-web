import { deleteTestimonial, saveTestimonial } from "@/actions/admin";
import { AdminField, CheckField, Submit } from "@/components/admin/admin-form";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card } from "@/components/ui/card";
import { adminRows } from "@/lib/admin/data";

type TestimonialRow = {
  id: string;
  display_name: string;
  location: string | null;
  content: string;
  is_active: boolean;
  display_order: number;
};

export default async function TestimonialsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const rows = await adminRows<TestimonialRow>("admin_testimonials");
  const q = await searchParams;

  return (
    <>
      <PageHeader
        description="Publish genuine customer reviews and Kerala heritage stories to display on storefront pages."
        eyebrow="CONTENT"
        title="Testimonials"
      />

      {q.error && (
        <div role="alert" className="mb-6 rounded-xl border border-red-900/20 bg-red-900/5 p-4 text-sm font-medium text-red-900">
          {q.error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] items-start">
        {/* Testimonials Table */}
        <Card className="overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-secondary/60 text-xs font-bold tracking-wider uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Story / Review</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-secondary/30">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-foreground">{row.display_name}</p>
                      {row.location && <p className="text-xs text-muted-foreground mt-0.5">{row.location}</p>}
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground leading-relaxed max-w-md">
                      &quot;{row.content}&quot;
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={row.is_active ? "active" : "inactive"} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <ConfirmDialog
                        action={deleteTestimonial}
                        confirmLabel="Delete"
                        description={`Remove testimonial from "${row.display_name}"?`}
                        hiddenFields={{ id: row.id }}
                        title="Delete testimonial?"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rows.length === 0 && (
              <EmptyState
                description="Publish genuine client testimonials to build trust on the storefront homepage."
                title="No testimonials published yet"
              />
            )}
          </div>
        </Card>

        {/* Add Testimonial Form Card */}
        <Card className="p-6 shadow-xs">
          <h2 className="font-display text-xl font-semibold text-foreground mb-4">Add testimonial</h2>
          <form action={saveTestimonial} className="grid gap-4">
            <AdminField label="Display name" name="display_name" placeholder="e.g. Anjali Nair" required />
            <AdminField label="Location" name="location" placeholder="e.g. Kochi, Kerala" />
            <label className="grid gap-1.5 text-sm font-semibold text-foreground">
              <span className="flex items-center gap-1">
                Content <span className="text-red-800 text-xs">*</span>
              </span>
              <textarea
                className="min-h-28 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm font-normal text-foreground placeholder:text-muted-foreground/60 transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
                name="content"
                placeholder="Share the customer's authentic review..."
                required
              />
            </label>
            <AdminField defaultValue={0} label="Display order" name="display_order" type="number" />
            <CheckField defaultChecked label="Active" name="is_active" />
            <div className="pt-2">
              <Submit className="w-full" label="Publish testimonial" />
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
