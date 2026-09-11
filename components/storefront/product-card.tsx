"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Plus, Minus, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import type { StorefrontProduct } from "@/lib/storefront/products";

function formatPriceINR(pricePaise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(pricePaise / 100);
}

// Deterministic rating & review count for consistent display
function getProductRating(id: string, index: number) {
  const ratings = [4.8, 4.9, 4.7, 4.8, 4.9, 4.6];
  const reviews = [32, 28, 18, 42, 25, 14];
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) + index;
  const rating = ratings[hash % ratings.length];
  const reviewCount = reviews[hash % reviews.length];
  return { rating, reviewCount };
}

function extractWeight(name: string, desc: string | null) {
  const text = `${name} ${desc || ""}`;
  const match = text.match(/\b(\d+\s*(?:g|gm|kg|ml|l|ltr|pcs|pack|pieces))\b/i);
  if (match) return match[1].toLowerCase();
  if (name.toLowerCase().includes("oil")) return "500 ml";
  return "250 g";
}

export function ProductCard({
  product,
  index = 0,
  horizontal = false,
  showDescription = true,
}: {
  product: StorefrontProduct;
  index?: number;
  horizontal?: boolean;
  showDescription?: boolean;
}) {
  const { addItem, items } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  // Read current cart count for this product
  const cartItem = items.find((item) => item.productId === product.id);
  const cartQty = cartItem ? cartItem.quantity : 0;

  // Local adjustment if the customer taps +/- on the card directly
  const [manualAdjustment, setManualAdjustment] = useState(0);

  // When product is removed from cart or cart count becomes 0, reset to 1
  useEffect(() => {
    if (cartQty === 0) {
      setManualAdjustment(0);
    }
  }, [cartQty]);

  // If 0 in cart -> shows 1. If N in cart -> shows N + 1. Plus any manual adjustment.
  const displayQuantity = Math.max(1, (cartQty === 0 ? 1 : cartQty + 1) + manualAdjustment);

  const { rating, reviewCount } = getProductRating(product.id, index);
  const weight = extractWeight(product.name, product.short_description);

  // Determine top badge
  const badgeText = product.is_featured
    ? "Featured"
    : index === 1
    ? "Bestseller"
    : index === 2
    ? "Popular"
    : index === 3
    ? "New"
    : "Special";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);

    // Add 1 to cart
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      variantId: null,
      variantName: null,
      unitPricePaise: product.price_paise,
      image: product.primary_image,
      quantity: 1,
    });

    // Reset manual adjustment so displayed quantity naturally reflects cartQty + 1
    setManualAdjustment(0);

    setTimeout(() => {
      setIsAdding(false);
    }, 400);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (displayQuantity > 1) {
      setManualAdjustment((prev) => prev - 1);
    }
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setManualAdjustment((prev) => prev + 1);
  };

  // ─── HORIZONTAL card (desktop home page) ─────────────────────────────────────
  if (horizontal) {
    return (
      <div className="group flex flex-row overflow-hidden rounded-2xl border border-white/50 bg-gradient-to-br from-white/60 via-[#fcf7ee]/35 to-[#f5e8d5]/25 backdrop-blur-xl [transform:translateZ(0)] [backface-visibility:hidden] [isolation:isolate] shadow-[0_16px_36px_-10px_rgba(43,23,25,0.08),inset_0_1px_1.5px_0_rgba(255,255,255,0.75)] transition-all duration-300 hover:border-white/65 hover:shadow-[0_20px_40px_-10px_rgba(43,23,25,0.12),inset_0_1px_1.5px_0_rgba(255,255,255,0.85)]">

        {/* Left: image fills edge to edge - no padding, no white border */}
        <Link
          href={`/products/${product.slug}`}
          prefetch={true}
          aria-label={`View ${product.name}`}
          className="relative block shrink-0 w-[200px] overflow-hidden border-r border-white/30"
        >
          {product.primary_image ? (
            <Image
              src={product.primary_image.url}
              alt={product.primary_image.alt || product.name}
              fill
              priority={index < 3}
              loading={index < 3 ? "eager" : "lazy"}
              decoding="async"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="200px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-3 text-center text-[11px] font-semibold uppercase tracking-wider text-[#6e5b55]">
              {product.name}
            </div>
          )}

          {/* Badge overlaid on top of image */}
          <div className="absolute left-2 top-2 z-10">
            <span className="inline-flex items-center rounded-full border border-[#eedec8] bg-white/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold text-[#2b1719] shadow-2xs">
              {badgeText}
            </span>
          </div>
        </Link>

        {/* Right: content */}
        <div className="flex flex-1 flex-col p-4 gap-1.5">
          {/* Index number */}
          <span className="text-xs font-bold text-[#a07060] tracking-widest">
            {String(index + 1).padStart(2, "0")}
          </span>

          {/* Title */}
          <Link href={`/products/${product.slug}`} prefetch={true} className="block">
            <h2 className="font-serif text-lg font-bold uppercase text-[#2b1719] group-hover:text-[#711e2c] transition-colors line-clamp-1">
              {product.name}
            </h2>
          </Link>

          {/* Short Description */}
          {showDescription && product.short_description && (
            <p className="text-xs font-semibold text-[#8a4235] tracking-wide break-words">
              {product.short_description}
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1 text-xs">
            <div className="flex items-center text-amber-500">
              <Star size={11} className="fill-current" />
              <Star size={11} className="fill-current" />
              <Star size={11} className="fill-current" />
            </div>
            <span className="font-bold text-[#2b1719] ml-0.5">{rating.toFixed(1)}</span>
            <span className="text-[#6e5b55]">({reviewCount})</span>
          </div>

          {/* Price & Weight */}
          <div className="flex items-baseline gap-1">
            <span className="font-sans text-xl font-bold text-[#2b1719]">
              {formatPriceINR(product.price_paise)}
            </span>
            <span className="text-[10px] font-semibold text-[#6e5b55]">{weight}</span>
          </div>

          {/* Full Description - below price */}
          {showDescription && product.description && (
            <p className="text-xs text-[#6e5b55] leading-relaxed break-words">
              {product.description}
            </p>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom: quantity + cart */}
          <div className="pt-2 border-t border-white/50 flex items-center justify-end gap-2">

            {/* Quantity + Cart */}
            <div className="flex items-center gap-2">
              {/* Quantity Selector */}
              <div className="flex items-center rounded-xl border border-white/70 bg-white/70 backdrop-blur-xs p-1 shrink-0 shadow-2xs">
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={displayQuantity <= 1}
                  aria-label="Decrease quantity"
                  className="flex size-7 items-center justify-center rounded text-[#6e5b55] hover:bg-[#f4efeb] hover:text-[#2b1719] transition-colors cursor-pointer disabled:opacity-30"
                >
                  <Minus size={12} />
                </button>
                <span className="w-6 text-center font-bold text-xs text-[#2b1719]">
                  {displayQuantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrease}
                  aria-label="Increase quantity"
                  className="flex size-7 items-center justify-center rounded text-[#6e5b55] hover:bg-[#f4efeb] hover:text-[#2b1719] transition-colors cursor-pointer"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!product.is_in_stock}
                aria-label={`Add ${product.name} to cart`}
                className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl bg-[#711e2c] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#5a1723] active:scale-95 transition-all cursor-pointer whitespace-nowrap ${
                  isAdding ? "scale-95 opacity-90" : ""
                } disabled:opacity-50 disabled:pointer-events-none`}
              >
                <ShoppingCart size={13} className="shrink-0" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── DEFAULT vertical card (mobile + catalog) ─────────────────────────────────
  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl sm:rounded-3xl border border-white/50 bg-gradient-to-br from-white/60 via-[#fcf7ee]/35 to-[#f5e8d5]/25 backdrop-blur-xl [transform:translateZ(0)] [backface-visibility:hidden] [isolation:isolate] shadow-[0_16px_36px_-10px_rgba(43,23,25,0.08),inset_0_1px_1.5px_0_rgba(255,255,255,0.75)] transition-[border-color,background-color,box-shadow] duration-300 hover:border-white/65 hover:from-white/70 hover:via-[#fcf7ee]/45 hover:to-[#f5e8d5]/32 hover:shadow-[0_20px_40px_-10px_rgba(43,23,25,0.12),inset_0_1px_1.5px_0_rgba(255,255,255,0.85)]">
      {/* Product Image Section */}
      <Link
        href={`/products/${product.slug}`}
        prefetch={true}
        aria-label={`View ${product.name}`}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-white/25 border-b border-white/45"
      >
        {product.primary_image ? (
          <Image
            src={product.primary_image.url}
            alt={product.primary_image.alt || product.name}
            fill
            priority={index < 3}
            loading={index < 3 ? "eager" : "lazy"}
            decoding="async"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-3 text-center text-[11px] font-semibold uppercase tracking-wider text-[#6e5b55]">
            {product.name}
          </div>
        )}

        {/* Top-Left Status Badge */}
        <div className="absolute left-2 top-2 sm:left-3 sm:top-3 z-10">
          <span className="inline-flex items-center rounded-full border border-[#eedec8] bg-white/90 backdrop-blur-xs px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-[#2b1719] shadow-2xs">
            {badgeText}
          </span>
        </div>
      </Link>

      {/* Product Content Details */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-5 space-y-1 sm:space-y-2.5">
        {/* Title */}
        <Link href={`/products/${product.slug}`} prefetch={true} className="block">
          <h2 className="font-serif text-xs sm:text-lg font-bold uppercase text-[#2b1719] group-hover:text-[#711e2c] transition-colors line-clamp-1">
            {product.name}
          </h2>
        </Link>

        {/* Short Description */}
        {showDescription && product.short_description && (
          <p className="text-[11px] sm:text-xs font-semibold text-[#8a4235] tracking-wide break-words">
            {product.short_description}
          </p>
        )}

        {/* Rating Stars & Count */}
        <div className="flex items-center gap-1 text-[10px] sm:text-xs">
          <div className="flex items-center text-amber-500">
            <Star size={11} className="fill-current text-amber-500 sm:w-3 sm:h-3" />
            <Star size={11} className="fill-current text-amber-500 sm:w-3 sm:h-3" />
            <Star size={11} className="fill-current text-amber-500 sm:w-3 sm:h-3" />
          </div>
          <span className="font-bold text-[#2b1719] ml-0.5">{rating.toFixed(1)}</span>
          <span className="text-[#6e5b55]">({reviewCount})</span>
        </div>

        {/* Price & Weight */}
        <div className="flex items-baseline gap-1.5 pt-0.5">
          <span className="font-sans text-base sm:text-2xl font-bold text-[#2b1719]">
            {formatPriceINR(product.price_paise)}
          </span>
          <span className="text-[10px] sm:text-xs font-semibold text-[#6e5b55]">
            {weight}
          </span>
        </div>

        {/* Full Description - BELOW THE PRICE (1 line truncated with ... on mobile, full wrapping on desktop) */}
        {showDescription && product.description && (
          <p className="text-[11px] sm:text-xs text-[#6e5b55] leading-relaxed truncate sm:whitespace-normal sm:overflow-visible break-words">
            {product.description}
          </p>
        )}

        {/* Action Controls: Quantity [-] qty [+] & Add to Cart */}
        <div className="mt-auto pt-2 sm:pt-3 border-t border-white/50 flex items-center justify-between gap-1 sm:gap-2">
          {/* Quantity Selector */}
          <div className="flex items-center rounded-lg sm:rounded-xl border border-white/70 bg-white/70 backdrop-blur-xs text-xs font-bold text-[#2b1719] p-0.5 sm:p-1 shrink-0 shadow-2xs">
            <button
              type="button"
              onClick={handleDecrease}
              disabled={displayQuantity <= 1}
              aria-label="Decrease quantity"
              className="flex size-5 sm:size-7 items-center justify-center rounded text-[#6e5b55] hover:bg-[#f4efeb] hover:text-[#2b1719] transition-colors cursor-pointer disabled:opacity-30"
            >
              <Minus size={10} className="sm:w-3 sm:h-3" />
            </button>
            <span className="w-4 sm:w-6 text-center font-bold text-[10px] sm:text-xs text-[#2b1719]">
              {displayQuantity}
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              aria-label="Increase quantity"
              className="flex size-5 sm:size-7 items-center justify-center rounded text-[#6e5b55] hover:bg-[#f4efeb] hover:text-[#2b1719] transition-colors cursor-pointer"
            >
              <Plus size={10} className="sm:w-3 sm:h-3" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.is_in_stock}
            aria-label={`Add ${product.name} to cart`}
            className={`flex-1 min-w-0 h-7 sm:min-h-10 inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl bg-[#711e2c] px-1.5 sm:px-3.5 py-1 sm:py-2 text-[10px] sm:text-xs font-bold text-white shadow-xs hover:bg-[#5a1723] active:scale-95 transition-all cursor-pointer whitespace-nowrap overflow-hidden ${
              isAdding ? "scale-95 opacity-90" : ""
            } disabled:opacity-50 disabled:pointer-events-none`}
          >
            <ShoppingCart size={11} className="shrink-0 sm:w-3.5 sm:h-3.5" />
            <span className="sm:hidden whitespace-nowrap">Add</span>
            <span className="hidden sm:inline whitespace-nowrap">Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
