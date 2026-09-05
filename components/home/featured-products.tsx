import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import type { StorefrontProduct } from "@/lib/storefront/products";

function formatPrice(pricePaise: number) {
  return new Intl.NumberFormat("en-IN", { currency: "INR", style: "currency" }).format(pricePaise / 100);
}

export function FeaturedProducts({ products }: { products: StorefrontProduct[] }) {
  return (
    <section
      className="relative overflow-hidden py-12 sm:py-16 lg:py-20"
      id="featured-products"
    >
      <Container className="relative z-10">
        {/* Section Heading matching Reference 2 */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">OUR PRODUCTS</p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-[#2b1719]">
              Traditional Flavours,<br className="hidden sm:inline" /> Timeless Classics
            </h2>
            <p className="mt-2 max-w-xl text-xs sm:text-base leading-relaxed text-[#6e5b55]">
              Freshly prepared Kerala delicacies, made for everyday cravings and special gatherings.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 self-start text-xs sm:text-sm font-semibold text-[#4a0e17] underline decoration-[#4a0e17]/30 underline-offset-4 transition-colors hover:decoration-[#4a0e17] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:self-auto"
          >
            View All Products <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </div>

        {/* Translucent Warm Glass Cards Grid matching Reference 2 */}
        {products.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-white/70 bg-white/50 p-8 text-center backdrop-blur-md shadow-xl">
            <p className="eyebrow">Coming to the table</p>
            <h3 className="mt-2 font-display text-xl sm:text-2xl text-[#2b1719]">Our featured collection is being prepared.</h3>
            <p className="mx-auto mt-2 max-w-lg text-xs sm:text-sm leading-relaxed text-[#6e5b55]">Featured products will appear here when available.</p>
          </div>
        ) : (
          <div className="mt-8 sm:mt-10 grid gap-5 sm:grid-cols-2 lg:gap-6">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="group relative flex flex-col sm:flex-row items-stretch gap-4 rounded-3xl border border-white/70 bg-gradient-to-br from-white/75 via-white/55 to-white/40 p-4 sm:p-5 backdrop-blur-xl shadow-xl shadow-amber-950/8 transition-all duration-300 hover:border-white hover:bg-white/70 hover:shadow-2xl"
              >
                {/* Product Image */}
                <div className="relative aspect-[4/3] sm:aspect-square w-full sm:w-[44%] shrink-0 overflow-hidden rounded-2xl bg-secondary">
                  {product.primary_image ? (
                    <Image
                      src={product.primary_image.url}
                      alt={product.primary_image.alt || product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(min-width: 768px) 30vw, 100vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-4 text-center text-xs uppercase tracking-wider text-[#6e5b55]">
                      {product.name}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex flex-1 flex-col justify-between py-1">
                  <div>
                    {/* Index Number: 01, 02, etc. */}
                    <span className="text-xs sm:text-sm font-bold text-[#4a0e17] tracking-wider">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* Title */}
                    <h3 className="mt-1 font-display text-xl sm:text-2xl font-semibold leading-tight text-[#2b1719]">
                      <Link href={`/products/${product.slug}`} className="transition-colors hover:text-[#4a0e17]">
                        {product.name}
                      </Link>
                    </h3>

                    {/* Short Description */}
                    {product.short_description ? (
                      <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#6e5b55] line-clamp-3">
                        {product.short_description}
                      </p>
                    ) : null}
                  </div>

                  {/* Price & Enquire Now / View CTA */}
                  <div className="mt-4 flex items-center justify-between gap-3 pt-2 border-t border-[#4a0e17]/15">
                    <span className="text-sm sm:text-base font-semibold text-[#4a0e17]">
                      {formatPrice(product.price_paise)}
                    </span>
                    <Link
                      href={`/products/${product.slug}`}
                      className="inline-flex min-h-10 items-center gap-1 rounded-full bg-[#5c111a] hover:bg-[#480d14] px-4.5 py-2 text-xs font-semibold text-white shadow-md transition-all active:scale-95"
                    >
                      <span>Enquire Now</span>
                      <ArrowUpRight aria-hidden="true" size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}


