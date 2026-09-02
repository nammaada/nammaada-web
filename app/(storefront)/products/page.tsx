import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/storefront/product-card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getStorefrontCategories } from "@/lib/storefront/categories";
import { getProducts } from "@/lib/storefront/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products",
  description: "Explore Namma Ada's traditional Kerala delicacies, handcrafted with care.",
};

type ProductsPageProps = {
  searchParams: Promise<{ category?: string | string[] }>;
};

function getCategorySlug(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function EmptyCatalog() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-10 text-center shadow-soft sm:px-10 sm:py-14">
      <div aria-hidden="true" className="absolute -right-16 -top-16 size-40 rounded-full border border-accent/20" />
      <div aria-hidden="true" className="absolute -bottom-20 -left-12 size-36 rounded-full border border-primary/10" />
      <div className="relative mx-auto max-w-xl">
        <div aria-hidden="true" className="mx-auto mb-5 flex items-center justify-center gap-3 text-accent">
          <span className="h-px w-10 bg-accent/40" />
          <span className="size-1.5 rounded-full bg-accent" />
          <span className="h-px w-10 bg-accent/40" />
        </div>
        <p className="eyebrow">Coming to the table</p>
        <h2 className="mx-auto mt-3 max-w-lg font-display text-3xl leading-tight text-foreground sm:text-4xl">Something delicious is being prepared.</h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground">Our collection will appear here as Namma Ada delicacies become available.</p>
      </div>
    </div>
  );
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const requestedCategory = getCategorySlug(params.category);
  const [categories, allProducts] = await Promise.all([getStorefrontCategories(), getProducts()]);
  const selectedCategory = categories.find((category) => category.slug === requestedCategory);
  const products = selectedCategory ? allProducts.filter((product) => product.category_id === selectedCategory.id) : allProducts;

  return (
    <>
      <section className="bg-secondary/45 pb-10 pt-24 sm:pb-12 sm:pt-32">
        <Container>
          <div className="max-w-3xl">
            <SectionHeading
              eyebrow="Our products"
              title={<>Traditional flavours,<br className="hidden sm:block" /> timeless classics.</>}
              description="Freshly prepared Kerala delicacies, made for everyday cravings and special gatherings."
            />
          </div>
        </Container>
      </section>

      <section className="section-shell pb-16 pt-10 sm:pb-20 sm:pt-12" aria-labelledby="catalog-heading">
        <Container>
          {categories.length > 0 ? (
            <nav aria-label="Product categories" className="mb-8 flex gap-2 overflow-x-auto pb-2">
              <Link className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${!selectedCategory ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-primary hover:border-primary/50"}`} href="/products">All products</Link>
              {categories.map((category) => {
                const isSelected = selectedCategory?.id === category.id;
                return <Link key={category.id} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-primary hover:border-primary/50"}`} href={`/products?category=${encodeURIComponent(category.slug)}`}>{category.name}</Link>;
              })}
            </nav>
          ) : null}

          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p id="catalog-heading" className="eyebrow">{selectedCategory ? selectedCategory.name : "The collection"}</p>
              <p className="mt-2 text-sm text-muted-foreground">{products.length === 1 ? "1 delicacy" : `${products.length} delicacies`} currently available</p>
            </div>
            {selectedCategory ? <Link className="text-sm font-semibold text-primary underline decoration-primary/30 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" href="/products">Clear filter</Link> : null}
          </div>

          {products.length === 0 ? <EmptyCatalog /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{products.map((product, index) => <ProductCard key={product.id} index={index} product={product} />)}</div>}
        </Container>
      </section>
    </>
  );
}
