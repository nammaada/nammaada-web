"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/checkout/schema";
import type { CartItem } from "@/lib/cart/cart";

function formatPrice(pricePaise: number) {
  return new Intl.NumberFormat("en-IN", { currency: "INR", style: "currency" }).format(pricePaise / 100);
}

const initialValues: CheckoutFormValues = { fullName: "", phone: "", email: "", address: "", city: "", state: "", pincode: "" };

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  const errorId = `${id}-error`;
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{children}{error ? <p className="text-sm text-red-800" id={errorId}>{error}</p> : null}</div>;
}

function fieldProps(id: keyof CheckoutFormValues, error?: string) {
  return { id, name: id, "aria-invalid": Boolean(error), "aria-describedby": error ? `${id}-error` : undefined };
}

function CheckoutImage({ item }: { item: CartItem }) {
  return item.image ? <Image src={item.image.url} alt={item.image.alt} fill className="object-cover" sizes="64px" /> : <div className="absolute inset-0 flex items-center justify-center bg-secondary px-2 text-center text-[0.55rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Approved imagery will appear here</div>;
}

function OrderSummary({ items, subtotalPaise }: { items: CartItem[]; subtotalPaise: number }) {
  return <Card className="h-fit rounded-2xl p-5 sm:p-6 lg:sticky lg:top-28" variant="subtle"><div className="flex items-center justify-between gap-4"><h2 className="font-display text-2xl text-foreground">Order summary</h2><span className="text-sm text-muted-foreground">{items.length} {items.length === 1 ? "line" : "lines"}</span></div><div className="mt-6 divide-y divide-border border-y border-border">{items.map((item) => <div className="flex gap-3 py-4 first:pt-0 last:pb-0" key={item.lineId}><div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-secondary"><CheckoutImage item={item} /></div><div className="min-w-0 flex-1"><Link className="text-sm font-semibold text-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" href={`/products/${item.slug}`}>{item.name}</Link>{item.variantName ? <p className="mt-1 text-xs text-muted-foreground">{item.variantName}</p> : null}<p className="mt-1 text-xs text-muted-foreground">{item.quantity} × {formatPrice(item.unitPricePaise)}</p></div><span className="shrink-0 text-sm font-semibold text-primary">{formatPrice(item.unitPricePaise * item.quantity)}</span></div>)}</div><div className="mt-5 flex items-center justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-semibold text-primary">{formatPrice(subtotalPaise)}</span></div><div className="mt-4 border-t border-border pt-4 text-sm"><div className="flex items-start justify-between gap-4"><span className="text-muted-foreground">Delivery</span><span className="max-w-[12rem] text-right text-xs leading-5 text-muted-foreground">Charges will be confirmed before payment.</span></div></div><p className="mt-5 text-xs leading-5 text-muted-foreground">Taxes, shipping, and final order totals will be confirmed through a secure future checkout flow.</p></Card>;
}

function EmptyCheckout() {
  return <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-14 text-center shadow-soft sm:px-10 sm:py-20"><div aria-hidden="true" className="absolute -right-16 -top-16 size-40 rounded-full border border-accent/20" /><div aria-hidden="true" className="absolute -bottom-20 -left-12 size-36 rounded-full border border-primary/10" /><div className="relative"><p className="eyebrow">Nothing to review yet</p><h1 className="mx-auto mt-3 max-w-md font-display text-3xl leading-tight text-foreground sm:text-4xl">Your cart is empty.</h1><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground">Add a Namma Ada selection before continuing to checkout.</p><Link className="mt-7 inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" href="/products">Browse products</Link></div></div>;
}

export function CheckoutPage() {
  const { items, subtotalPaise, hydrated } = useCart();
  const [values, setValues] = useState<CheckoutFormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormValues, string>>>({});
  const [successMessage, setSuccessMessage] = useState("");

  if (!hydrated) return <main className="section-shell pt-28 sm:pt-36" aria-busy="true" aria-label="Loading checkout"><div className="site-container space-y-5"><div className="h-3 w-28 animate-pulse rounded bg-muted" /><div className="h-12 max-w-sm animate-pulse rounded bg-muted" /><div className="h-56 w-full animate-pulse rounded-2xl bg-muted" /></div></main>;
  if (items.length === 0) return <section className="section-shell pt-24 sm:pt-32"><div className="site-container"><EmptyCheckout /></div></section>;

  function updateValue(field: keyof CheckoutFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSuccessMessage("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = checkoutSchema.safeParse(values);
    if (!result.success) {
      const nextErrors: Partial<Record<keyof CheckoutFormValues, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && field in values && !nextErrors[field as keyof CheckoutFormValues]) nextErrors[field as keyof CheckoutFormValues] = issue.message;
      }
      setErrors(nextErrors);
      setSuccessMessage("");
      return;
    }
    setErrors({});
    setSuccessMessage("Your details are valid and ready for the secure checkout phase. No order has been created.");
  }

  return <section className="section-shell pt-24 sm:pt-32"><div className="site-container"><div className="max-w-2xl"><p className="eyebrow">Secure checkout, prepared with care</p><h1 className="mt-3 font-display text-4xl leading-tight text-foreground sm:text-5xl">Checkout</h1><p className="mt-4 text-sm leading-6 text-muted-foreground">Share your delivery details so your order can be prepared accurately.</p></div><div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12"><form className="space-y-8" onSubmit={handleSubmit} noValidate><Card className="rounded-2xl p-5 sm:p-7"><div><p className="eyebrow">01</p><h2 className="mt-2 font-display text-2xl text-foreground">Your details</h2></div><div className="mt-6 grid gap-5 sm:grid-cols-2"><Field id="fullName" label="Full name" error={errors.fullName}><Input {...fieldProps("fullName", errors.fullName)} error={Boolean(errors.fullName)} autoComplete="name" onChange={(event) => updateValue("fullName", event.target.value)} value={values.fullName} /></Field><Field id="phone" label="Phone" error={errors.phone}><Input {...fieldProps("phone", errors.phone)} error={Boolean(errors.phone)} autoComplete="tel" inputMode="tel" onChange={(event) => updateValue("phone", event.target.value)} value={values.phone} /></Field><Field id="email" label="Email (optional)" error={errors.email}><Input {...fieldProps("email", errors.email)} error={Boolean(errors.email)} autoComplete="email" inputMode="email" onChange={(event) => updateValue("email", event.target.value)} type="email" value={values.email} /></Field></div></Card><Card className="rounded-2xl p-5 sm:p-7"><div><p className="eyebrow">02</p><h2 className="mt-2 font-display text-2xl text-foreground">Delivery address</h2></div><div className="mt-6 space-y-5"><Field id="address" label="Address" error={errors.address}><textarea {...fieldProps("address", errors.address)} autoComplete="street-address" className={`min-h-28 w-full resize-y rounded-lg border bg-card px-3.5 py-3 text-base text-foreground outline-none placeholder:text-muted-foreground transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 ${errors.address ? "border-red-800" : "border-input"}`} onChange={(event) => updateValue("address", event.target.value)} value={values.address} /></Field><div className="grid gap-5 sm:grid-cols-2"><Field id="city" label="City" error={errors.city}><Input {...fieldProps("city", errors.city)} error={Boolean(errors.city)} autoComplete="address-level2" onChange={(event) => updateValue("city", event.target.value)} value={values.city} /></Field><Field id="state" label="State" error={errors.state}><Input {...fieldProps("state", errors.state)} error={Boolean(errors.state)} autoComplete="address-level1" onChange={(event) => updateValue("state", event.target.value)} value={values.state} /></Field><Field id="pincode" label="Pincode" error={errors.pincode}><Input {...fieldProps("pincode", errors.pincode)} error={Boolean(errors.pincode)} autoComplete="postal-code" inputMode="numeric" maxLength={6} onChange={(event) => updateValue("pincode", event.target.value)} value={values.pincode} /></Field></div></div></Card><div aria-live="polite" className={successMessage ? "rounded-lg border border-emerald-800/20 bg-emerald-900/5 px-4 py-3 text-sm leading-6 text-emerald-900" : "min-h-0"}>{successMessage}</div><Button className="w-full sm:w-auto" size="lg" type="submit">Review checkout details</Button></form><OrderSummary items={items} subtotalPaise={subtotalPaise} /></div></div></section>;
}
