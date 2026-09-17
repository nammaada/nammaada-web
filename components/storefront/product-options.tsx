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

export function ProductOptions({ product, variants = [] }: { product: StorefrontProduct; variants?: StorefrontProductVariant[] }) {
  const router = useRouter();
  const { addItem, items, setQuantity, removeItem } = useCart();
  const [statusMessage, setStatusMessage] = useState("");
  const available = product.is_in_stock;

  // Sync with current cart quantity for this product
  const cartItem = items.find((item) => item.productId === product.id);
  const cartQty = cartItem ? cartItem.quantity : 0;
  const [manualAdjustment, setManualAdjustment] = useState(0);

  // When cart count changes or becomes 0, reset local adjustment
  useEffect(() => {
    setManualAdjustment(0);
  }, [cartQty]);

  // If in cart -> shows exact cartQty. If not in cart -> shows 1. Plus any local adjustment.
  const displayQuantity = Math.max(1, (cartQty === 0 ? 1 : cartQty) + manualAdjustment);

  function handleAddToCart() {
    if (!available) {
      return;
    }

    const qtyToAdd = cartItem ? 1 : displayQuantity;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      variantId: null,
      variantName: null,
      unitPricePaise: product.price_paise,
      image: product.primary_image,
      quantity: qtyToAdd,
    });

    setManualAdjustment(0);

    setStatusMessage(`${product.name} added to your cart.`);
  }

  function handleDecrease() {
    if (!available) return;
    if (cartItem) {
      if (cartItem.quantity > 1) {
        setQuantity(cartItem.lineId, cartItem.quantity - 1);
      } else {
        removeItem(cartItem.lineId);
      }
    } else {
      if (displayQuantity > 1) {
        setManualAdjustment((prev) => prev - 1);
      }
    }
  }

  function handleIncrease() {
    if (!available) return;
    if (cartItem) {
      setQuantity(cartItem.lineId, cartItem.quantity + 1);
    } else {
      setManualAdjustment((prev) => prev + 1);
    }
  }

  function handleBuyNow() {
    if (!available) {
      return;
    }

    // Direct Buy Now: passes current selected quantity to checkout
    const params = new URLSearchParams({
      buyNow: "1",
      productId: product.id,
      slug: product.slug,
      name: product.name,
      variantId: "",
      variantName: "",
      unitPricePaise: String(product.price_paise),
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
        <div className="flex items-baseline gap-2">
          <p className="font-display text-2xl sm:text-3xl font-bold text-[#711e2c]" aria-live="polite">
            {formatPrice(product.price_paise)}
          </p>
          {product.weight && (
            <span className="text-sm font-semibold text-[#6e5b55]">
              {product.weight}
            </span>
          )}
        </div>
        <Availability available={product.is_in_stock} />
      </div>

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
          <div
            className={`flex items-center rounded-xl border border-[#dfd0bd] bg-white text-sm font-bold text-[#2b1719] px-2 py-1 h-12 shadow-2xs ${
              !available ? "opacity-40 pointer-events-none" : ""
            }`}
          >
            <button
              type="button"
              onClick={handleDecrease}
              disabled={!available || displayQuantity <= 1}
              aria-label="Decrease quantity"
              className="flex size-9 items-center justify-center rounded-lg text-[#6e5b55] hover:bg-[#f4efeb] hover:text-[#2b1719] transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
            >
              <Minus size={15} />
            </button>
            <span className="w-8 text-center font-bold text-sm text-[#2b1719]">
              {available ? displayQuantity : 0}
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              disabled={!available}
              aria-label="Increase quantity"
              className="flex size-9 items-center justify-center rounded-lg text-[#6e5b55] hover:bg-[#f4efeb] hover:text-[#2b1719] transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
            >
              <Plus size={15} />
            </button>
          </div>

          {available ? (
            <>
              <Button
                className="flex-1 sm:w-auto min-h-12 px-8 cursor-pointer flex items-center justify-center gap-2"
                onClick={handleAddToCart}
                type="button"
              >
                <ShoppingCart size={16} />
                <span>Add to Cart</span>
              </Button>

              <Button
                variant="secondary"
                className="w-full sm:w-auto min-h-12 px-8 cursor-pointer flex items-center justify-center gap-2 border border-[#711e2c]/30 text-[#711e2c] hover:bg-[#711e2c]/5"
                onClick={handleBuyNow}
                type="button"
              >
                <Zap size={16} />
                <span>Buy Now</span>
              </Button>
            </>
          ) : (
            <button
              type="button"
              disabled
              className="flex-1 min-h-12 px-8 rounded-full font-bold text-sm bg-[#711e2c]/35 text-white/80 border border-[#711e2c]/20 flex items-center justify-center gap-2 cursor-not-allowed pointer-events-none shadow-none select-none"
            >
              <ShoppingCart size={16} />
              <span>Out of Stock</span>
            </button>
          )}
        </div>

        {statusMessage ? (
          <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-3 animate-in fade-in">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        ) : (
          <p className="text-xs text-[#6e5b55]" aria-live="polite">
            {!available
              ? "This product is currently unavailable."
              : "Revalidated securely at checkout."}
          </p>
        )}
      </div>
    </div>
  );
}

