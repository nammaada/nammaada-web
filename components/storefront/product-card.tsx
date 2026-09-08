import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { StorefrontProduct } from "@/lib/storefront/products";

function formatPrice(pricePaise: number) {
  return new Intl.NumberFormat("en-IN", { currency: "INR", style: "currency" }).format(pricePaise / 100);
}

export function ProductCard({ product, index }: { product: StorefrontProduct; index: number }) {
  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl sm:rounded-3xl border border-white/70 bg-gradient-to-br from-white/85 via-white/70 to-white/50 backdrop-blur-xl shadow-lg shadow-amber-950/6 transition-all duration-300 hover:border-white hover:bg-white/80">
      <Link
        className="flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-ring"
        href={`/products/${product.slug}`}
        aria-label={`View ${product.name}`}
      >
        <div className="relative aspect-square sm:aspect-[4/3] overflow-hidden border-b border-[#e5d8c6] bg-[#f4efeb]">
          {product.primary_image ? (
            <Image
              src={product.primary_image.url}
              alt={product.primary_image.alt || product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-2 text-center text-[#6e5b55]">
              <span className="font-display text-base sm:text-xl text-[#711e2c]">{String(index + 1).padStart(2, "0")}</span>
              <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider line-clamp-1">{product.name}</span>
            </div>
          )}
          {product.is_featured ? (
            <Badge className="absolute left-2 top-2 sm:left-3 sm:top-3 bg-[#711e2c] text-[#fffcf2] font-bold border-none text-[10px] sm:text-xs px-2 py-0.5 sm:px-3 sm:py-1" variant="accent">
              Featured
            </Badge>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-2.5 sm:p-5">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] sm:text-xs font-bold text-[#711e2c] tracking-wider">{String(index + 1).padStart(2, "0")}</span>
            <span className="text-xs sm:text-sm font-bold text-[#711e2c]">{formatPrice(product.price_paise)}</span>
          </div>

          <h2 className="mt-1 sm:mt-2 font-display text-xs sm:text-lg lg:text-xl leading-tight font-semibold text-[#2b1719] group-hover:text-[#711e2c] transition-colors line-clamp-1 sm:line-clamp-2">
            {product.name}
          </h2>

          {product.short_description ? (
            <p className="hidden sm:block mt-2 text-xs sm:text-sm leading-relaxed text-[#6e5b55] line-clamp-2">
              {product.short_description}
            </p>
          ) : null}

          <div className="mt-auto flex items-center justify-between gap-1.5 pt-2.5 sm:pt-4 border-t border-[#e5d8c6]/60">
            <span className="inline-flex min-h-8 sm:min-h-10 w-full sm:w-auto items-center justify-center gap-1 rounded-full bg-[#711e2c] px-2.5 sm:px-4 text-[11px] sm:text-xs font-semibold text-white transition-colors group-hover:bg-[#5a1723]">
              <span>View</span>
              <span className="hidden sm:inline">product</span>
              <ArrowUpRight aria-hidden="true" size={13} />
            </span>
            <span className="hidden sm:inline text-xs text-[#6e5b55]">
              {product.is_in_stock ? "Available" : "Unavailable"}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

