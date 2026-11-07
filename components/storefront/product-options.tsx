"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Minus, Plus, ShoppingCart, Zap, MapPin, AlertCircle, Info } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getIndianStates, findState } from "@/lib/constants/india-geo";
import { getShippingQuoteAction } from "@/actions/shipping";
import type { StorefrontProduct, StorefrontProductVariant } from "@/lib/storefront/products";
import type { StateShippingQuote } from "@/lib/shipping/rules";

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
  const activeStateCode = selectedState || "";
  const activeStateObj = activeStateCode ? findState(activeStateCode) : null;
  const [shippingQuote, setShippingQuote] = useState<StateShippingQuote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);

  useEffect(() => {
    if (!activeStateCode) return;
    let isMounted = true;
    queueMicrotask(() => {
      if (isMounted) setIsLoadingQuote(true);
    });

    getShippingQuoteAction(activeStateCode)
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
  }, [activeStateCode]);

  const handleStateChange = (newCode: string) => {
    setSelectedState(newCode);
    if (!newCode) setShippingQuote(null);
  };

  // Delivery Eligibility Calculations
  const isBangaloreOnly = product.delivery_scope === "bangalore_only";
  const isStateKarnataka = activeStateCode.toUpperCase() === "KA";
  const isStateSelected = Boolean(activeStateCode);

  // If Bangalore-only and state is not Karnataka, delivery is blocked
  const isLocationBlocked = isStateSelected && isBangaloreOnly && !isStateKarnataka;

  // If normal product or free shipping product and state is unconfigured/inactive, delivery is blocked
  const isShippingUnavailable =
    isStateSelected && shippingQuote !== null && !shippingQuote.isAvailable;

  const canProceedToOrder = available && isStateSelected && !isLocationBlocked && !isShippingUnavailable;

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
      state: activeStateCode,
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
      <div className="rounded-2xl border border-[#eedec8] bg-white/70 p-4 sm:p-5 backdrop-blur-md shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label
            htmlFor="pdpDeliveryState"
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2b1719]"
          >
            <MapPin size={15} className="text-[#711e2c]" />
            <span>Select Delivery State / UT:</span>
          </label>

          <select
            id="pdpDeliveryState"
            value={activeStateCode}
            onChange={(e) => handleStateChange(e.target.value)}
            className="rounded-xl border border-[#dfd0bd] bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-[#2b1719] focus:border-[#711e2c] focus:outline-hidden cursor-pointer"
          >
            <option value="">Select your delivery state / UT</option>
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
        </div>

        {/* Dynamic Estimated Price Breakdown */}
        <div className="rounded-xl border border-[#eedec8]/70 bg-[#fdfaf5] p-3 text-xs sm:text-sm space-y-1.5">
          <div className="flex items-center justify-between text-[#6e5b55]">
            <span>Product Price ({displayQuantity} {displayQuantity === 1 ? "unit" : "units"}):</span>
            <span className="font-semibold text-[#2b1719]">{formatPrice(subtotalPaise)}</span>
          </div>

          <div className="flex items-center justify-between text-[#6e5b55]">
            <span>Shipping{activeStateObj ? ` to ${activeStateObj.name}` : ""}:</span>
            {!isStateSelected ? (
              <span className="font-medium text-[#711e2c]">Select state above</span>
            ) : isLoadingQuote ? (
              <span className="animate-pulse text-[#6e5b55]">Calculating...</span>
            ) : !shippingQuote?.isAvailable ? (
              <span className="font-bold text-amber-800">Delivery unavailable</span>
            ) : product.is_free_shipping || shippingQuote.chargePaise === 0 ? (
              <span className="font-bold text-emerald-700">Free Delivery</span>
            ) : (
              <span className="font-semibold text-[#2b1719]">+{formatPrice(shippingQuote.chargePaise)}</span>
            )}
          </div>

          <div className="border-t border-[#eedec8] pt-1.5 flex items-center justify-between font-bold text-sm sm:text-base text-[#711e2c]">
            <span>Estimated Total:</span>
            {!isStateSelected ? (
              <span className="text-xs text-[#6e5b55] font-sans font-normal">Select state to calculate</span>
            ) : canProceedToOrder ? (
              <span className="font-display font-bold">{formatPrice(estimatedTotalPaise)}</span>
            ) : (
              <span className="text-xs text-amber-900 font-sans font-semibold">Delivery unavailable</span>
            )}
          </div>
        </div>

        {/* Informative Alerts based on selected state */}
        {!isStateSelected ? (
          <div className="flex items-start gap-2 rounded-xl border border-[#eedec8] bg-white p-3 text-xs text-[#6e5b55] leading-relaxed">
            <Info size={16} className="shrink-0 text-[#711e2c] mt-0.5" />
            <span>
              Please select your delivery destination state above to view shipping charges and order availability.
            </span>
          </div>
        ) : isLocationBlocked ? (
          <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 leading-relaxed">
            <AlertCircle size={16} className="shrink-0 text-amber-700 mt-0.5" />
            <span>
              <strong>Perishable Delicacy:</strong> {product.name} is handcrafted fresh daily and deliverable exclusively in Bangalore. It cannot be shipped to {activeStateObj?.name}. Please select Karnataka for Bangalore delivery.
            </span>
          </div>
        ) : isBangaloreOnly && isStateKarnataka ? (
          <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-900 leading-relaxed">
            <Info size={16} className="shrink-0 text-blue-700 mt-0.5" />
            <span>
              <strong>Bangalore Delivery Only:</strong> Fresh delicacy deliverable to Bangalore delivery zones (Cash on Delivery). Your exact 6-digit Bangalore pincode will be validated at checkout.
            </span>
          </div>
        ) : isShippingUnavailable ? (
          <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 leading-relaxed">
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
                  {!isStateSelected
                    ? "Select State to Add"
                    : isLocationBlocked || isShippingUnavailable
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
                  {!isStateSelected
                    ? "Select State to Buy"
                    : isLocationBlocked || isShippingUnavailable
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
              : isLocationBlocked
              ? "Please select Karnataka for Bangalore delivery."
              : isShippingUnavailable
              ? "Delivery is unavailable for this state."
              : "Revalidated securely at checkout."}
          </p>
        )}
      </div>
    </div>
  );
}
