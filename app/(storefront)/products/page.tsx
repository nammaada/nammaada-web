import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/storefront/product-card";
import { Container } from "@/components/ui/container";
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
    <div className="rounded-2xl border border-[#e5d8c6] bg-[#fffdf8] px-6 py-10 text-center shadow-soft sm:px-10 sm:py-14">
      <div className="relative mx-auto max-w-xl">
        <p className="eyebrow">Coming to the table</p>
        <h2 className="mt-2 font-display text-2xl sm:text-3xl text-[#2b1719]">Something delicious is being prepared.</h2>
        <p className="mt-3 text-xs sm:text-sm text-[#6e5b55]">Our collection will appear here as Namma Ada delicacies become available.</p>
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
      <section className="bg-transparent py-10 sm:py-14">
        <Container>
          <div className="max-w-3xl">
            <p className="eyebrow">OUR COLLECTION</p>
            <h1 className="mt-2 font-display text-3xl sm:text-5xl font-semibold leading-tight text-[#2b1719]">
              Traditional flavours,<br className="hidden sm:inline" /> timeless classics
            </h1>
            <p className="mt-3 text-xs sm:text-base leading-relaxed text-[#6e5b55]">
              Freshly prepared Kerala delicacies, made for everyday cravings and special gatherings.
            </p>
          </div>
        </Container>
      </section>

      <section className="section-shell py-8 sm:py-12" aria-labelledby="catalog-heading">
        <Container>
          {/* CATEGORY FILTER PILLS (Touch friendly horizontal scroll) */}
          {categories.length > 0 ? (
            <nav aria-label="Product categories" className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              <Link
                className={`shrink-0 rounded-full border px-4 py-2 text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                  !selectedCategory
                    ? "border-[#711e2c] bg-[#711e2c] text-white"
                    : "border-[#e5d8c6] bg-[#fffdf8] text-[#711e2c] hover:border-[#711e2c]/50"
                }`}
                href="/products"
              >
                All products
              </Link>
              {categories.map((category) => {
                const isSelected = selectedCategory?.id === category.id;
                return (
                  <Link
                    key={category.id}
                    className={`shrink-0 rounded-full border px-4 py-2 text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                      isSelected
                        ? "border-[#711e2c] bg-[#711e2c] text-white"
                        : "border-[#e5d8c6] bg-[#fffdf8] text-[#711e2c] hover:border-[#711e2c]/50"
                    }`}
                    href={`/products?category=${encodeURIComponent(category.slug)}`}
                  >
                    {category.name}
                  </Link>
                );
              })}
            </nav>
          ) : null}

          {/* CATALOG HEADER */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p id="catalog-heading" className="eyebrow">
                {selectedCategory ? selectedCategory.name : "All Delicacies"}
              </p>
              <p className="mt-1 text-xs sm:text-sm text-[#6e5b55]">
                {products.length === 1 ? "1 delicacy available" : `${products.length} delicacies available`}
              </p>
            </div>
            {selectedCategory ? (
              <Link
                className="text-xs sm:text-sm font-semibold text-[#711e2c] underline decoration-[#711e2c]/30 underline-offset-4"
                href="/products"
              >
                Clear filter
              </Link>
            ) : null}
          </div>

          {/* CATALOG GRID */}
          {products.length === 0 ? (
            <EmptyCatalog />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product, index) => (
                <ProductCard key={product.id} index={index} product={product} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

