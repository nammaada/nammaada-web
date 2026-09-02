import Image from "next/image";
import Link from "next/link";
import { Edit3, Plus, Image as ImageIcon } from "lucide-react";
import { deleteProduct } from "@/actions/admin";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { MobileDataCard } from "@/components/admin/mobile-data-card";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminRows, formatINR } from "@/lib/admin/data";
import { getCloudinaryImageUrl } from "@/lib/cloudinary/delivery";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price_paise: number;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
};

type ImageRow = {
  product_id: string;
  cloudinary_public_id: string;
  is_primary: boolean;
};

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [rows, images] = await Promise.all([
    adminRows<ProductRow>("admin_products"),
    adminRows<ImageRow>("admin_product_images"),
  ]);
  const params = await searchParams;

  // Map primary images to products
  const primaryImageMap = new Map<string, string>();
  for (const img of images) {
    if (img.is_primary || !primaryImageMap.has(img.product_id)) {
      primaryImageMap.set(img.product_id, img.cloudinary_public_id);
    }
  }

  return (
    <>
      <PageHeader
        action={
          <Link href="/admin/products/new">
            <Button size="md">
              <Plus size={16} />
              <span>Add product</span>
            </Button>
          </Link>
        }
        description="Manage product listings, pricing, availability, and image media."
        eyebrow="CATALOG"
        title="Products"
      />

      {params.error && (
        <div role="alert" className="mb-6 rounded-xl border border-red-900/20 bg-red-900/5 p-4 text-sm font-medium text-red-900">
          {params.error}
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card className="overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-secondary/60 text-xs font-bold tracking-wider uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">Price</th>
                  <th className="px-5 py-3.5">Stock</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => {
                  const imagePublicId = primaryImageMap.get(row.id);
                  return (
                    <tr key={row.id} className="transition-colors hover:bg-secondary/30">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          {imagePublicId ? (
                            <div className="relative aspect-square size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary/50">
                              <Image
                                alt={row.name}
                                className="object-cover"
                                fill
                                sizes="48px"
                                src={getCloudinaryImageUrl({ publicId: imagePublicId, width: 160, height: 160, crop: "fill" })}
                              />
                            </div>
                          ) : (
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary/50 text-muted-foreground/60">
                              <ImageIcon size={20} />
                            </div>
                          )}
                          <div>
                            <Link className="font-semibold text-foreground hover:text-primary transition-colors" href={`/admin/products/${row.id}`}>
                              {row.name}
                            </Link>
                            <p className="text-xs font-mono text-muted-foreground mt-0.5">{row.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-foreground">{formatINR(row.price_paise)}</td>
                      <td className="px-5 py-4 font-medium text-foreground">{row.stock_quantity} units</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={row.is_active ? "active" : "inactive"} />
                          {row.is_featured && (
                            <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-[11px] font-bold text-accent-foreground">
                              ★ Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/products/${row.id}`}>
                            <Button size="sm" variant="outline">
                              <Edit3 size={14} />
                              <span>Edit</span>
                            </Button>
                          </Link>
                          <ConfirmDialog
                            action={deleteProduct}
                            confirmLabel="Delete product"
                            description={`Are you sure you want to delete "${row.name}"? This action cannot be undone.`}
                            hiddenFields={{ id: row.id }}
                            title="Delete product?"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {rows.length === 0 && (
              <EmptyState
                action={
                  <Link href="/admin/products/new">
                    <Button size="md">
                      <Plus size={16} />
                      <span>Add your first product</span>
                    </Button>
                  </Link>
                }
                description="Start building the Namma Ada product catalogue by adding your first item."
                title="No products found"
              />
            )}
          </div>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-3 md:hidden">
        {rows.map((row) => {
          const imagePublicId = primaryImageMap.get(row.id);
          return (
            <MobileDataCard
              key={row.id}
              actions={
                <>
                  <Link href={`/admin/products/${row.id}`}>
                    <Button size="sm" variant="outline">
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </Button>
                  </Link>
                  <ConfirmDialog
                    action={deleteProduct}
                    confirmLabel="Delete"
                    description={`Delete "${row.name}"?`}
                    hiddenFields={{ id: row.id }}
                    title="Delete product?"
                  />
                </>
              }
              badge={
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={row.is_active ? "active" : "inactive"} />
                  {row.is_featured && <span className="text-[10px] font-bold text-accent-foreground">★ Featured</span>}
                </div>
              }
              details={[
                { label: "Price", value: formatINR(row.price_paise) },
                { label: "Stock", value: `${row.stock_quantity} units` },
              ]}
              subtitle={row.slug}
              thumbnail={
                imagePublicId ? (
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
                    <Image
                      alt={row.name}
                      className="object-cover"
                      fill
                      sizes="48px"
                      src={getCloudinaryImageUrl({ publicId: imagePublicId, width: 160, height: 160, crop: "fill" })}
                    />
                  </div>
                ) : (
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground/60">
                    <ImageIcon size={18} />
                  </div>
                )
              }
              title={
                <Link className="hover:text-primary" href={`/admin/products/${row.id}`}>
                  {row.name}
                </Link>
              }
            />
          );
        })}

        {rows.length === 0 && (
          <EmptyState
            action={
              <Link href="/admin/products/new">
                <Button size="md">
                  <Plus size={16} />
                  <span>Add product</span>
                </Button>
              </Link>
            }
            description="Start building the Namma Ada product catalogue by adding your first item."
            title="No products yet"
          />
        )}
      </div>
    </>
  );
}
