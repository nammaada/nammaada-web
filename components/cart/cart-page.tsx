"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { Container } from "@/components/ui/container";
import { useCart } from "@/components/cart/cart-provider";

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
  const { items, itemCount, subtotalPaise, hydrated, setQuantity, removeItem, clearCart } = useCart();

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
            Review your order before proceeding to checkout.
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
                          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-[#711e2c] transition-colors hover:bg-[#f4efeb]"
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
                            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-[#711e2c] hover:bg-[#e5d8c6]"
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
                            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-[#711e2c] hover:bg-[#e5d8c6]"
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
            <div className="rounded-2xl sm:rounded-3xl border border-white/45 bg-gradient-to-br from-white/50 via-[#fcf7ee]/28 to-[#f5e8d5]/18 p-5 sm:p-6 backdrop-blur-xl shadow-[0_16px_36px_-10px_rgba(43,23,25,0.08),inset_0_1px_1.5px_0_rgba(255,255,255,0.75)] space-y-5">
              <div className="flex items-center justify-between gap-4 border-b border-[#e5d8c6] pb-4">
                <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#2b1719]">Order Summary</h2>
                <span className="text-xs text-[#6e5b55] font-semibold">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6e5b55]">Subtotal</span>
                <span className="font-bold text-lg text-[#711e2c]">{formatPrice(subtotalPaise)}</span>
              </div>

              <p className="text-xs text-[#6e5b55] leading-relaxed">
                Taxes & delivery calculated securely at checkout.
              </p>

              {/* ACTIVE PROCEED TO CHECKOUT LINK */}
              <Link
                href="/checkout"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#711e2c] px-6 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#5a1723] active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </Link>

              <button
                className="w-full text-xs font-semibold text-[#711e2c] underline decoration-[#711e2c]/30 underline-offset-4"
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

