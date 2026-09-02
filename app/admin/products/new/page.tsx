import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { Card } from "@/components/ui/card";
import { adminRows } from "@/lib/admin/data";

export default async function NewProductPage() {
  const categories = await adminRows<{ id: string; name: string }>("categories");

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Products", href: "/admin/products" },
          { label: "Create product" },
        ]}
        description="Fill in product details, pricing in INR, availability, and visibility settings."
        eyebrow="CATALOG"
        title="Create product"
      />

      <Card className="max-w-4xl p-6 sm:p-8 shadow-xs">
        <ProductForm categories={categories} submitLabel="Create product" />
      </Card>
    </>
  );
}
