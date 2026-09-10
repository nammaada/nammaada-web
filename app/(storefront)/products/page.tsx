import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ProductCatalogView } from "@/components/storefront/product-catalog-view";
import { getStorefrontCategories } from "@/lib/storefront/categories";
import { getProducts } from "@/lib/storefront/products";

export const metadata: Metadata = {
  title: "Products",
  description: "Explore Namma Ada's traditional Kerala delicacies, handcrafted with care.",
};

export default async function ProductsPage() {
  const [categories, allProducts] = await Promise.all([
    getStorefrontCategories(),
    getProducts(),
  ]);

  return (
    <>
      <section className="bg-transparent sm:py-5 text-center">
        <Container>
          <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
            <p className="eyebrow text-center">OUR COLLECTION</p>
            <h1 className="mt-2 font-display text-2xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-[#2b1719] text-center">
              Traditional flavours,<br className="hidden sm:inline" /> timeless classics
            </h1>
            <p className="mt-2 sm:mt-3 text-xs sm:text-base leading-relaxed text-[#6e5b55] text-center max-w-lg">
              Freshly prepared Kerala delicacies, made for everyday cravings and special gatherings.
            </p>
          </div>
        </Container>
      </section>

      <section className="section-shell sm:py-2" aria-labelledby="catalog-heading">
        <Container>
          <ProductCatalogView
            categories={categories}
            initialProducts={allProducts}
          />
        </Container>
      </section>
    </>
  );
}

