import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteVariant, saveVariant } from "@/actions/admin";
import { AdminField, CheckField, MoneyField, Submit } from "@/components/admin/admin-form";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ImageManager } from "@/components/admin/image-manager";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminRow, adminRows, formatINR } from "@/lib/admin/data";

import { getCloudinaryImageUrl } from "@/lib/cloudinary/delivery";

type Product = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  category_id: string | null;
  price_paise: number;
  stock_quantity: number;
  delivery_scope: string;
  is_free_shipping: boolean;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
};

type ImageRow = {
  id: string;
  product_id: string;
  cloudinary_public_id: string;
  alt_text: string;
  display_order: number;
  is_primary: boolean;
};

type VariantRow = {
  id: string;
  product_id: string;
  name: string;
  sku: string | null;
  price_paise: number;
  stock_quantity: number;
  is_active: boolean;
  display_order: number;
};

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const [product, categories, images, variants] = await Promise.all([
    adminRow<Product>("admin_products", id),
    adminRows<{ id: string; name: string }>("categories"),
    adminRows<ImageRow>("admin_product_images"),
    adminRows<VariantRow>("admin_product_variants"),
  ]);

  if (!product) notFound();

  const productImages = images
    .filter((img) => img.product_id === id)
    .sort((a, b) => a.display_order - b.display_order)
    .map((img) => ({
      ...img,
      thumbnailUrl: getCloudinaryImageUrl({ publicId: img.cloudinary_public_id, width: 320, height: 240, crop: "fill" }),
    }));

  const productVariants = variants
    .filter((v) => v.product_id === id)
    .sort((a, b) => a.display_order - b.display_order);

  const query = await searchParams;

  return (
    <>
      <PageHeader
        action={
          <div className="flex items-center gap-3">
            <Link href="/admin/products">
              <Button size="sm" variant="secondary">
                Back to products
              </Button>
            </Link>
            {product.is_active && (
              <a href={`/products/${product.slug}`} target="_blank" rel="noreferrer">
                <Button size="sm" variant="outline">
                  Preview in store ↗
                </Button>
              </a>
            )}
          </div>
        }
        breadcrumbs={[
          { label: "Products", href: "/admin/products" },
          { label: product.name },
        ]}
        description="Edit product pricing, details, imagery, and option variants."
        eyebrow="CATALOG"
        title={product.name}
      />

      {query.error && (
        <div role="alert" className="mb-6 rounded-xl border border-red-900/20 bg-red-900/5 p-4 text-sm font-medium text-red-900">
          {query.error}
        </div>
      )}

      {/* 2-Column Editorial CMS Layout */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] items-start">
        {/* Left Column: Main Product Form */}
        <div className="grid gap-8">
          <Card className="p-6 sm:p-8 shadow-xs">
            <h2 className="font-display text-xl font-semibold text-foreground mb-6">Product Details</h2>
            <ProductForm categories={categories} product={product} />
          </Card>

          {/* Product Variants Management Section */}
          <Card className="p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground">Product Variants</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Optional variants (e.g. 250ml, 500ml, 1L). When variants exist, buyers choose a variant.
                </p>
              </div>
            </div>

            {/* Existing Variants Table */}
            {productVariants.length > 0 && (
              <div className="mb-6 overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-secondary/60 uppercase text-muted-foreground font-bold">
                    <tr>
                      <th className="p-3">Variant</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {productVariants.map((v) => (
                      <tr key={v.id}>
                        <td className="p-3 font-semibold text-foreground">{v.name}</td>
                        <td className="p-3 font-mono text-muted-foreground">{v.sku || "—"}</td>
                        <td className="p-3 font-medium">{formatINR(v.price_paise)}</td>
                        <td className="p-3">{v.stock_quantity} units</td>
                        <td className="p-3">
                          <StatusBadge status={v.is_active ? "active" : "inactive"} />
                        </td>
                        <td className="p-3 text-right">
                          <ConfirmDialog
                            action={deleteVariant}
                            confirmLabel="Delete"
                            description={`Remove variant "${v.name}"?`}
                            hiddenFields={{ product_id: id, id: v.id }}
                            title="Delete variant?"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add Variant Form */}
            <form action={saveVariant} className="rounded-lg border border-border bg-secondary/30 p-4 grid gap-4">
              <input name="product_id" type="hidden" value={id} />
              <h3 className="text-sm font-semibold text-foreground">Add new variant</h3>
              
              <div className="grid gap-3 sm:grid-cols-2">
                <AdminField label="Variant name" name="name" placeholder="e.g. 500ml Bottle" required />
                <AdminField label="SKU" name="sku" placeholder="e.g. NA-COIL-500" />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <MoneyField label="Price" name="price" required />
                <AdminField defaultValue={0} label="Stock" name="stock_quantity" required type="number" />
                <AdminField defaultValue={0} label="Display order" name="display_order" type="number" />
              </div>

              <div className="flex items-center justify-between pt-2">
                <CheckField defaultChecked label="Active" name="is_active" />
                <Submit label="Add variant" size="sm" variant="secondary" />
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: Image Manager */}
        <div className="lg:sticky lg:top-20">
          <Card className="p-5 sm:p-6 shadow-xs">
            <ImageManager images={productImages} productId={id} />
          </Card>
        </div>
      </div>
    </>
  );
}
