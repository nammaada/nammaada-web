"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { createRazorpayCheckoutSession, verifyAndFinalizePayment } from "@/actions/checkout";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/checkout/schema";
import type { CartItem } from "@/lib/cart/cart";

function formatPrice(paise: number) {
  return new Intl.NumberFormat("en-IN", { currency: "INR", style: "currency" }).format(paise / 100);
}

const initialValues: CheckoutFormValues = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs sm:text-sm font-semibold text-[#2b1719]">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-red-700 font-medium" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function fieldProps(id: keyof CheckoutFormValues, error?: string) {
  return {
    id,
    name: id,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? `${id}-error` : undefined,
  };
}

function CheckoutImage({ item }: { item: CartItem }) {
  return item.image ? (
    <Image src={item.image.url} alt={item.image.alt || item.name} fill className="object-cover" sizes="64px" />
  ) : (
    <div className="absolute inset-0 flex items-center justify-center bg-[#f4efeb] p-1 text-center text-[9px] font-semibold uppercase tracking-wider text-[#6e5b55]">
      {item.name}
    </div>
  );
}

function OrderSummary({ items, subtotalPaise }: { items: CartItem[]; subtotalPaise: number }) {
  return (
    <div className="rounded-2xl sm:rounded-3xl border border-white/70 bg-gradient-to-br from-white/80 via-white/60 to-white/40 p-5 sm:p-6 backdrop-blur-xl [transform:translateZ(0)] shadow-xl shadow-amber-950/8 space-y-5 lg:sticky lg:top-28">
      <div className="flex items-center justify-between border-b border-[#e5d8c6] pb-3">
        <h2 className="font-display text-xl font-semibold text-[#2b1719]">Order Summary</h2>
        <span className="text-xs text-[#6e5b55] font-semibold">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="divide-y divide-[#e5d8c6]/60 border-b border-[#e5d8c6] pb-3">
        {items.map((item) => (
          <div className="flex gap-3 py-3 first:pt-0 last:pb-0" key={item.lineId}>
            <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-[#f4efeb] border border-[#e5d8c6]/60">
              <CheckoutImage item={item} />
            </div>
            <div className="min-w-0 flex-1">
              <Link
                className="text-xs sm:text-sm font-semibold text-[#2b1719] hover:text-[#711e2c] transition-colors"
                href={`/products/${item.slug}`}
              >
                {item.name}
              </Link>
              {item.variantName ? <p className="text-[11px] text-[#6e5b55]">{item.variantName}</p> : null}
              <p className="text-[11px] text-[#6e5b55] mt-0.5">
                {item.quantity} × {formatPrice(item.unitPricePaise)}
              </p>
            </div>
            <span className="shrink-0 text-xs sm:text-sm font-bold text-[#711e2c]">
              {formatPrice(item.unitPricePaise * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm pt-1">
        <span className="text-[#6e5b55]">Subtotal</span>
        <span className="font-bold text-[#711e2c]">{formatPrice(subtotalPaise)}</span>
      </div>

      <div className="text-xs text-[#6e5b55] leading-relaxed pt-1">
        Delivery and final total are authoritative and revalidated securely on payment.
      </div>
    </div>
  );
}

function EmptyCheckout() {
  return (
    <div className="rounded-2xl border border-[#e5d8c6] bg-[#fffdf8] px-6 py-12 text-center shadow-soft sm:px-10 sm:py-16">
      <div className="mx-auto max-w-md space-y-3">
        <p className="eyebrow">Nothing to review yet</p>
        <h1 className="font-display text-2xl sm:text-3xl text-[#2b1719] font-semibold">Your cart is empty.</h1>
        <p className="text-xs sm:text-sm text-[#6e5b55]">Add a Namma Ada selection before continuing to checkout.</p>
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

// Razorpay SDK global type declaration
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items: cartItems, subtotalPaise: cartSubtotal, hydrated, clearCart } = useCart();

  const [values, setValues] = useState<CheckoutFormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormValues, string>>>({});
  const [serverMessage, setServerMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  // Check if this is a direct "Buy Now" checkout
  const isBuyNow = searchParams.get("buyNow") === "1";
  const buyNowItem = useMemo<CartItem | null>(() => {
    if (!isBuyNow) return null;
    const productId = searchParams.get("productId");
    const slug = searchParams.get("slug") || "";
    const name = searchParams.get("name") || "";
    const variantId = searchParams.get("variantId") || null;
    const variantName = searchParams.get("variantName") || null;
    const unitPricePaise = Number(searchParams.get("unitPricePaise")) || 0;
    const quantity = Number(searchParams.get("quantity")) || 1;
    const imageUrl = searchParams.get("imageUrl");
    const imageAlt = searchParams.get("imageAlt") || name;

    if (!productId) return null;

    return {
      lineId: `${productId}:${variantId ?? "base"}`,
      productId,
      slug,
      name,
      variantId,
      variantName,
      unitPricePaise,
      quantity,
      image: imageUrl ? { url: imageUrl, alt: imageAlt } : null,
    };
  }, [isBuyNow, searchParams]);

  // Determine active checkout items (Buy Now single product vs Cart items)
  const activeItems = useMemo<CartItem[]>(() => {
    if (isBuyNow && buyNowItem) {
      return [buyNowItem];
    }
    return cartItems;
  }, [isBuyNow, buyNowItem, cartItems]);

  const activeSubtotal = useMemo(() => {
    return activeItems.reduce((total, item) => total + item.unitPricePaise * item.quantity, 0);
  }, [activeItems]);

  useEffect(() => {
    if (serverMessage) messageRef.current?.focus();
  }, [serverMessage]);

  // Pre-load Razorpay script
  useEffect(() => {
    loadRazorpayScript().catch(() => {});
  }, []);

  if (!hydrated) {
    return (
      <main className="section-shell py-12 sm:py-16" aria-busy="true" aria-label="Loading checkout">
        <Container className="space-y-4">
          <div className="h-4 w-28 animate-pulse rounded bg-[#e5d8c6]" />
          <div className="h-10 max-w-xs animate-pulse rounded bg-[#e5d8c6]" />
          <div className="h-48 w-full animate-pulse rounded-2xl bg-[#e5d8c6]" />
        </Container>
      </main>
    );
  }

  if (activeItems.length === 0) {
    return (
      <section className="section-shell py-8 sm:py-12">
        <Container>
          <EmptyCheckout />
        </Container>
      </section>
    );
  }

  function updateValue(field: keyof CheckoutFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setServerMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = checkoutSchema.safeParse(values);
    if (!result.success) {
      const nextErrors: Partial<Record<keyof CheckoutFormValues, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && field in values && !nextErrors[field as keyof CheckoutFormValues]) {
          nextErrors[field as keyof CheckoutFormValues] = issue.message;
        }
      }
      setErrors(nextErrors);
      setServerMessage("");
      return;
    }

    setErrors({});
    setServerMessage("");
    setIsSubmitting(true);

    const idempotencyKey = idempotencyKeyRef.current ?? globalThis.crypto.randomUUID();
    idempotencyKeyRef.current = idempotencyKey;

    try {
      // 1. Create Razorpay session on server (server calculates authoritative price from DB)
      const sessionResult = await createRazorpayCheckoutSession({
        idempotencyKey,
        checkout: result.data,
        items: activeItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      });

      if (!sessionResult.ok) {
        setIsSubmitting(false);
        setServerMessage(sessionResult.message);
        return;
      }

      // 2. Ensure Razorpay SDK script is loaded
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady || !window.Razorpay) {
        setIsSubmitting(false);
        setServerMessage("Unable to load payment gateway. Please check your internet connection and try again.");
        return;
      }

      // 3. Launch official Razorpay Checkout modal
      const options = {
        key: sessionResult.razorpayKeyId,
        amount: sessionResult.amountPaise,
        currency: sessionResult.currency,
        name: "Namma Ada",
        description: "Authentic Kerala Delicacies",
        order_id: sessionResult.razorpayOrderId,
        prefill: {
          name: values.fullName,
          contact: values.phone,
          email: values.email || undefined,
        },
        theme: {
          color: "#711e2c",
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            setServerMessage("Payment was cancelled. You can retry whenever you are ready.");
          },
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          setIsSubmitting(true);
          setServerMessage("Verifying payment securely...");

          // 4. Server-Side HMAC Signature Verification
          const verifyResult = await verifyAndFinalizePayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            orderNumber: sessionResult.orderNumber,
          });

          if (verifyResult.ok) {
            // Clear cart if checking out from cart
            if (!isBuyNow) {
              clearCart();
            }
            router.push(`/order-success/${verifyResult.orderNumber}`);
          } else {
            setIsSubmitting(false);
            setServerMessage(verifyResult.message);
          }
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (response: unknown) {
        console.error("Payment failed:", response);
        setIsSubmitting(false);
        setServerMessage("Payment could not be completed. Please try again or use another payment method.");
      });

      razorpayInstance.open();
    } catch (err) {
      console.error("Checkout submission exception:", err);
      setIsSubmitting(false);
      setServerMessage("An unexpected error occurred during checkout. Please try again.");
    }
  }

  return (
    <section className="section-shell py-8 sm:py-12">
      <Container>
        <div className="max-w-2xl">
          <p className="eyebrow">Secure Checkout</p>
          <h1 className="mt-1.5 font-display text-3xl sm:text-5xl font-semibold leading-tight text-[#2b1719]">
            Checkout
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#6e5b55]">
            Share your delivery details so your order can be prepared and delivered fresh.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-12">
          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {/* Step 1 Card */}
            <div className="rounded-2xl sm:rounded-3xl border border-white/70 bg-gradient-to-br from-white/80 via-white/60 to-white/40 p-5 sm:p-7 backdrop-blur-xl shadow-xl shadow-amber-950/8 space-y-5">
              <div>
                <p className="eyebrow">01</p>
                <h2 className="mt-1 font-display text-xl sm:text-2xl font-semibold text-[#2b1719]">Your details</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="fullName" label="Full name" error={errors.fullName}>
                  <Input
                    {...fieldProps("fullName", errors.fullName)}
                    error={Boolean(errors.fullName)}
                    autoComplete="name"
                    onChange={(event) => updateValue("fullName", event.target.value)}
                    value={values.fullName}
                  />
                </Field>

                <Field id="phone" label="Phone (WhatsApp enabled)" error={errors.phone}>
                  <Input
                    {...fieldProps("phone", errors.phone)}
                    error={Boolean(errors.phone)}
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="e.g. 9995811622"
                    onChange={(event) => updateValue("phone", event.target.value)}
                    value={values.phone}
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field id="email" label="Email (optional)" error={errors.email}>
                    <Input
                      {...fieldProps("email", errors.email)}
                      error={Boolean(errors.email)}
                      autoComplete="email"
                      inputMode="email"
                      onChange={(event) => updateValue("email", event.target.value)}
                      type="email"
                      value={values.email}
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* Step 2 Card */}
            <div className="rounded-2xl sm:rounded-3xl border border-white/70 bg-gradient-to-br from-white/80 via-white/60 to-white/40 p-5 sm:p-7 backdrop-blur-xl shadow-xl shadow-amber-950/8 space-y-5">
              <div>
                <p className="eyebrow">02</p>
                <h2 className="mt-1 font-display text-xl sm:text-2xl font-semibold text-[#2b1719]">Delivery address</h2>
              </div>

              <div className="space-y-4">
                <Field id="address" label="Address" error={errors.address}>
                  <textarea
                    {...fieldProps("address", errors.address)}
                    autoComplete="street-address"
                    placeholder="House / Flat / Street / Landmark"
                    className={`min-h-24 w-full resize-y rounded-xl border bg-[#fffdf8] px-3.5 py-3 text-sm sm:text-base text-[#2b1719] outline-none placeholder:text-[#6e5b55]/60 transition-all focus-visible:border-[#711e2c] focus-visible:ring-2 focus-visible:ring-[#711e2c]/20 ${
                      errors.address ? "border-red-700" : "border-[#dfd0bd]"
                    }`}
                    onChange={(event) => updateValue("address", event.target.value)}
                    value={values.address}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Field id="city" label="City" error={errors.city}>
                    <Input
                      {...fieldProps("city", errors.city)}
                      error={Boolean(errors.city)}
                      autoComplete="address-level2"
                      placeholder="e.g. Bangalore"
                      onChange={(event) => updateValue("city", event.target.value)}
                      value={values.city}
                    />
                  </Field>

                  <Field id="state" label="State" error={errors.state}>
                    <Input
                      {...fieldProps("state", errors.state)}
                      error={Boolean(errors.state)}
                      autoComplete="address-level1"
                      placeholder="e.g. Karnataka"
                      onChange={(event) => updateValue("state", event.target.value)}
                      value={values.state}
                    />
                  </Field>

                  <Field id="pincode" label="Pincode" error={errors.pincode}>
                    <Input
                      {...fieldProps("pincode", errors.pincode)}
                      error={Boolean(errors.pincode)}
                      autoComplete="postal-code"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="e.g. 560043"
                      onChange={(event) => updateValue("pincode", event.target.value)}
                      value={values.pincode}
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* Error / Status banner */}
            {serverMessage && (
              <div
                aria-live="polite"
                className="rounded-xl border border-red-300 bg-red-50 p-4 text-xs sm:text-sm text-red-800 font-medium animate-in fade-in"
                ref={messageRef}
                tabIndex={-1}
              >
                {serverMessage}
              </div>
            )}

            {/* Submit CTA */}
            <div className="space-y-2">
              <Button
                className="w-full sm:w-auto min-h-12 px-8 cursor-pointer shadow-md text-sm font-bold"
                disabled={isSubmitting}
                size="lg"
                type="submit"
              >
                {isSubmitting ? "Connecting to Razorpay..." : `Pay ${formatPrice(activeSubtotal)} with Razorpay`}
              </Button>
              <p className="text-[11px] text-[#6e5b55]">
                🔒 100% Secure Payment via Razorpay (UPI, Cards, NetBanking, Wallets).
              </p>
            </div>
          </form>

          {/* Order Summary */}
          <OrderSummary items={activeItems} subtotalPaise={activeSubtotal} />
        </div>
      </Container>
    </section>
  );
}

export function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="section-shell py-12 sm:py-16" aria-busy="true" aria-label="Loading checkout">
          <Container className="space-y-4">
            <div className="h-4 w-28 animate-pulse rounded bg-[#e5d8c6]" />
            <div className="h-10 max-w-xs animate-pulse rounded bg-[#e5d8c6]" />
            <div className="h-48 w-full animate-pulse rounded-2xl bg-[#e5d8c6]" />
          </Container>
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
