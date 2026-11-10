"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Minus,
  Plus,
  ShoppingCart,
  Zap,
  MapPin,
  AlertCircle,
  Info,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getIndianStates, findState } from "@/lib/constants/india-geo";
import { getShippingQuoteAction } from "@/actions/shipping";
import type { StorefrontProduct, StorefrontProductVariant } from "@/lib/storefront/products";
import type { CartShippingCalculationQuote } from "@/lib/shipping/rules";

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

export function ProductOptions({
  product,
  variants = [],
}: {
  product: StorefrontProduct;
  variants?: StorefrontProductVariant[];
}) {
  const router = useRouter();
  const { addItem, items, setQuantity, removeItem, selectedState, setSelectedState } = useCart();
  const [statusMessage, setStatusMessage] = useState("");

  // Variant Selection State
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants.length > 0 ? variants[0].id : null
  );

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || null;
  const currentUnitPricePaise = selectedVariant ? selectedVariant.price_paise : product.price_paise;
  const available = selectedVariant ? selectedVariant.is_in_stock : product.is_in_stock;

  // Sync with current cart quantity for this line item
  const lineId = `${product.id}:${selectedVariantId ?? "base"}`;
  const cartItem = items.find((item) => item.lineId === lineId);
  const cartQty = cartItem ? cartItem.quantity : 0;
  const [manualAdjustment, setManualAdjustment] = useState(0);

  useEffect(() => {
    queueMicrotask(() => {
      setManualAdjustment(0);
    });
  }, [cartQty, selectedVariantId]);

  const displayQuantity = Math.max(1, (cartQty === 0 ? 1 : cartQty) + manualAdjustment);

  // State-Based Shipping Dynamic Quote
  const indianStates = getIndianStates();
  const isBangaloreOnly = product.delivery_scope === "bangalore_only";
  // Bangalore-only products automatically default to Karnataka (Bangalore) and never default to unrelated states
  const activeStateCode = isBangaloreOnly ? "KA" : (selectedState || "");
  const activeStateObj = activeStateCode ? findState(activeStateCode) : null;
  const isStateSelected = Boolean(activeStateCode);
  const [shippingQuote, setShippingQuote] = useState<CartShippingCalculationQuote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);

  useEffect(() => {
    if (!activeStateCode) {
      queueMicrotask(() => {
        setShippingQuote(null);
      });
      return;
    }
    let isMounted = true;
    queueMicrotask(() => {
      if (isMounted) setIsLoadingQuote(true);
    });

    getShippingQuoteAction(activeStateCode, [
      {
        productId: product.id,
        quantity: displayQuantity,
        delivery_scope: product.delivery_scope,
        is_free_shipping: product.is_free_shipping,
      },
    ])
      .then((quote) => {
        if (!isMounted) return;
        setShippingQuote(quote);
      })
      .catch((err) => {
        console.error("Failed to load shipping quote:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingQuote(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeStateCode, displayQuantity, product.id, product.delivery_scope, product.is_free_shipping]);

  const handleStateChange = (newCode: string) => {
    if (isBangaloreOnly) return; // Do not allow changing state for Bangalore-only products
    setSelectedState(newCode);
    if (!newCode) setShippingQuote(null);
  };

  // Delivery Eligibility Calculations
  // If Bangalore-only, verify that Bangalore special delivery is active and configured in admin
  const isBangaloreDisabled =
    isBangaloreOnly &&
    shippingQuote !== null &&
    (!shippingQuote.isAvailable ||
      Boolean(shippingQuote.bangaloreUnavailable) ||
      shippingQuote.isBangaloreDeliveryActive === false);

  // If normal product and selected state is unconfigured/inactive in admin
  const isShippingUnavailable =
    !isBangaloreOnly && isStateSelected && shippingQuote !== null && !shippingQuote.isAvailable;

  const canProceedToOrder =
    available &&
    isStateSelected &&
    !isBangaloreDisabled &&
    !isShippingUnavailable &&
    !isLoadingQuote;

  // Total Estimated Price Calculation
  const subtotalPaise = currentUnitPricePaise * displayQuantity;
  const applicableShippingPaise = !shippingQuote?.isAvailable
    ? 0
    : product.is_free_shipping || shippingQuote.chargePaise === 0
    ? 0
    : shippingQuote.chargePaise;
  const estimatedTotalPaise = subtotalPaise + applicableShippingPaise;

  function handleAddToCart() {
    if (!canProceedToOrder) return;

    if (isBangaloreOnly) {
      setSelectedState("KA");
    }

    const qtyToAdd = cartItem ? 1 : displayQuantity;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      variantId: selectedVariant?.id ?? null,
      variantName: selectedVariant?.name ?? null,
      unitPricePaise: currentUnitPricePaise,
      image: product.primary_image,
      quantity: qtyToAdd,
      delivery_scope: product.delivery_scope,
      is_free_shipping: product.is_free_shipping,
    });

    setManualAdjustment(0);
    setStatusMessage(`${product.name}${selectedVariant ? ` (${selectedVariant.name})` : ""} added to your cart.`);
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
    if (!canProceedToOrder) return;

    if (isBangaloreOnly) {
      setSelectedState("KA");
    }

    const params = new URLSearchParams({
      buyNow: "1",
      productId: product.id,
      slug: product.slug,
      name: product.name,
      variantId: selectedVariant?.id ?? "",
      variantName: selectedVariant?.name ?? "",
      unitPricePaise: String(currentUnitPricePaise),
      quantity: String(displayQuantity),
      imageUrl: product.primary_image?.url ?? "",
      imageAlt: product.primary_image?.alt ?? product.name,
      state: isBangaloreOnly ? "KA" : activeStateCode,
      delivery_scope: product.delivery_scope,
    });

    router.push(`/checkout?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      {/* Price & Availability */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#e5d8c6] pb-4">
        <div className="flex items-baseline gap-2">
          <p className="font-display text-2xl sm:text-3xl font-bold text-[#711e2c]" aria-live="polite">
            {formatPrice(currentUnitPricePaise)}
          </p>
          {(selectedVariant?.name || product.weight) && (
            <span className="text-sm font-semibold text-[#6e5b55]">
              {selectedVariant ? selectedVariant.name : product.weight}
            </span>
          )}
        </div>
        <Availability available={available} />
      </div>

      {/* Product Variants (if applicable) */}
      {variants.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#6e5b55]">
            Select Quantity / Size
          </label>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const isSelected = v.id === selectedVariantId;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#711e2c] bg-[#711e2c] text-white shadow-xs"
                      : "border-[#dfd0bd] bg-white text-[#2b1719] hover:border-[#711e2c]/60"
                  }`}
                >
                  <span>{v.name}</span>
                  <span className="ml-2 font-mono text-xs opacity-90">{formatPrice(v.price_paise)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Delivery scope badges */}
      <div className="flex flex-wrap gap-2 pt-1">
        <Badge variant="default" className="bg-[#f4efeb] text-[#711e2c] border border-[#e5d8c6] px-3 py-1 text-xs">
          {isBangaloreOnly ? "Available in Bangalore" : "Delivery across India"}
        </Badge>
        {product.is_free_shipping ? (
          <Badge variant="accent" className="bg-[#711e2c] text-[#fffcf2] font-bold px-3 py-1 text-xs">
            Free shipping
          </Badge>
        ) : null}
      </div>

      {/* STATE-BASED SHIPPING SECTION */}
      <div className="rounded-2xl border border-[#e2d4c0] bg-gradient-to-br from-white/95 via-[#fffdfa] to-[#fbf7f0] p-5 shadow-xs space-y-4">
        {/* Header with Title and Scope Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eedec8]/70 pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-[#711e2c]/10 p-1.5 text-[#711e2c]">
              <MapPin size={16} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2b1719] block">
                Delivery Destination
              </span>
              <span className="text-[11px] text-[#6e5b55]">
                {isBangaloreOnly ? "Restricted fresh delicacy" : "Check live shipping fee"}
              </span>
            </div>
          </div>

          {isBangaloreOnly ? (
            <Badge variant="default" className="bg-amber-100/90 text-amber-900 border-amber-300/80 font-bold text-[11px] px-2.5 py-0.5">
              Bangalore Only · Fresh Delicacy
            </Badge>
          ) : (
            <Badge variant="default" className="bg-emerald-100/80 text-emerald-900 border-emerald-300/80 font-semibold text-[11px] px-2.5 py-0.5">
              All India Delivery
            </Badge>
          )}
        </div>

        {/* Delivery Destination Selector / Display */}
        {isBangaloreOnly ? (
          <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-3.5 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="rounded-full bg-primary/10 p-2 text-primary shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6e5b55] block">
                  Delivery Destination
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#2b1719] flex items-center gap-1.5">
                  Bengaluru, Karnataka
                  <span className="text-[11px] font-normal text-[#6e5b55]">(Bangalore)</span>
                </span>
              </div>
            </div>
            <Badge variant="default" className="bg-amber-100/90 text-amber-900 border-amber-300/80 font-bold text-[11px] px-2.5 py-1 shrink-0">
              Bengaluru Only
            </Badge>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label
              htmlFor="pdpDeliveryState"
              className="block text-xs font-semibold text-[#6e5b55]"
            >
              Select your delivery state or union territory:
            </label>

            <div className="relative">
              <select
                id="pdpDeliveryState"
                value={activeStateCode}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full h-11 appearance-none rounded-xl border border-[#dfd0bd] bg-white pl-3.5 pr-10 text-xs sm:text-sm font-semibold text-[#2b1719] shadow-2xs outline-none transition-all focus:border-[#711e2c] focus:ring-2 focus:ring-[#711e2c]/15 cursor-pointer"
              >
                <option value="">Choose State / UT for delivery quote...</option>
                <optgroup label="States">
                  {indianStates
                    .filter((s) => !s.isUnionTerritory)
                    .map((st) => (
                      <option key={st.code} value={st.code}>
                        {st.name} ({st.code})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Union Territories">
                  {indianStates
                    .filter((s) => s.isUnionTerritory)
                    .map((st) => (
                      <option key={st.code} value={st.code}>
                        {st.name} ({st.code})
                      </option>
                    ))}
                </optgroup>
              </select>
              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6e5b55]">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Estimated Price Breakdown */}
        <div className="rounded-xl border border-[#eedec8]/80 bg-[#fbf7f0] p-4 text-xs sm:text-sm space-y-2.5 shadow-2xs">
          {isBangaloreOnly ? (
            <>
              {/* Product Price per unit & quantity subtotal */}
              <div className="flex items-center justify-between text-[#6e5b55]">
                <span>
                  Product Price ({formatPrice(currentUnitPricePaise)} × {displayQuantity} {displayQuantity === 1 ? "unit" : "units"}):
                </span>
                <span className="font-semibold text-[#2b1719] font-mono">{formatPrice(subtotalPaise)}</span>
              </div>

              {/* Bangalore Special Shipping fee per unit & quantity total */}
              <div className="flex items-start justify-between gap-2 text-[#6e5b55]">
                <div>
                  <span className="font-medium text-[#2b1719]">Bangalore Special Shipping:</span>
                  {shippingQuote?.isAvailable && (
                    <span className="block text-[11px] text-[#6e5b55]">
                      {formatPrice(shippingQuote.bangaloreRatePerUnitPaise ?? 0)}/unit × {displayQuantity} {displayQuantity === 1 ? "unit" : "units"}
                    </span>
                  )}
                </div>

                {isLoadingQuote ? (
                  <span className="animate-pulse text-[#6e5b55]">Calculating...</span>
                ) : isBangaloreDisabled ? (
                  <span className="font-bold text-amber-900">Bangalore delivery unavailable</span>
                ) : product.is_free_shipping || shippingQuote?.chargePaise === 0 ? (
                  <span className="font-bold text-emerald-700">Free Delivery</span>
                ) : (
                  <span className="font-semibold text-[#2b1719] font-mono">
                    +{formatPrice(applicableShippingPaise)}
                  </span>
                )}
              </div>

              {/* Estimated Total */}
              <div className="border-t border-[#eedec8] pt-2 flex items-center justify-between font-bold text-sm sm:text-base text-[#711e2c]">
                <span>Estimated Total:</span>
                {isLoadingQuote ? (
                  <span className="animate-pulse text-xs text-[#6e5b55]">Calculating total...</span>
                ) : canProceedToOrder ? (
                  <span className="font-display font-bold text-base sm:text-lg">{formatPrice(estimatedTotalPaise)}</span>
                ) : (
                  <span className="text-xs text-amber-950 font-sans font-semibold">Bangalore delivery unavailable</span>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between text-[#6e5b55]">
                <span>Product Price ({displayQuantity} {displayQuantity === 1 ? "unit" : "units"}):</span>
                <span className="font-semibold text-[#2b1719] font-mono">{formatPrice(subtotalPaise)}</span>
              </div>

              <div className="flex items-start justify-between gap-2 text-[#6e5b55]">
                <span>Shipping:</span>
                {!isStateSelected ? (
                  <span className="font-medium text-[#711e2c]">Select state above</span>
                ) : isLoadingQuote ? (
                  <span className="animate-pulse text-[#6e5b55]">Calculating...</span>
                ) : isShippingUnavailable ? (
                  <span className="font-bold text-amber-900">Delivery unavailable</span>
                ) : product.is_free_shipping || shippingQuote?.chargePaise === 0 ? (
                  <span className="font-bold text-emerald-700">Free Delivery</span>
                ) : (
                  <span className="font-semibold text-[#2b1719] font-mono">+{formatPrice(applicableShippingPaise)}</span>
                )}
              </div>

              <div className="border-t border-[#eedec8] pt-2 flex items-center justify-between font-bold text-sm sm:text-base text-[#711e2c]">
                <span>Estimated Total:</span>
                {!isStateSelected ? (
                  <span className="text-xs text-[#6e5b55] font-sans font-normal">Select state to calculate</span>
                ) : canProceedToOrder ? (
                  <span className="font-display font-bold text-base sm:text-lg">{formatPrice(estimatedTotalPaise)}</span>
                ) : (
                  <span className="text-xs text-amber-950 font-sans font-semibold">Delivery unavailable</span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Informative Alerts based on destination and quote */}
        {isBangaloreOnly ? (
          isBangaloreDisabled ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 leading-relaxed">
              <AlertCircle size={16} className="shrink-0 text-amber-700 mt-0.5" />
              <span>
                <strong>Bangalore delivery unavailable:</strong> Special delivery for fresh Bangalore delicacies is currently paused. Please check back later or contact support.
              </span>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-primary leading-relaxed">
              <Sparkles size={16} className="shrink-0 text-primary mt-0.5" />
              <span>
                <strong>Bangalore Special Delivery:</strong> {product.name} is handcrafted fresh daily and delivered exclusively within Bengaluru ({formatPrice(shippingQuote?.bangaloreRatePerUnitPaise ?? 0)}/unit). Exact 6-digit Bangalore pincode is verified at checkout (Cash on Delivery only).
              </span>
            </div>
          )
        ) : !isStateSelected ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-[#eedec8] bg-white p-3 text-xs text-[#6e5b55] leading-relaxed">
            <Info size={16} className="shrink-0 text-[#711e2c] mt-0.5" />
            <span>
              Please select your delivery destination state above to view shipping charges and order availability.
            </span>
          </div>
        ) : isShippingUnavailable ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 leading-relaxed">
            <AlertCircle size={16} className="shrink-0 text-amber-700 mt-0.5" />
            <span>
              <strong>Delivery Unavailable:</strong> Shipping has not yet been configured for {activeStateObj?.name}. Please select another state or contact support.
            </span>
          </div>
        ) : null}
      </div>

      {/* Primary Action Buttons (Add to Cart & Buy Now) */}
      <div className="space-y-3 pt-1">
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
                className="flex-1 sm:w-auto min-h-12 px-8 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={handleAddToCart}
                disabled={!canProceedToOrder}
                type="button"
              >
                <ShoppingCart size={16} />
                <span>
                  {isBangaloreOnly
                    ? isBangaloreDisabled
                      ? "Bangalore Delivery Unavailable"
                      : "Add to Cart"
                    : !isStateSelected
                    ? "Select State to Add"
                    : isShippingUnavailable
                    ? "Delivery Unavailable"
                    : "Add to Cart"}
                </span>
              </Button>

              <Button
                variant="secondary"
                className="w-full sm:w-auto min-h-12 px-8 cursor-pointer flex items-center justify-center gap-2 border border-[#711e2c]/30 text-[#711e2c] hover:bg-[#711e2c]/5 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={handleBuyNow}
                disabled={!canProceedToOrder}
                type="button"
              >
                <Zap size={16} />
                <span>
                  {isBangaloreOnly
                    ? isBangaloreDisabled
                      ? "Bangalore Delivery Unavailable"
                      : "Buy Now"
                    : !isStateSelected
                    ? "Select State to Buy"
                    : isShippingUnavailable
                    ? "Delivery Unavailable"
                    : "Buy Now"}
                </span>
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
              ? "This selection is currently unavailable."
              : isBangaloreOnly
              ? isBangaloreDisabled
                ? "Bangalore delivery is currently unavailable."
                : "Deliverable to valid Bangalore pincodes (Cash on Delivery only)."
              : isShippingUnavailable
              ? "Delivery is unavailable for this state."
              : "Revalidated securely at checkout."}
          </p>
        )}
      </div>
    </div>
  );
}
