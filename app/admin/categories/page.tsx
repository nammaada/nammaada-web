import { deleteCategory, saveCategory } from "@/actions/admin";
import { AdminField, CheckField, Submit } from "@/components/admin/admin-form";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EditCategoryModal } from "@/components/admin/edit-category-modal";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card } from "@/components/ui/card";
import { adminRows } from "@/lib/admin/data";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
};

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const rows = await adminRows<Category>("categories");
  const params = await searchParams;

  return (
    <>
      <PageHeader
        description="Organise products into active store categories and navigation menus."
        eyebrow="CATALOG"
        title="Categories"
      />

      {params.error && (
        <div role="alert" className="mb-6 rounded-xl border border-red-900/20 bg-red-900/5 p-4 text-sm font-medium text-red-900">
          {params.error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] items-start">
        {/* Categories List */}
        <Card className="overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-secondary/60 text-xs font-bold tracking-wider uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Slug</th>
                  <th className="px-5 py-3.5">Order</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
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
                    <td className="px-5 py-4 font-medium text-foreground">{row.display_order}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={row.is_active ? "active" : "inactive"} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
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

        {/* Add Category Form Card */}
        <Card className="p-6 shadow-xs">
          <h2 className="font-display text-xl font-semibold text-foreground mb-4">Add category</h2>
          <form action={saveCategory} className="grid gap-4">
            <AdminField label="Category name" name="name" placeholder="e.g. Oils & Ghee" required />
            <AdminField helperText="Lowercase letters and hyphens" label="Slug" name="slug" placeholder="e.g. oils-and-ghee" required />
            <AdminField label="Description" name="description" placeholder="Brief category introduction..." />
            <AdminField defaultValue={0} helperText="Display position" label="Display order" name="display_order" type="number" />
            <CheckField defaultChecked label="Active" name="is_active" />
            <div className="pt-2">
              <Submit className="w-full" label="Create category" />
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
