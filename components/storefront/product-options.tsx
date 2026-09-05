"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StorefrontProduct, StorefrontProductVariant } from "@/lib/storefront/products";

function formatPrice(pricePaise: number) {
  return new Intl.NumberFormat("en-IN", { currency: "INR", style: "currency" }).format(pricePaise / 100);
}

function Availability({ available }: { available: boolean }) {
  return (
    <p className="text-xs sm:text-sm text-[#6e5b55] flex items-center gap-2">
      <span className={`inline-block size-2 rounded-full ${available ? "bg-emerald-600" : "bg-[#4a0e17]/35"}`} />
      {available ? "Available to order" : "Currently unavailable"}
    </p>
  );
}

export function ProductOptions({ product, variants }: { product: StorefrontProduct; variants: StorefrontProductVariant[] }) {
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId);
  const available = selectedVariant?.is_in_stock ?? (variants.length === 0 ? product.is_in_stock : false);

  function handleAddToCart() {
    if (!available || (variants.length > 0 && !selectedVariant)) {
      return;
    }

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      variantId: selectedVariant?.id ?? null,
      variantName: selectedVariant?.name ?? null,
      unitPricePaise: selectedVariant?.price_paise ?? product.price_paise,
      image: product.primary_image,
    });
    setStatusMessage(`${product.name} ${selectedVariant ? `(${selectedVariant.name})` : ""} added to your cart.`);
  }

  return (
    <div className="space-y-6">
      {/* Price & Availability */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#e5d8c6] pb-4">
        <p className="font-display text-2xl sm:text-3xl font-bold text-[#4a0e17]" aria-live="polite">
          {selectedVariant || variants.length === 0
            ? formatPrice(selectedVariant?.price_paise ?? product.price_paise)
            : "Select an option"}
        </p>
        <Availability available={available} />
      </div>

      {/* Variant Selection Radio Pills */}
      {variants.length > 0 ? (
        <fieldset className="space-y-2.5">
          <legend className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#2b1719]">
            Select Variant
          </legend>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {variants.map((variant) => {
              const selected = variant.id === selectedVariantId;
              return (
                <label
                  key={variant.id}
                  className={`flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs sm:text-sm font-semibold transition-all focus-within:ring-2 focus-within:ring-[#4a0e17] ${
                    selected
                      ? "border-[#4a0e17] bg-[#4a0e17] text-white shadow-xs"
                      : "border-[#e5d8c6] bg-[#fffdf8] text-[#2b1719] hover:border-[#4a0e17]/50"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <input
                      checked={selected}
                      className="accent-[#d4af37]"
                      name="product-variant"
                      onChange={() => setSelectedVariantId(variant.id)}
                      type="radio"
                      value={variant.id}
                    />
                    <span>{variant.name}</span>
                  </span>
                  <span className={selected ? "text-white/90" : "text-[#4a0e17]"}>
                    {formatPrice(variant.price_paise)}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {/* Delivery scope badges */}
      {product.delivery_scope ? (
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge variant="default" className="bg-[#f4efeb] text-[#4a0e17] border border-[#e5d8c6] px-3 py-1 text-xs">
            {product.delivery_scope === "bangalore_only" ? "Available in Bangalore" : "Delivery across India"}
          </Badge>
          {product.is_free_shipping ? (
            <Badge variant="accent" className="bg-[#d4af37] text-[#2b1719] font-bold px-3 py-1 text-xs">
              Free shipping
            </Badge>
          ) : null}
        </div>
      ) : null}

      {/* Primary Add to Cart CTA & Status Message */}
      <div className="space-y-3 pt-2">
        <Button
          className="w-full sm:w-auto min-h-12 px-8"
          disabled={!available || (variants.length > 0 && !selectedVariant)}
          onClick={handleAddToCart}
          type="button"
        >
          Add to Cart
        </Button>

        {statusMessage ? (
          <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-3 animate-in fade-in">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        ) : (
          <p className="text-xs text-[#6e5b55]" aria-live="polite">
            {variants.length > 0 && !selectedVariant
              ? "Please select a variant option above before adding to cart."
              : !available
              ? "This product is currently unavailable."
              : "Revalidated securely at checkout."}
          </p>
        )}
      </div>
    </div>
  );
}

