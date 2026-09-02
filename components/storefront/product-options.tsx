"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StorefrontProduct, StorefrontProductVariant } from "@/lib/storefront/products";

function formatPrice(pricePaise: number) {
  return new Intl.NumberFormat("en-IN", { currency: "INR", style: "currency" }).format(pricePaise / 100);
}

function Availability({ available }: { available: boolean }) {
  return <p className="text-sm text-muted-foreground"><span aria-hidden="true" className={`mr-2 inline-block size-2 rounded-full ${available ? "bg-emerald-700" : "bg-primary/35"}`} />{available ? "Available" : "Currently unavailable"}</p>;
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
    setStatusMessage(`${product.name} added to your cart.`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        <p className="font-display text-3xl text-primary" aria-live="polite">{selectedVariant || variants.length === 0 ? formatPrice(selectedVariant?.price_paise ?? product.price_paise) : "Choose an option"}</p>
        <Availability available={available} />
      </div>

      {variants.length > 0 ? (
        <fieldset>
          <legend className="text-sm font-semibold text-foreground">Choose an option</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {variants.map((variant) => {
              const selected = variant.id === selectedVariantId;
              return (
                <label className={`flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring ${selected ? "border-primary bg-secondary" : "border-border bg-card hover:border-primary/40"}`} key={variant.id}>
                  <span className="flex min-w-0 items-center gap-3">
                    <input checked={selected} className="accent-primary" name="product-variant" onChange={() => setSelectedVariantId(variant.id)} type="radio" value={variant.id} />
                    <span className="break-words font-semibold">{variant.name}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatPrice(variant.price_paise)}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {product.delivery_scope ? <div className="flex flex-wrap gap-2 border-t border-border pt-5"><Badge variant="default">{product.delivery_scope === "bangalore_only" ? "Available in Bangalore" : "Delivery across India"}</Badge>{product.is_free_shipping ? <Badge variant="accent">Free shipping</Badge> : null}</div> : null}

      <div className="space-y-3">
        <Button className="w-full sm:w-auto" disabled={!available || (variants.length > 0 && !selectedVariant)} onClick={handleAddToCart} type="button">Add to cart</Button>
        <p className="text-xs leading-5 text-muted-foreground" aria-live="polite">{statusMessage || (variants.length > 0 && !selectedVariant ? "Choose an option before adding this product." : !available ? "This product is currently unavailable." : "Your selection will be revalidated at checkout.")}</p>
      </div>
    </div>
  );
}
