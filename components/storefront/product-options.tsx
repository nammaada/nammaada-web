"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Minus, Plus, ShoppingCart, Zap } from "lucide-react";
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
      <span className={`inline-block size-2 rounded-full ${available ? "bg-emerald-600" : "bg-[#711e2c]/35"}`} />
      {available ? "Available to order" : "Currently unavailable"}
    </p>
  );
}

export function ProductOptions({ product, variants }: { product: StorefrontProduct; variants: StorefrontProductVariant[] }) {
  const router = useRouter();
  const { addItem, items } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id ?? "");
  const [statusMessage, setStatusMessage] = useState("");
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId);
  const available = selectedVariant?.is_in_stock ?? (variants.length === 0 ? product.is_in_stock : false);

  // Sync with current cart quantity for this product / variant
  const cartItem = items.find(
    (item) => item.productId === product.id && (!selectedVariantId || item.variantId === selectedVariantId)
  );
  const cartQty = cartItem ? cartItem.quantity : 0;
  const [manualAdjustment, setManualAdjustment] = useState(0);

  // When product is removed from cart or cart count becomes 0, reset to 1
  useEffect(() => {
    if (cartQty === 0) {
      setManualAdjustment(0);
    }
  }, [cartQty]);

  // Displayed quantity: 1 when not in cart, cartQty + 1 when in cart, plus manual adjustment
  const displayQuantity = Math.max(1, (cartQty === 0 ? 1 : cartQty + 1) + manualAdjustment);

  function handleAddToCart() {
    if (!available || (variants.length > 0 && !selectedVariant)) {
      return;
    }

    // Add 1 item to cart
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      variantId: selectedVariant?.id ?? null,
      variantName: selectedVariant?.name ?? null,
      unitPricePaise: selectedVariant?.price_paise ?? product.price_paise,
      image: product.primary_image,
      quantity: 1,
    });

    // Reset manual adjustment so displayed quantity naturally reflects cartQty + 1
    setManualAdjustment(0);

    setStatusMessage(`${product.name} ${selectedVariant ? `(${selectedVariant.name})` : ""} added to your cart.`);
  }

  function handleDecrease() {
    if (displayQuantity > 1) {
      setManualAdjustment((prev) => prev - 1);
    }
  }

  function handleIncrease() {
    setManualAdjustment((prev) => prev + 1);
  }

  function handleBuyNow() {
    if (!available || (variants.length > 0 && !selectedVariant)) {
      return;
    }

    // Direct Buy Now: passes current selected quantity to checkout
    const params = new URLSearchParams({
      buyNow: "1",
      productId: product.id,
      slug: product.slug,
      name: product.name,
      variantId: selectedVariant?.id ?? "",
      variantName: selectedVariant?.name ?? "",
      unitPricePaise: String(selectedVariant?.price_paise ?? product.price_paise),
      quantity: String(displayQuantity),
      imageUrl: product.primary_image?.url ?? "",
      imageAlt: product.primary_image?.alt ?? product.name,
    });

    router.push(`/checkout?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      {/* Price & Availability */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#e5d8c6] pb-4">
        <p className="font-display text-2xl sm:text-3xl font-bold text-[#711e2c]" aria-live="polite">
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
                  className={`flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs sm:text-sm font-semibold transition-all focus-within:ring-2 focus-within:ring-[#711e2c] ${
                    selected
                      ? "border-[#711e2c] bg-[#711e2c] text-white shadow-xs"
                      : "border-[#e5d8c6] bg-[#fffdf8] text-[#2b1719] hover:border-[#711e2c]/50"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <input
                      checked={selected}
                      className="accent-[#711e2c]"
                      name="product-variant"
                      onChange={() => setSelectedVariantId(variant.id)}
                      type="radio"
                      value={variant.id}
                    />
                    <span>{variant.name}</span>
                  </span>
                  <span className={selected ? "text-white/90" : "text-[#711e2c]"}>
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
          <Badge variant="default" className="bg-[#f4efeb] text-[#711e2c] border border-[#e5d8c6] px-3 py-1 text-xs">
            {product.delivery_scope === "bangalore_only" ? "Available in Bangalore" : "Delivery across India"}
          </Badge>
          {product.is_free_shipping ? (
            <Badge variant="accent" className="bg-[#711e2c] text-[#fffcf2] font-bold px-3 py-1 text-xs">
              Free shipping
            </Badge>
          ) : null}
        </div>
      ) : null}

      {/* Primary Action Buttons (Add to Cart & Buy Now) & Status Message */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          {/* Quantity Selector: [-] qty [+] */}
          <div className="flex items-center rounded-xl border border-[#dfd0bd] bg-white text-sm font-bold text-[#2b1719] px-2 py-1 h-12 shadow-2xs">
            <button
              type="button"
              onClick={handleDecrease}
              disabled={displayQuantity <= 1}
              aria-label="Decrease quantity"
              className="flex size-9 items-center justify-center rounded-lg text-[#6e5b55] hover:bg-[#f4efeb] hover:text-[#2b1719] transition-colors cursor-pointer disabled:opacity-30"
            >
              <Minus size={15} />
            </button>
            <span className="w-8 text-center font-bold text-sm text-[#2b1719]">
              {displayQuantity}
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              aria-label="Increase quantity"
              className="flex size-9 items-center justify-center rounded-lg text-[#6e5b55] hover:bg-[#f4efeb] hover:text-[#2b1719] transition-colors cursor-pointer"
            >
              <Plus size={15} />
            </button>
          </div>

          <Button
            className="flex-1 sm:w-auto min-h-12 px-8 cursor-pointer flex items-center justify-center gap-2"
            disabled={!available || (variants.length > 0 && !selectedVariant)}
            onClick={handleAddToCart}
            type="button"
          >
            <ShoppingCart size={16} />
            <span>Add to Cart</span>
          </Button>

          <Button
            variant="secondary"
            className="w-full sm:w-auto min-h-12 px-8 cursor-pointer flex items-center justify-center gap-2 border border-[#711e2c]/30 text-[#711e2c] hover:bg-[#711e2c]/5"
            disabled={!available || (variants.length > 0 && !selectedVariant)}
            onClick={handleBuyNow}
            type="button"
          >
            <Zap size={16} />
            <span>Buy Now</span>
          </Button>
        </div>

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

