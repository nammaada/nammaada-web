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
      className="relative overflow-hidden bg-gradient-to-b from-[#f8f0e5] via-[#f2e4d0] to-[#ebd7be] pt-14 pb-6 sm:pt-20 sm:pb-10"
      id="featured-products"
    >
      {/* Ambient background glow & luxury lighting */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-[450px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-white/80 via-[#fff5e8]/50 to-transparent blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 -right-28 h-[550px] w-[550px] rounded-full bg-[#dfbe96]/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 h-[450px] w-[450px] rounded-full bg-[#d6ad80]/20 blur-3xl"
        aria-hidden="true"
      />

      {/* Subtle organic silk flow behind the glass cards */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-40 select-none"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M-50 220C280 130 650 340 1050 200C1250 130 1380 180 1500 240L1500 900L-50 900Z"
          fill="url(#silk-flow-1)"
        />
        <path
          d="M-50 480C350 350 820 580 1200 420C1360 360 1440 390 1500 430L1500 900L-50 900Z"
          fill="url(#silk-flow-2)"
        />
        <defs>
          <linearGradient id="silk-flow-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e4c7a6" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#fffaf2" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#d1a97d" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="silk-flow-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff8ed" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#cfa579" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>

      <Container className="relative z-10">
        {/* Section Heading matching the FIRST reference image typography */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">OUR PRODUCTS</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.05] text-foreground">
              Traditional flavours,<br className="hidden sm:inline" /> timeless classics
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Freshly prepared Kerala delicacies, made for everyday cravings and special gatherings.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex min-h-10 shrink-0 items-center gap-1 self-start text-sm font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:self-auto"
          >
            View all products <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </div>

        {/* Product Cards Grid */}
        {products.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-white/70 bg-white/45 p-8 sm:p-12 text-center backdrop-blur-xl shadow-xl shadow-amber-950/5">
            <p className="eyebrow">Coming to the table</p>
            <h3 className="mt-3 font-display text-2xl text-foreground sm:text-3xl">Our featured collection is being prepared.</h3>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">Featured products will appear here when they are available.</p>
          </div>
        ) : (
          <div className="mt-10 sm:mt-12 grid gap-6 md:grid-cols-2">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="group relative flex flex-col sm:flex-row items-stretch gap-5 rounded-3xl border border-white/70 bg-gradient-to-br from-white/75 via-white/55 to-white/40 p-4 sm:p-5 backdrop-blur-xl shadow-xl shadow-amber-950/8 transition-all duration-300 hover:border-white hover:bg-white/65 hover:shadow-2xl hover:shadow-amber-950/12"
              >
                {/* Left side: Product Image */}
                <div className="relative aspect-[4/3] sm:aspect-square md:aspect-[4/3] w-full sm:w-[46%] shrink-0 overflow-hidden rounded-2xl bg-secondary">
                  {product.primary_image ? (
                    <Image
                      src={product.primary_image.url}
                      alt={product.primary_image.alt || product.name}
                      fill
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      sizes="(min-width: 768px) 30vw, 100vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-4 text-center text-xs uppercase tracking-wider text-muted-foreground">
                      {product.name}
                    </div>
                  )}
                </div>

                {/* Right side: Product Information */}
                <div className="flex flex-1 flex-col justify-between py-1 sm:py-1">
                  <div>
                    {/* Numbering: 01, 02, etc. — Clearly visible matching FIRST image */}
                    <span className="text-sm sm:text-base font-semibold text-primary/70 tracking-wider">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* Product Name — font-display serif matching FIRST image */}
                    <h3 className="mt-1 font-display text-2xl sm:text-[26px] font-normal leading-tight text-foreground">
                      <Link href={`/products/${product.slug}`} className="transition-colors hover:text-primary">
                        {product.name}
                      </Link>
                    </h3>

                    {/* Short Description */}
                    {product.short_description ? (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground line-clamp-3">
                        {product.short_description}
                      </p>
                    ) : null}
                  </div>

                  {/* Bottom: Price & View product button */}
                  <div className="mt-6 flex w-full items-center justify-between gap-4 pt-2">
                    <span className="text-sm sm:text-base font-semibold text-primary font-sans">
                      {formatPrice(product.price_paise)}
                    </span>
                    <Link
                      href={`/products/${product.slug}`}
                      className="inline-flex min-h-10 items-center gap-1 rounded-full bg-primary px-4.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      <span>View product</span>
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

