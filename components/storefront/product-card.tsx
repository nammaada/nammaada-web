import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { StorefrontProduct } from "@/lib/storefront/products";

function formatPrice(pricePaise: number) {
  return new Intl.NumberFormat("en-IN", { currency: "INR", style: "currency" }).format(pricePaise / 100);
}

export function ProductCard({ product, index }: { product: StorefrontProduct; index: number }) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl" variant="bordered">
      <Link
        className="flex h-full flex-col rounded-[inherit] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-ring"
        href={`/products/${product.slug}`}
        aria-label={`View ${product.name}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden border-b border-border bg-secondary">
          {product.primary_image ? (
            <Image
              src={product.primary_image.url}
              alt={product.primary_image.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-5 text-center text-muted-foreground">
              <span className="font-display text-2xl text-primary/60">{String(index + 1).padStart(2, "0")}</span>
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em]">Approved product imagery will appear here</span>
            </div>
          )}
          {product.is_featured ? <Badge className="absolute left-4 top-4" variant="accent">Featured</Badge> : null}
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <span className="text-xs font-semibold tracking-[0.12em] text-primary/55">{String(index + 1).padStart(2, "0")}</span>
            <span className="text-sm font-semibold text-primary">{formatPrice(product.price_paise)}</span>
          </div>
          <h2 className="mt-3 font-display text-2xl leading-tight text-foreground">{product.name}</h2>
          {product.short_description ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{product.short_description}</p> : null}

          <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
            <span className="inline-flex min-h-10 items-center gap-1 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors group-hover:bg-primary/90">
              View product <ArrowUpRight aria-hidden="true" size={14} />
            </span>
            <span className="text-xs text-muted-foreground" aria-label={product.is_in_stock ? "Available to enquire" : "Currently unavailable"}>
              {product.is_in_stock ? "Available" : "Currently unavailable"}
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
