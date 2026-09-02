import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { Card } from "@/components/ui/card";
import { adminRows } from "@/lib/admin/data";
export default async function NewProductPage() { const categories = await adminRows<{id:string;name:string}>("categories"); return <><PageHeader eyebrow="Products" title="Create product" description="Prices are entered in INR and stored as paise." /><Card className="max-w-4xl p-5 sm:p-8"><ProductForm categories={categories} /></Card></>; }
