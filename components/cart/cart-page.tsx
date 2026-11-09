"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, MapPin, Sparkles, AlertCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { useCart } from "@/components/cart/cart-provider";
import { getIndianStates } from "@/lib/constants/india-geo";
import { getShippingQuoteAction } from "@/actions/shipping";
import type { CartShippingCalculationQuote } from "@/lib/shipping/rules";

function formatPrice(pricePaise: number) {
  return new Intl.NumberFormat("en-IN", { currency: "INR", style: "currency" }).format(pricePaise / 100);
}

function CartImage({ image, name }: { image: { url: string; alt: string } | null; name: string }) {
  return image ? (
    <Image src={image.url} alt={image.alt || name} fill className="object-cover" sizes="96px" />
  ) : (
    <div className="absolute inset-0 flex items-center justify-center bg-[#f4efeb] p-2 text-center text-[10px] font-semibold uppercase tracking-wider text-[#6e5b55]">
      {name}
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="rounded-2xl border border-[#e5d8c6] bg-[#fffdf8] px-6 py-12 text-center shadow-soft sm:px-10 sm:py-16">
      <div className="mx-auto max-w-md space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f4efeb] text-[#711e2c]">
          <ShoppingBag size={26} />
        </div>
        <p className="eyebrow">A little space for something special</p>
        <h2 className="font-display text-2xl sm:text-3xl text-[#2b1719] font-semibold">Your cart is empty.</h2>
        <p className="text-xs sm:text-sm text-[#6e5b55] leading-relaxed">
          Discover handcrafted Kerala delicacies made with tradition and care.
        </p>
        <div className="pt-2">
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#711e2c] px-6 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#5a1723]"
            href="/products"
          >
            Browse delicacies
          </Link>
        </div>
      </div>
    </div>
  );
}

