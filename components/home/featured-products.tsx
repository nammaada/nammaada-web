import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/storefront/product-card";
import type { StorefrontProduct } from "@/lib/storefront/products";

export function FeaturedProducts({ products }: { products: StorefrontProduct[] }) {
  return (
    <section
      className="relative overflow-hidden py-6 sm:py-10 lg:py-14"
      id="featured-products"
    >
      <Container className="relative z-10">
        {/* Section Heading */}
        <div className="flex flex-col items-center text-center gap-3 sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div className="max-w-2xl text-center sm:text-left">
            <p className="eyebrow">OUR PRODUCTS</p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-[#2b1719]">
              Crafted fresh, served with love.
            </h2>
            <p className="mt-2 max-w-xl text-xs sm:text-base leading-relaxed text-[#6e5b55] mx-auto sm:mx-0">
              Every order is prepared fresh, never rushed.
            </p>
          </div>

          <Link
            href="/products"
            prefetch={true}
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 self-center text-xs sm:text-sm font-semibold text-[#711e2c] underline decoration-[#711e2c]/30 underline-offset-4 transition-colors hover:decoration-[#711e2c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:self-auto"
          >
            View All Products <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-[#eedec8] bg-[#fffdf8] p-8 text-center shadow-xs">
            <p className="eyebrow">Coming to the table</p>
            <h3 className="mt-2 font-display text-xl sm:text-2xl text-[#2b1719]">Our featured collection is being prepared.</h3>
            <p className="mx-auto mt-2 max-w-lg text-xs sm:text-sm leading-relaxed text-[#6e5b55]">Featured products will appear here when available.</p>
          </div>
        ) : (
          <>
            {/* Mobile: 2-col vertical grid (unchanged) */}
            <div className="mt-8 grid grid-cols-2 gap-3 lg:hidden">
              {products.map((product, index) => (
                <ProductCard key={product.id} index={index} product={product} />
              ))}
            </div>

            {/* Desktop: 2×2 horizontal card grid */}
            <div className="hidden lg:grid mt-10 grid-cols-2 gap-5">
              {products.map((product, index) => (
                <ProductCard key={product.id} index={index} product={product} horizontal />
              ))}
            </div>
          </>
        )}
      </Container>
    </section>
  );
}
