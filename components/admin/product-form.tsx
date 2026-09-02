import { saveProduct } from "@/actions/admin";
import { AdminField, CheckField, FormSection, MoneyField, Submit } from "@/components/admin/admin-form";

type Product = {
  id?: string;
  name?: string;
  slug?: string;
  short_description?: string | null;
  description?: string | null;
  category_id?: string | null;
  price_paise?: number;
  stock_quantity?: number;
  delivery_scope?: string;
  is_free_shipping?: boolean;
  is_active?: boolean;
  is_featured?: boolean;
  display_order?: number;
};

export function ProductForm({ product, categories, submitLabel }: { product?: Product; categories: { id: string; name: string }[]; submitLabel?: string }) {
  return (
    <form action={saveProduct} className="grid gap-6">
      <input name="id" type="hidden" value={product?.id ?? ""} />

      {/* Basic Information */}
      <FormSection description="Product identifiers and public content." title="Basic Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField defaultValue={product?.name} label="Product name" name="name" placeholder="e.g. Pure Coconut Oil" required />
          <AdminField defaultValue={product?.slug} helperText="Unique URL slug (lowercase letters and hyphens)" label="Slug" name="slug" placeholder="e.g. pure-coconut-oil" required />
        </div>

        <AdminField defaultValue={product?.short_description ?? ""} label="Short description" name="short_description" placeholder="Brief summary displayed on product cards" />

        <label className="grid gap-1.5 text-sm font-semibold text-foreground">
          <span>Full description</span>
          <textarea
            className="min-h-32 w-full rounded-lg border border-input bg-card px-3.5 py-3 text-sm font-normal text-foreground placeholder:text-muted-foreground/60 transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
            defaultValue={product?.description ?? ""}
            name="description"
            placeholder="Detailed product story, ingredients, usage instructions..."
          />
        </label>
      </FormSection>

      {/* Catalog & Organization */}
      <FormSection description="Assign category and sorting order." title="Catalog & Classification">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Category" name="category_id">
            <select
              className="min-h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              defaultValue={product?.category_id ?? ""}
              name="category_id"
            >
              <option value="">Uncategorised</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </AdminField>

          <AdminField defaultValue={product?.display_order ?? 0} helperText="Lower numbers appear first" label="Display order" name="display_order" type="number" />
        </div>
      </FormSection>

      {/* Commerce & Inventory */}
      <FormSection description="Pricing in Indian Rupees (INR) and stock availability." title="Pricing & Commerce">
        <div className="grid gap-4 sm:grid-cols-2">
          <MoneyField label="Price" name="price" paise={product?.price_paise} required />
          <AdminField defaultValue={product?.stock_quantity ?? 0} helperText="Available units for direct purchase" label="Stock quantity" name="stock_quantity" required type="number" />
        </div>

        <AdminField helperText="Select shipping availability boundary" label="Delivery scope" name="delivery_scope">
          <select
            className="min-h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            defaultValue={product?.delivery_scope ?? "all_india"}
            name="delivery_scope"
          >
            <option value="all_india">All India Shipping</option>
            <option value="bangalore_only">Bangalore Only</option>
          </select>
        </AdminField>
      </FormSection>

      {/* Visibility Settings */}
      <FormSection description="Control product visibility and special flags on storefront." title="Visibility & Settings">
        <div className="grid gap-4 sm:grid-cols-3 pt-1">
          <CheckField defaultChecked={product?.is_active ?? false} description="Visible on storefront" label="Active" name="is_active" />
          <CheckField defaultChecked={product?.is_featured ?? false} description="Highlight on homepage" label="Featured" name="is_featured" />
          <CheckField defaultChecked={product?.is_free_shipping ?? false} description="Waive shipping fee" label="Free shipping" name="is_free_shipping" />
        </div>
      </FormSection>

      {/* Submit Action */}
      <div className="flex justify-end pt-4">
        <Submit label={submitLabel || (product ? "Save product changes" : "Create product")} size="lg" />
      </div>
    </form>
  );
}
