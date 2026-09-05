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
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-white/70 bg-gradient-to-br from-white/80 via-white/60 to-white/40 backdrop-blur-xl shadow-xl shadow-amber-950/8 transition-all duration-300 hover:border-white hover:bg-white/75">
      <Link
        className="flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-ring"
        href={`/products/${product.slug}`}
        aria-label={`View ${product.name}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden border-b border-[#e5d8c6] bg-[#f4efeb]">
          {product.primary_image ? (
            <Image
              src={product.primary_image.url}
              alt={product.primary_image.alt || product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-4 text-center text-[#6e5b55]">
              <span className="font-display text-xl text-[#711e2c]">{String(index + 1).padStart(2, "0")}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider">{product.name}</span>
            </div>
          )}
          {product.is_featured ? (
            <Badge className="absolute left-3 top-3 bg-[#d4af37] text-[#2b1719] font-bold border-none" variant="accent">
              Featured
            </Badge>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-[#711e2c] tracking-wider">{String(index + 1).padStart(2, "0")}</span>
            <span className="text-sm font-bold text-[#711e2c]">{formatPrice(product.price_paise)}</span>
          </div>

          <h2 className="mt-2 font-display text-xl leading-tight font-semibold text-[#2b1719] group-hover:text-[#711e2c] transition-colors">
            {product.name}
          </h2>

          {product.short_description ? (
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#6e5b55] line-clamp-2">
              {product.short_description}
            </p>
          ) : null}

          <div className="mt-auto flex items-center justify-between gap-2 pt-4 border-t border-[#e5d8c6]/60">
            <span className="inline-flex min-h-10 items-center gap-1 rounded-full bg-[#711e2c] px-4 text-xs font-semibold text-white transition-colors group-hover:bg-[#5a1723]">
              View product <ArrowUpRight aria-hidden="true" size={14} />
            </span>
            <span className="text-xs text-[#6e5b55]">
              {product.is_in_stock ? "Available" : "Unavailable"}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

