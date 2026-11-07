"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, MapPin } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { getIndianStates } from "@/lib/constants/india-geo";
import { getShippingQuoteAction } from "@/actions/shipping";
import type { StateShippingQuote } from "@/lib/shipping/rules";

function formatINR(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(paise / 100);
}

export function CartDrawer() {
  const {
    items,
    itemCount,
    subtotalPaise,
    isDrawerOpen,
    closeCart,
    setQuantity,
    removeItem,
    selectedState,
    setSelectedState,
  } = useCart();

  const [shippingQuote, setShippingQuote] = useState<StateShippingQuote | null>(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const indianStates = useMemo(() => getIndianStates(), []);

  const drawerRef = useRef<HTMLDivElement>(null);

  // Live state shipping quote calculation
  useEffect(() => {
    if (!selectedState) return;
    let isMounted = true;
    queueMicrotask(() => {
      if (isMounted) setIsLoadingShipping(true);
    });
    getShippingQuoteAction(selectedState)
      .then((quote) => {
        if (!isMounted) return;
        setShippingQuote(quote);
      })
      .catch((err) => {
        console.error("Drawer shipping quote error:", err);
        if (isMounted) setShippingQuote(null);
      })
      .finally(() => {
        if (isMounted) setIsLoadingShipping(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedState]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = origOverflow;
      };
    }
  }, [isDrawerOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, closeCart]);

  if (!isDrawerOpen) return null;

  const shippingFeePaise = shippingQuote?.isAvailable ? shippingQuote.chargePaise : 0;
  const estimatedTotalPaise = subtotalPaise + shippingFeePaise;
  const isDeliveryUnavailable = shippingQuote !== null && !shippingQuote.isAvailable;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart Drawer"
      className="fixed inset-0 z-[9999] flex justify-end"
    >
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      {/* Drawer Panel: Full size on mobile, sleek slide-in drawer on tablet & desktop */}
      <aside
        ref={drawerRef}
        className="relative z-10 flex h-[100dvh] w-full sm:max-w-md flex-col bg-[#fffdf8] shadow-2xl border-l border-[#eedec8] transition-transform duration-300 ease-out animate-in slide-in-from-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eedec8] px-5 py-4 bg-[#fcf8f2]">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-[#711e2c]" />
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2b1719]">
              Your Cart
            </h2>
            <span className="rounded-full bg-[#711e2c] px-2 py-0.5 text-xs font-bold text-white">
              {itemCount}
            </span>
          </div>

          <button
            type="button"
            onClick={closeCart}
            aria-label="Close Cart"
            className="rounded-full p-2 text-[#6e5b55] hover:bg-[#eedec8]/50 hover:text-[#2b1719] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <div className="size-16 rounded-full bg-[#f4efeb] flex items-center justify-center text-[#711e2c] mb-3">
                <ShoppingBag size={28} />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#2b1719]">
                Your cart is empty
              </h3>
              <p className="text-xs text-[#6e5b55] mt-1 max-w-xs">
                Looks like you haven&apos;t added any traditional Kerala delicacies yet.
              </p>
              <button
                type="button"
                onClick={closeCart}
                className="mt-5 rounded-full bg-[#711e2c] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#5a1723] transition-all cursor-pointer"
              >
                Browse Delicacies
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#eedec8]/60">
              {items.map((item) => (
                <div
                  key={item.lineId}
                  className="flex gap-3.5 py-4 first:pt-1 last:pb-1 items-start"
                >
                  {/* Thumbnail */}
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-[#eedec8] bg-[#f4efeb]">
                    {item.image ? (
                      <Image
                        src={item.image.url}
                        alt={item.image.alt || item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[9px] font-bold text-[#6e5b55] uppercase p-1 text-center">
                        {item.name}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeCart}
                        className="text-xs sm:text-sm font-bold text-[#2b1719] hover:text-[#711e2c] line-clamp-1 transition-colors"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(item.lineId)}
                        aria-label={`Remove ${item.name}`}
                        className="text-[#6e5b55] hover:text-red-700 transition-colors p-1 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {item.variantName && (
                      <p className="text-[11px] text-[#6e5b55]">{item.variantName}</p>
                    )}

                    <div className="mt-2.5 flex items-center justify-between">
                      {/* Quantity selector [-] qty [+] */}
                      <div className="flex items-center rounded-lg border border-[#eedec8] bg-white text-xs font-bold text-[#2b1719]">
                        <button
                          type="button"
                          onClick={() => setQuantity(item.lineId, Math.max(1, item.quantity - 1))}
                          className="px-2 py-1 text-[#6e5b55] hover:bg-[#f4efeb] hover:text-[#2b1719] transition-colors cursor-pointer disabled:opacity-30"
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-6 text-center font-semibold text-xs text-[#2b1719]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(item.lineId, item.quantity + 1)}
                          className="px-2 py-1 text-[#6e5b55] hover:bg-[#f4efeb] hover:text-[#2b1719] transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      {/* Line Total */}
                      <span className="font-bold text-xs sm:text-sm text-[#711e2c]">
                        {formatINR(item.unitPricePaise * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with State Selector, Subtotal & Proceed to Checkout */}
        {items.length > 0 && (
          <div className="border-t border-[#eedec8] bg-[#fcf8f2] p-4 sm:p-5 space-y-3">
            {/* Delivery State Selector */}
            <div className="space-y-1 rounded-xl border border-[#eedec8] bg-white/80 p-2.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#2b1719]">
                <span className="flex items-center gap-1 text-[#711e2c]">
                  <MapPin size={12} />
                  <span>Deliver to</span>
                </span>
                {shippingQuote?.isAvailable && (
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                    Eligible
                  </span>
                )}
              </div>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  if (!e.target.value) setShippingQuote(null);
                }}
                className="w-full rounded-lg border border-[#dfd0bd] bg-[#fffdf8] px-2 py-1.5 text-xs font-medium text-[#2b1719] outline-none transition-colors focus:border-[#711e2c] cursor-pointer"
              >
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
              </select>
            </div>

            {/* Price breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[#6e5b55]">
                <span>Subtotal</span>
                <span className="font-medium text-[#2b1719]">{formatINR(subtotalPaise)}</span>
              </div>

              <div className="flex items-center justify-between text-[#6e5b55]">
                <span>Shipping</span>
                {isLoadingShipping ? (
                  <span className="text-[11px] text-[#6e5b55] animate-pulse">Calculating...</span>
                ) : !selectedState ? (
                  <span className="text-[11px] text-[#6e5b55]">Select state</span>
                ) : shippingQuote ? (
                  shippingQuote.isAvailable ? (
                    <span className="font-semibold text-[#2b1719]">
                      {shippingQuote.chargePaise === 0 ? (
                        <span className="text-emerald-700 font-bold">FREE</span>
                      ) : (
                        formatINR(shippingQuote.chargePaise)
                      )}
                    </span>
                  ) : (
                    <span className="font-bold text-red-700">Delivery unavailable</span>
                  )
                ) : (
                  <span className="text-[11px] text-[#6e5b55]">Select state</span>
                )}
              </div>

              <div className="border-t border-[#eedec8] pt-2 flex items-center justify-between">
                <span className="font-bold text-[#2b1719] text-sm">Estimated Total</span>
                <span className="font-serif text-base font-bold text-[#711e2c]">
                  {isLoadingShipping ? "..." : formatINR(estimatedTotalPaise)}
                </span>
              </div>
            </div>

            {isDeliveryUnavailable && (
              <p className="text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg p-2 text-center">
                Delivery is currently unavailable for {shippingQuote?.stateName}.
              </p>
            )}

            <Link
              href="/checkout"
              onClick={closeCart}
              className={`flex items-center justify-center gap-2 w-full rounded-full py-3 text-sm font-bold text-white shadow-lg transition-all ${
                !selectedState || isDeliveryUnavailable
                  ? "bg-[#711e2c]/60 pointer-events-none cursor-not-allowed"
                  : "bg-[#711e2c] hover:bg-[#5a1723] active:scale-[0.99] cursor-pointer"
              }`}
            >
              <span>
                {!selectedState
                  ? "Select State to Checkout"
                  : isDeliveryUnavailable
                  ? "Delivery Unavailable"
                  : "Proceed to Checkout"}
              </span>
              <ArrowRight size={16} />
            </Link>

            <button
              type="button"
              onClick={closeCart}
              className="w-full text-center text-xs text-[#6e5b55] hover:text-[#2b1719] font-medium pt-0.5 transition-colors cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
