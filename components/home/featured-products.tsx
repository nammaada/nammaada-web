"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import type { StorefrontProduct } from "@/lib/storefront/products";

function formatPrice(pricePaise: number) {
  return new Intl.NumberFormat("en-IN", { currency: "INR", style: "currency" }).format(pricePaise / 100);
}

export function FeaturedProducts({ products }: { products: StorefrontProduct[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, offsetWidth } = carouselRef.current;
    if (offsetWidth > 0) {
      const index = Math.round(scrollLeft / offsetWidth);
      setActiveIndex(index);
    }
  };

  const scrollToSlide = (index: number) => {
    if (!carouselRef.current) return;
    const { offsetWidth } = carouselRef.current;
    carouselRef.current.scrollTo({
      left: index * offsetWidth,
      behavior: "smooth",
    });
    setActiveIndex(index);
  };

  return (
    <section
      className="relative overflow-hidden py-6 sm:py-10 lg:py-14"
      id="featured-products"
    >
      <Container className="relative z-10">
        {/* Section Heading matching Reference 2 */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">OUR PRODUCTS</p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-[#2b1719]">
              Crafted fresh, served with love.
            </h2>
            <p className="mt-2 max-w-xl text-xs sm:text-base leading-relaxed text-[#6e5b55]">
              Every order is prepared fresh, never rushed.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 self-start text-xs sm:text-sm font-semibold text-[#711e2c] underline decoration-[#711e2c]/30 underline-offset-4 transition-colors hover:decoration-[#711e2c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:self-auto"
          >
            View All Products <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </div>

        {/* Translucent Warm Glass Cards Grid matching Reference 1 */}
        {products.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-white/45 bg-gradient-to-br from-white/50 via-[#fcf7ee]/28 to-[#f5e8d5]/18 p-8 text-center backdrop-blur-xl shadow-[0_16px_36px_-10px_rgba(43,23,25,0.08),inset_0_1px_1px_0_rgba(255,255,255,0.7)]">
            <p className="eyebrow">Coming to the table</p>
            <h3 className="mt-2 font-display text-xl sm:text-2xl text-[#2b1719]">Our featured collection is being prepared.</h3>
            <p className="mx-auto mt-2 max-w-lg text-xs sm:text-sm leading-relaxed text-[#6e5b55]">Featured products will appear here when available.</p>
          </div>
        ) : (
          <>
            <div
              ref={carouselRef}
              onScroll={handleScroll}
              className="mt-8 sm:mt-10 flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 pb-2 sm:pb-0 sm:grid sm:grid-cols-2 sm:gap-5 lg:gap-6 sm:overflow-visible"
            >
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="w-full min-w-full sm:min-w-0 shrink-0 snap-center sm:w-auto sm:shrink group relative flex flex-col sm:flex-row items-stretch gap-4 rounded-3xl border border-white/45 bg-gradient-to-br from-white/50 via-[#fcf7ee]/28 to-[#f5e8d5]/18 p-4 sm:p-5 backdrop-blur-xl shadow-[0_16px_36px_-10px_rgba(43,23,25,0.08),inset_0_1px_1px_0_rgba(255,255,255,0.7)] transition-all duration-300 hover:border-white/60 hover:from-white/60 hover:via-[#fcf7ee]/38 hover:to-[#f5e8d5]/24 hover:shadow-[0_20px_40px_-10px_rgba(43,23,25,0.12),inset_0_1px_1.5px_0_rgba(255,255,255,0.85)]"
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
                      <span className="text-xs sm:text-sm font-bold text-[#711e2c] tracking-wider">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      {/* Title */}
                      <h3 className="mt-1 font-display text-xl sm:text-2xl font-semibold leading-tight text-[#2b1719]">
                        <Link href={`/products/${product.slug}`} className="transition-colors hover:text-[#711e2c]">
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
                    <div className="mt-4 flex items-center justify-between gap-3 pt-2 border-t border-[#711e2c]/15">
                      <span className="text-sm sm:text-base font-semibold text-[#711e2c]">
                        {formatPrice(product.price_paise)}
                      </span>
                      <Link
                        href={`/products/${product.slug}`}
                        className="inline-flex min-h-10 items-center gap-1 rounded-full bg-[#711e2c] hover:bg-[#5a1723] px-4.5 py-2 text-xs font-semibold text-white shadow-md transition-all active:scale-95"
                      >
                        <span>Enquire Now</span>
                        <ArrowUpRight aria-hidden="true" size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Swipe Indicators */}
            {products.length > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2 sm:hidden">
                {products.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Go to product ${idx + 1}`}
                    onClick={() => scrollToSlide(idx)}
                    className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                      activeIndex === idx
                        ? "w-6 bg-[#711e2c]"
                        : "w-2 bg-[#711e2c]/25 hover:bg-[#711e2c]/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </Container>
    </section>
  );
}


