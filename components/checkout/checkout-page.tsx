"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  createCodCheckoutSession,
  createRazorpayCheckoutSession,
  validateCheckoutLocation,
  verifyAndFinalizePayment,
} from "@/actions/checkout";
import { useCart } from "@/components/cart/cart-provider";
import { useCustomerAuth } from "@/lib/auth/customer-context";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/checkout/schema";
import type { CartItem } from "@/lib/cart/cart";
import type { PincodeValidationResult } from "@/lib/delivery/restricted-locations";

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

function OrderSummary({
  items,
  subtotalPaise,
  onRemoveItem,
}: {
  items: CartItem[];
  subtotalPaise: number;
  onRemoveItem?: (lineId: string) => void;
}) {
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
            <div className="flex flex-col items-end justify-between">
              <span className="shrink-0 text-xs sm:text-sm font-bold text-[#711e2c]">
                {formatPrice(item.unitPricePaise * item.quantity)}
              </span>
              {onRemoveItem && (
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.lineId)}
                  className="text-[11px] text-[#6e5b55] hover:text-red-700 underline mt-1"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm pt-1">
        <span className="text-[#6e5b55]">Subtotal</span>
        <span className="font-bold text-[#711e2c]">{formatPrice(subtotalPaise)}</span>
      </div>

      <div className="text-xs text-[#6e5b55] leading-relaxed pt-1">
        Delivery fee and final order total are authoritative and revalidated securely before placement.
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
  const { items: cartItems, hydrated, clearCart, removeItem } = useCart();

  const { profile } = useCustomerAuth();

  const [values, setValues] = useState<CheckoutFormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormValues, string>>>({});
  const [serverMessage, setServerMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  // Auto-fill logged-in customer profile details if fields are empty
  useEffect(() => {
    if (profile) {
      setValues((current) => ({
        ...current,
        fullName: current.fullName || profile.fullName || "",
        email: current.email || profile.email || "",
        phone: current.phone || profile.phone || "",
      }));
    }
  }, [profile]);

  useEffect(() => {
    setIsSubmitting(false);
  }, [searchParams]);

  // Payment method selection: "RAZORPAY" | "COD"
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">("RAZORPAY");

  // Dynamic pincode validation state
  const [locationValidation, setLocationValidation] = useState<PincodeValidationResult | null>(null);
  const [isValidatingLocation, setIsValidatingLocation] = useState(false);

  // Check if this is a direct "Buy Now" checkout
  const isBuyNow = searchParams.get("buyNow") === "1";
  const [buyNowRemoved, setBuyNowRemoved] = useState(false);

  const buyNowItem = useMemo<CartItem | null>(() => {
    if (!isBuyNow || buyNowRemoved) return null;
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
  }, [isBuyNow, buyNowRemoved, searchParams]);

  // Determine active checkout items (Buy Now single product vs Cart items)
  const activeItems = useMemo<CartItem[]>(() => {
    if (isBuyNow) {
      return buyNowItem ? [buyNowItem] : [];
    }
    return cartItems;
  }, [isBuyNow, buyNowItem, cartItems]);

  const activeSubtotal = useMemo(() => {
    return activeItems.reduce((total, item) => total + item.unitPricePaise * item.quantity, 0);
  }, [activeItems]);

  // Dynamic location check when 6-digit pincode is entered
  useEffect(() => {
    const cleanPin = values.pincode.trim();
    if (!/^[1-9][0-9]{5}$/.test(cleanPin) || activeItems.length === 0) {
      setLocationValidation(null);
      return;
    }

    let isMounted = true;
    setIsValidatingLocation(true);

    const productIds = Array.from(new Set(activeItems.map((i) => i.productId)));
    validateCheckoutLocation({ pincode: cleanPin, productIds })
      .then((res) => {
        if (!isMounted) return;
        setLocationValidation(res);
        // If restricted products are present, force payment method to COD
        if (res.hasRestrictedProducts) {
          setPaymentMethod("COD");
        }
      })
      .catch((err) => {
        console.error("Location validation error:", err);
      })
      .finally(() => {
        if (isMounted) setIsValidatingLocation(false);
      });

    return () => {
      isMounted = false;
    };
  }, [values.pincode, activeItems]);

  // Handle removing unavailable products (Mixed Cart requirement)
  function handleRemoveUnavailableProducts() {
    if (!locationValidation?.unavailableProducts) return;
    const unavailableIdSet = new Set(locationValidation.unavailableProducts.map((p) => p.productId));

    if (isBuyNow) {
      if (buyNowItem && unavailableIdSet.has(buyNowItem.productId)) {
        setBuyNowRemoved(true);
      }
    } else {
      for (const item of activeItems) {
        if (unavailableIdSet.has(item.productId)) {
          removeItem(item.lineId);
        }
      }
    }

    setLocationValidation(null);
    setServerMessage("");
  }

  function handleRemoveSingleItem(lineId: string) {
    if (isBuyNow) {
      setBuyNowRemoved(true);
    } else {
      removeItem(lineId);
    }
  }

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

  if (activeItems.length === 0 && !isSubmitting) {
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

  const hasUnavailableProducts =
    locationValidation &&
    !locationValidation.isValid &&
    locationValidation.code === "RESTRICTED_PRODUCTS_UNAVAILABLE" &&
    locationValidation.unavailableProducts.length > 0;

  const isRestrictedCodOnly = locationValidation?.hasRestrictedProducts === true;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (hasUnavailableProducts) {
      setServerMessage("Please remove unavailable products for your delivery location before continuing.");
      return;
    }

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

    const payloadItems = activeItems.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    // FLOW A: CASH ON DELIVERY (COD)
    if (paymentMethod === "COD" || isRestrictedCodOnly) {
      try {
        const codResult = await createCodCheckoutSession({
          idempotencyKey,
          checkout: result.data,
          items: payloadItems,
        });

        if (!codResult.ok) {
          setIsSubmitting(false);
          setServerMessage(codResult.message);
          if (codResult.unavailableProducts && codResult.unavailableProducts.length > 0) {
            setLocationValidation({
              isValid: false,
              code: "RESTRICTED_PRODUCTS_UNAVAILABLE",
              message: codResult.message,
              hasRestrictedProducts: true,
              unavailableProducts: codResult.unavailableProducts,
              allowedPaymentMethods: [],
            });
          }
          return;
        }

        // COD order placed successfully
        // Cart is cleared automatically on order-success page via <OrderClearCart />
        router.push(`/order-success/${codResult.orderNumber}`);
      } catch (err) {
        console.error("COD checkout submission error:", err);
        setIsSubmitting(false);
        setServerMessage("Could not complete Cash on Delivery order. Please try again.");
      }
      return;
    }

    // FLOW B: RAZORPAY ONLINE PAYMENT (India-Wide Products Only)
    try {
      const sessionResult = await createRazorpayCheckoutSession({
        idempotencyKey,
        checkout: result.data,
        items: payloadItems,
      });

      if (!sessionResult.ok) {
        setIsSubmitting(false);
        setServerMessage(sessionResult.message);
        return;
      }

      // Ensure Razorpay SDK script is loaded
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady || !window.Razorpay) {
        setIsSubmitting(false);
        setServerMessage("Unable to load payment gateway. Please check your internet connection and try again.");
        return;
      }

      // Launch official Razorpay Checkout modal
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

          // Strict server-side verification
          const verifyResult = await verifyAndFinalizePayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            orderNumber: sessionResult.orderNumber,
          });

          if (verifyResult.ok) {
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
        setServerMessage("Payment could not be completed. Please try again or use Cash on Delivery.");
      });

      razorpayInstance.open();
    } catch (err) {
      console.error("Razorpay submission exception:", err);
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
            {/* Step 1 Card: Customer Details */}
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
                    placeholder="e.g. 9876543210"
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

            {/* Step 2 Card: Delivery Address */}
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
                    <div className="relative">
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
                      {isValidatingLocation && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-[#6e5b55] animate-pulse">
                          Checking...
                        </span>
                      )}
                    </div>
                  </Field>
                </div>

                {/* Unavailable Products Alert (Requirement 7 & 8) */}
                {hasUnavailableProducts && (
                  <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:p-5 space-y-3 animate-in fade-in">
                    <div className="space-y-1.5">
                      {locationValidation.unavailableProducts.map((prod) => (
                        <p key={prod.productId} className="text-xs sm:text-sm font-bold text-amber-900 flex items-center gap-2">
                          <span className="text-amber-700">⚠</span> {prod.productName} is not available in your location.
                        </p>
                      ))}
                    </div>
                    <p className="text-xs text-amber-800/80">
                      Freshly prepared delicacies have restricted delivery areas. You can remove unavailable items to continue checkout with India-wide delicacies.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveUnavailableProducts}
                      className="border-amber-400 bg-white hover:bg-amber-100 text-amber-950 font-bold"
                    >
                      Remove unavailable products
                    </Button>
                  </div>
                )}

                {/* Eligible Location Success Message (Requirement 9) */}
                {locationValidation?.isValid && isRestrictedCodOnly && (
                  <div className="rounded-xl border border-emerald-300 bg-emerald-50/80 p-3.5 space-y-1 animate-in fade-in">
                    <p className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                      <span className="text-emerald-700">✓</span> This product is available in your location.
                    </p>
                    <p className="text-[11px] text-emerald-900/80">
                      Freshly prepared delicacies in your order are eligible for Cash on Delivery (COD).
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3 Card: Payment Method (Requirement 10 & 11) */}
            <div className="rounded-2xl sm:rounded-3xl border border-white/70 bg-gradient-to-br from-white/80 via-white/60 to-white/40 p-5 sm:p-7 backdrop-blur-xl shadow-xl shadow-amber-950/8 space-y-4">
              <div>
                <p className="eyebrow">03</p>
                <h2 className="mt-1 font-display text-xl sm:text-2xl font-semibold text-[#2b1719]">Payment method</h2>
              </div>

              {isRestrictedCodOnly ? (
                /* Restricted products: COD ONLY (Requirement 10: Do NOT display online payment for restricted-only/mixed checkout) */
                <div className="rounded-xl border-2 border-[#711e2c] bg-[#fffdf8] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="size-3 rounded-full bg-[#711e2c]" />
                      <p className="text-sm font-bold text-[#2b1719]">Cash on Delivery (COD)</p>
                    </div>
                    <p className="text-xs text-[#6e5b55] mt-1 pl-5">
                      Pay securely with cash or UPI when your fresh delicacies arrive at your doorstep.
                    </p>
                  </div>
                  <span className="self-start sm:self-auto rounded-full bg-[#711e2c]/10 text-[#711e2c] px-3 py-1 text-xs font-bold shrink-0">
                    COD Only
                  </span>
                </div>
              ) : (
                /* Normal India-wide products: Allow choosing between Razorpay and COD */
                <div className="grid gap-3 sm:grid-cols-2">
                  <label
                    className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col justify-between ${
                      paymentMethod === "RAZORPAY"
                        ? "border-[#711e2c] bg-[#fffdf8] ring-2 ring-[#711e2c]/20 shadow-2xs"
                        : "border-[#dfd0bd] bg-white/70 hover:bg-[#fffdf8]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        value="RAZORPAY"
                        checked={paymentMethod === "RAZORPAY"}
                        onChange={() => setPaymentMethod("RAZORPAY")}
                        className="accent-[#711e2c]"
                      />
                      <span className="text-sm font-bold text-[#2b1719]">Online Payment</span>
                    </div>
                    <p className="text-xs text-[#6e5b55] mt-2">UPI, Cards, NetBanking via Razorpay</p>
                  </label>

                  <label
                    className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col justify-between ${
                      paymentMethod === "COD"
                        ? "border-[#711e2c] bg-[#fffdf8] ring-2 ring-[#711e2c]/20 shadow-2xs"
                        : "border-[#dfd0bd] bg-white/70 hover:bg-[#fffdf8]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        value="COD"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                        className="accent-[#711e2c]"
                      />
                      <span className="text-sm font-bold text-[#2b1719]">Cash on Delivery</span>
                    </div>
                    <p className="text-xs text-[#6e5b55] mt-2">Pay upon doorstep arrival</p>
                  </label>
                </div>
              )}
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
                disabled={isSubmitting || Boolean(hasUnavailableProducts)}
                size="lg"
                type="submit"
              >
                {isSubmitting
                  ? paymentMethod === "COD" || isRestrictedCodOnly
                    ? "Placing COD order..."
                    : "Connecting to Razorpay..."
                  : paymentMethod === "COD" || isRestrictedCodOnly
                  ? `Place Order with Cash on Delivery (${formatPrice(activeSubtotal)})`
                  : `Pay ${formatPrice(activeSubtotal)} with Razorpay`}
              </Button>
              <p className="text-[11px] text-[#6e5b55]">
                {paymentMethod === "COD" || isRestrictedCodOnly
                  ? "✓ Cash on Delivery available for verified local addresses."
                  : "🔒 100% Secure Payment via Razorpay (UPI, Cards, NetBanking, Wallets)."}
              </p>
            </div>
          </form>

          {/* Order Summary */}
          <OrderSummary
            items={activeItems}
            subtotalPaise={activeSubtotal}
            onRemoveItem={handleRemoveSingleItem}
          />
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
