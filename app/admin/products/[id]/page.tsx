import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminRow, adminRows } from "@/lib/admin/data";
import { getCloudinaryImageUrl } from "@/lib/cloudinary/delivery";

export const instant = false;

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
  await connection();
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
    <div className="w-full pb-12">
      <PageHeader
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            {product.is_active && (
              <a href={`/products/${product.slug}`} target="_blank" rel="noreferrer">
                <Button size="sm" variant="outline">
                  Preview in store ↗
                </Button>
              </a>
            )}
            <Link href="/admin/products">
              <Button size="sm" variant="secondary">
                Back to products
              </Button>
            </Link>
          </div>
        }
        breadcrumbs={[
          { label: "Products", href: "/admin/products" },
          { label: product.name },
        ]}
        description="Edit product pricing, details, and imagery."
        eyebrow="CATALOG"
        title={product.name}
      />

      {query.error && (
        <div role="alert" className="mb-6 rounded-xl border border-red-900/20 bg-red-900/5 p-4 text-sm font-medium text-red-900">
          {query.error}
        </div>
      )}

      {/* Main Single-Column Clean Layout */}
      <div className="space-y-8">
        {/* Product Details Card */}
        <Card className="p-6 sm:p-8 lg:p-10 shadow-xs">
          <ProductForm
            categories={categories}
            product={product}
            images={productImages}
            weight={productVariants[0]?.name ?? null}
          />
        </Card>
      </div>
    </div>
  );
}
