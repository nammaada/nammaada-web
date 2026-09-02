"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Tags, Truck, ShoppingCart, Users, CreditCard, MessageSquare, ClipboardList } from "lucide-react";

const links = [
  ["Dashboard", "/admin", LayoutDashboard], ["Products", "/admin/products", Package], ["Categories", "/admin/categories", Tags],
  ["Shipping", "/admin/shipping", Truck], ["Orders", "/admin/orders", ShoppingCart], ["Customers", "/admin/customers", Users],
  ["Payments", "/admin/payments", CreditCard], ["Couriers", "/admin/couriers", Truck], ["Testimonials", "/admin/testimonials", MessageSquare], ["Enquiries", "/admin/enquiries", ClipboardList],
] as const;

export function AdminNav() {
  const pathname = usePathname();
  return <nav aria-label="Admin navigation" className="grid gap-1">{links.map(([label, href, Icon]) => { const active = href === "/admin" ? pathname === href : pathname.startsWith(href); return <Link aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors ${active ? "bg-primary text-primary-foreground" : "text-foreground/75 hover:bg-primary/10 hover:text-primary"}`} href={href} key={href}><Icon aria-hidden="true" size={17} />{label}</Link>; })}</nav>;
}