export function CartPage() {
  const {
    items,
    itemCount,
    subtotalPaise,
    hydrated,
    setQuantity,
    removeItem,
    clearCart,
    selectedState,
    setSelectedState,
  } = useCart();

  const [shippingQuote, setShippingQuote] = useState<CartShippingCalculationQuote | null>(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);

  const indianStates = useMemo(() => getIndianStates(), []);

  // Live state shipping quote calculation
  useEffect(() => {
    if (!selectedState) return;
    let isMounted = true;
    queueMicrotask(() => {
      if (isMounted) setIsLoadingShipping(true);
    });

    const payloadItems = items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      delivery_scope: i.delivery_scope,
      is_free_shipping: i.is_free_shipping,
    }));

    getShippingQuoteAction(selectedState, payloadItems)
      .then((quote) => {
        if (!isMounted) return;
        setShippingQuote(quote);
      })
      .catch((err) => {
        console.error("Cart shipping quote error:", err);
        if (isMounted) setShippingQuote(null);
      })
      .finally(() => {
        if (isMounted) setIsLoadingShipping(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedState, items]);

  const hasBangaloreProduct =
    items.some((i) => i.delivery_scope === "bangalore_only") ||
    Boolean(shippingQuote?.hasBangaloreOnlyProducts);

  // Auto-set state to Karnataka (KA) if cart contains Bangalore-only products
  useEffect(() => {
    if (hasBangaloreProduct && selectedState !== "KA") {
      setSelectedState("KA");
    }
  }, [hasBangaloreProduct, selectedState, setSelectedState]);

  const isStateKarnataka = (selectedState || "").toUpperCase() === "KA";
  const isBangaloreDisabled =
    hasBangaloreProduct &&
    isStateKarnataka &&
    shippingQuote !== null &&
    (!shippingQuote.isAvailable || Boolean(shippingQuote.bangaloreUnavailable));

  const isBangaloreStateMismatch = Boolean(selectedState && hasBangaloreProduct && !isStateKarnataka);
  const isDeliveryUnavailable =
    (shippingQuote !== null && !shippingQuote.isAvailable) || isBangaloreDisabled || isBangaloreStateMismatch;

  const totalCartUnits = items.reduce((sum, item) => sum + item.quantity, 0);

  // Immediate quantity-aware calculation
  const shippingFeePaise = !selectedState || isDeliveryUnavailable
    ? 0
    : shippingQuote?.isBangaloreSpecial && shippingQuote.bangaloreRatePerUnitPaise !== undefined
    ? shippingQuote.isFreeShipping
      ? 0
      : totalCartUnits * shippingQuote.bangaloreRatePerUnitPaise
    : shippingQuote?.isAvailable
    ? shippingQuote.chargePaise
    : 0;

  const estimatedTotalPaise = subtotalPaise + shippingFeePaise;

  if (!hydrated) {
    return (
      <main className="section-shell py-12 sm:py-16" aria-busy="true" aria-label="Loading cart">
        <Container className="space-y-4">
          <div className="h-4 w-24 animate-pulse rounded bg-[#e5d8c6]" />
          <div className="h-10 max-w-xs animate-pulse rounded bg-[#e5d8c6]" />
          <div className="h-48 w-full animate-pulse rounded-2xl bg-[#e5d8c6]" />
        </Container>
      </main>
    );
  }

  return (
    <section className="section-shell py-8 sm:py-12">
      <Container>
        <div className="max-w-2xl">
          <p className="eyebrow">Your Selection</p>
          <h1 className="mt-1.5 font-display text-3xl sm:text-5xl font-semibold leading-tight text-[#2b1719]">
            Your Cart
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#6e5b55]">
            Review your order and select your delivery state before checkout.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="mt-8">
            <EmptyCart />
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-12">
            {/* Cart items list */}
            <div className="space-y-4" aria-label="Cart items">
              {items.map((item) => (
                <div
                  className="rounded-2xl sm:rounded-3xl border border-white/70 bg-gradient-to-br from-white/80 via-white/60 to-white/40 p-4 sm:p-5 backdrop-blur-xl shadow-xl shadow-amber-950/8"
                  key={item.lineId}
                >
                  <div className="flex gap-4">
                    {/* Item Thumbnail */}
                    <div className="relative size-20 sm:size-24 shrink-0 overflow-hidden rounded-xl bg-[#f4efeb] border border-[#e5d8c6]/60">
                      <CartImage image={item.image} name={item.name} />
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            className="font-display text-base sm:text-lg font-semibold text-[#2b1719] hover:text-[#711e2c] transition-colors"
                            href={`/products/${item.slug}`}
                          >
                            {item.name}
                          </Link>
                          {item.variantName ? (
                            <p className="mt-0.5 text-xs text-[#6e5b55] font-medium">{item.variantName}</p>
                          ) : null}
                        </div>

                        {/* Remove button (min 44px target) */}
                        <button
                          aria-label={`Remove ${item.name} from cart`}
                          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-[#711e2c] transition-colors hover:bg-[#f4efeb] cursor-pointer"
                          onClick={() => removeItem(item.lineId)}
                          type="button"
                        >
                          <Trash2 aria-hidden="true" size={18} />
                        </button>
                      </div>

                      {/* Quantity & Pricing */}
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#e5d8c6]/60">
                        <div>
                          <p className="text-xs text-[#6e5b55]">{formatPrice(item.unitPricePaise)} each</p>
                          <p className="mt-0.5 text-sm font-bold text-[#711e2c]">
                            {formatPrice(item.unitPricePaise * item.quantity)}
                          </p>
                        </div>

                        {/* Quantity Controls (min 44px touch target each) */}
                        <div className="flex items-center rounded-full border border-[#e5d8c6] bg-[#f4efeb]/60" aria-label={`Quantity for ${item.name}`}>
                          <button
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-[#711e2c] hover:bg-[#e5d8c6] cursor-pointer disabled:opacity-30"
                            disabled={item.quantity <= 1}
                            onClick={() => setQuantity(item.lineId, item.quantity - 1)}
                            type="button"
                          >
                            <Minus aria-hidden="true" size={16} />
                          </button>

                          <span aria-live="polite" className="min-w-7 text-center text-xs sm:text-sm font-bold text-[#2b1719]">
                            {item.quantity}
                          </span>

                          <button
                            aria-label={`Increase quantity of ${item.name}`}
                            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-[#711e2c] hover:bg-[#e5d8c6] cursor-pointer"
                            onClick={() => setQuantity(item.lineId, item.quantity + 1)}
                            type="button"
                          >
                            <Plus aria-hidden="true" size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Box */}
            <div className="rounded-2xl sm:rounded-3xl border border-white/45 bg-gradient-to-br from-white/50 via-[#fcf7ee]/28 to-[#f5e8d5]/18 p-5 sm:p-6 backdrop-blur-xl shadow-[0_16px_36px_-10px_rgba(43,23,25,0.08),inset_0_1px_1.5px_0_rgba(255,255,255,0.75)] space-y-5 lg:sticky lg:top-28">
              <div className="flex items-center justify-between gap-4 border-b border-[#e5d8c6] pb-4">
                <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#2b1719]">Order Summary</h2>
                <span className="text-xs text-[#6e5b55] font-semibold">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              </div>

              {/* Bangalore Special Cart Notice */}
              {hasBangaloreProduct && (
                isBangaloreStateMismatch ? (
                  <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-950 space-y-1">
                    <p className="font-bold text-red-900 flex items-center gap-1.5 text-xs">
                      <AlertCircle size={15} className="shrink-0 text-red-700" />
                      <span>Bangalore-Only Products in Cart</span>
                    </p>
                    <p className="text-[11px] text-red-800 leading-relaxed">
                      Perishable delicacies cannot be shipped outside Karnataka. Please select Karnataka for Bangalore delivery.
                    </p>
                  </div>
                ) : isBangaloreDisabled ? (
                  <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-950 space-y-1">
                    <p className="font-bold text-red-900 flex items-center gap-1.5 text-xs">
                      <AlertCircle size={15} className="shrink-0 text-red-700" />
                      <span>Bangalore Delivery Unavailable</span>
                    </p>
                    <p className="text-[11px] text-red-800 leading-relaxed">
                      Special delivery for fresh Bangalore delicacies is currently paused. Please remove restricted items to proceed.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-300/80 bg-amber-50/90 p-3 text-xs text-amber-950 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                      <Sparkles size={14} className="text-amber-700 shrink-0" />
                      <span>Bangalore Special Shipping</span>
                    </div>
                    <p className="text-[11px] text-amber-900/90 leading-relaxed">
                      Your cart contains a Bangalore-only product. Bangalore special shipping applies to all items in this cart ({formatPrice(shippingQuote?.bangaloreRatePerUnitPaise ?? 0)} per product unit).
                    </p>
                  </div>
                )
              )}

              {/* State Selector */}
              <div className="space-y-1.5 rounded-xl border border-[#e5d8c6] bg-white/70 p-3">
                <div className="flex items-center justify-between text-xs font-semibold text-[#2b1719]">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#711e2c]" />
                    <span>Delivery Destination</span>
                  </span>
                  {shippingQuote?.isAvailable && !isBangaloreStateMismatch && !isBangaloreDisabled && (
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      Eligible
                    </span>
                  )}
                </div>
                <select
                  value={hasBangaloreProduct ? "KA" : selectedState}
                  disabled={hasBangaloreProduct}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    if (!e.target.value) setShippingQuote(null);
                  }}
                  className={`w-full rounded-lg border border-[#dfd0bd] bg-[#fffdf8] px-2.5 py-2 text-xs font-medium text-[#2b1719] outline-none transition-colors focus:border-[#711e2c] focus:ring-1 focus:ring-[#711e2c]/20 cursor-pointer ${
                    hasBangaloreProduct ? "opacity-90 bg-[#fbf7f0] cursor-not-allowed" : ""
                  }`}
                >
                  {hasBangaloreProduct ? (
                    <option value="KA">Karnataka (Bengaluru Only)</option>
                  ) : (
                    <>
                      <option value="">Select State / UT</option>
                      <optgroup label="States">
                        {indianStates
                          .filter((s) => !s.isUnionTerritory)
                          .map((s) => (
                            <option key={s.code} value={s.code}>
                              {s.name}
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="Union Territories">
                        {indianStates
                          .filter((s) => s.isUnionTerritory)
                          .map((s) => (
                            <option key={s.code} value={s.code}>
                              {s.name}
                            </option>
                          ))}
                      </optgroup>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#6e5b55]">Subtotal</span>
                  <span className="font-semibold text-[#2b1719] font-mono">{formatPrice(subtotalPaise)}</span>
                </div>

                <div className="flex items-start justify-between gap-2 text-[#6e5b55]">
                  <div>
                    <span>Shipping</span>
                    {shippingQuote?.isBangaloreSpecial && isStateKarnataka && (
                      <span className="block text-[11px] text-amber-900 font-medium">
                        Bangalore Special ({formatPrice(shippingQuote.bangaloreRatePerUnitPaise ?? 0)} × {totalCartUnits} {totalCartUnits === 1 ? "unit" : "units"})
                      </span>
                    )}
                  </div>

                  {isLoadingShipping ? (
                    <span className="text-xs text-[#6e5b55] animate-pulse">Calculating...</span>
                  ) : !selectedState ? (
                    <span className="text-xs text-[#6e5b55]">Select state</span>
                  ) : isBangaloreStateMismatch ? (
                    <span className="text-xs font-bold text-amber-900">Unavailable outside Bangalore</span>
                  ) : isBangaloreDisabled ? (
                    <span className="text-xs font-bold text-amber-900">Bangalore delivery unavailable</span>
                  ) : isDeliveryUnavailable ? (
                    <span className="text-xs font-bold text-red-700">Delivery unavailable</span>
                  ) : (
                    <span className="font-semibold text-[#2b1719] font-mono">
                      {shippingFeePaise === 0 ? (
                        <span className="text-emerald-700 font-bold">FREE</span>
                      ) : (
                        formatPrice(shippingFeePaise)
                      )}
                    </span>
                  )}
                </div>

                <div className="border-t border-[#e5d8c6] pt-3 flex items-center justify-between">
                  <span className="font-display font-semibold text-base text-[#2b1719]">Estimated Total</span>
                  <span className="font-display font-bold text-lg text-[#711e2c]">
                    {isLoadingShipping ? "..." : formatPrice(estimatedTotalPaise)}
                  </span>
                </div>
              </div>

              {isDeliveryUnavailable && !isBangaloreStateMismatch && !isBangaloreDisabled && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 space-y-1">
                  <p className="font-bold">Delivery is currently unavailable for {shippingQuote?.stateName || selectedState}.</p>
                  <p className="text-[11px] text-red-700">
                    Please choose another destination state or contact support.
                  </p>
                </div>
              )}

              {/* ACTIVE PROCEED TO CHECKOUT LINK */}
              <Link
                href="/checkout"
                className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white shadow-md transition-all ${
                  !selectedState || isDeliveryUnavailable
                    ? "bg-[#711e2c]/60 pointer-events-none cursor-not-allowed"
                    : "bg-[#711e2c] hover:bg-[#5a1723] active:scale-98 cursor-pointer"
                }`}
              >
                <span>
                  {!selectedState
                    ? "Select State to Checkout"
                    : isBangaloreStateMismatch
                    ? "Select Karnataka for Bangalore Items"
                    : isBangaloreDisabled
                    ? "Bangalore Delivery Unavailable"
                    : isDeliveryUnavailable
                    ? "Delivery Unavailable"
                    : "Proceed to Checkout"}
                </span>
                <ArrowRight size={16} />
              </Link>

              <button
                className="w-full text-xs font-semibold text-[#711e2c] underline decoration-[#711e2c]/30 underline-offset-4 cursor-pointer"
                onClick={clearCart}
                type="button"
              >
                Clear entire cart
              </button>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
