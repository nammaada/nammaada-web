import { connection } from "next/server";
import { deleteCategory, saveCategory } from "@/actions/admin";
import { AdminField, CheckField, Submit } from "@/components/admin/admin-form";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EditCategoryModal } from "@/components/admin/edit-category-modal";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card } from "@/components/ui/card";
import { adminRows } from "@/lib/admin/data";
import { getCategoryDeliveryScopes, resolveCategoryScope } from "@/lib/delivery/restricted-locations";

export const instant = false;

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
  delivery_scope?: string;
};

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await connection();
  const [rawRows, scopesMap] = await Promise.all([
    adminRows<Category>("categories"),
    getCategoryDeliveryScopes(),
  ]);
  const params = await searchParams;

  const rows = rawRows.map((cat) => ({
    ...cat,
    delivery_scope: resolveCategoryScope(cat, scopesMap),
  }));

  return (
    <>
      <PageHeader
        action={
          <a
            href="#add-category"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
          >
            + Add category
          </a>
        }
        description="Organise products into active store categories, navigation menus, and delivery availability rules."
        eyebrow="CATALOG"
        title="Categories"
      />

      {params.error && (
        <div role="alert" className="mb-6 rounded-xl border border-red-900/20 bg-red-900/5 p-4 text-sm font-medium text-red-900">
          {params.error}
        </div>
      )}

      <div className="space-y-8">
        {/* Categories List — Full Width, never cropped */}
        <Card className="overflow-hidden shadow-xs border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-secondary/60 text-xs font-bold tracking-wider uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Slug</th>
                  <th className="px-5 py-3.5">Delivery</th>
                  <th className="px-5 py-3.5">Order</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right w-44">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-secondary/30">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-foreground">{row.name}</p>
                      {row.description && <p className="text-xs text-muted-foreground mt-0.5 max-w-sm truncate">{row.description}</p>}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{row.slug}</td>
                    <td className="px-5 py-4">
                      {row.delivery_scope === "bangalore_only" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-500/20">
                          Restricted Location
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground border border-border">
                          India Wide
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-medium text-foreground">{row.display_order}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={row.is_active ? "active" : "inactive"} />
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2.5">
                        <EditCategoryModal category={row} />
                        <ConfirmDialog
                          action={deleteCategory}
                          confirmLabel="Delete"
                          description={`Delete category "${row.name}"? Products referencing it will become uncategorised.`}
                          hiddenFields={{ id: row.id }}
                          title="Delete category?"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rows.length === 0 && (
              <EmptyState
                description="Organise your products into clear store categories for your buyers."
                title="No categories configured"
              />
            )}
          </div>
        </Card>

        {/* Add Category Form Card — Placed at the bottom */}
        <Card id="add-category" className="p-6 sm:p-8 shadow-xs border border-border">
          <div className="mb-6 border-b border-border/60 pb-4">
            <h2 className="font-display text-xl font-semibold text-foreground">Add new category</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Create a store category and specify whether products in it can be delivered across India or only to configured Bangalore locations (COD only).
            </p>
          </div>
          <form action={saveCategory} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <AdminField label="Category name" name="name" placeholder="e.g. Oils & Ghee" required />
              <AdminField helperText="Lowercase letters and hyphens" label="Slug" name="slug" placeholder="e.g. oils-and-ghee" required />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <AdminField
                helperText="Restricted Location: Deliverable only to configured Bangalore locations via COD. India Wide: Deliverable across India."
                label="Delivery Availability"
                name="delivery_scope"
              >
                <select
                  className="min-h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                  defaultValue="all_india"
                  name="delivery_scope"
                >
                  <option value="all_india">India Wide</option>
                  <option value="bangalore_only">Restricted Location</option>
                </select>
              </AdminField>
              <AdminField defaultValue={0} helperText="Display position order (lower numbers appear first)" label="Display order" name="display_order" type="number" />
            </div>
            <AdminField label="Description" name="description" placeholder="Brief category introduction..." />
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/60">
              <CheckField defaultChecked label="Active (visible on storefront)" name="is_active" />
              <Submit className="px-6" label="Create category" />
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
