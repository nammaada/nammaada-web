import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminRows } from "@/lib/admin/data";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const categories = await adminRows<{ id: string; name: string }>("categories");
  const query = searchParams ? await searchParams : {};

  return (
    <div className="w-full pb-12">
      <PageHeader
        action={
          <Link href="/admin/products">
            <Button size="sm" variant="secondary">
              Back to products
            </Button>
          </Link>
        }
        breadcrumbs={[
          { label: "Products", href: "/admin/products" },
          { label: "Create product" },
        ]}
        description="Fill in product details, pricing in INR, availability, and visibility settings."
        eyebrow="CATALOG"
        title="Create product"
      />

      {query?.error && (
        <div role="alert" className="mb-6 rounded-xl border border-red-900/20 bg-red-900/5 p-4 text-sm font-medium text-red-900">
          {query.error}
        </div>
      )}

      <Card className="p-6 sm:p-8 lg:p-10 shadow-xs">
        <ProductForm categories={categories} isNew submitLabel="Create product" />
      </Card>
    </div>
  );
}

