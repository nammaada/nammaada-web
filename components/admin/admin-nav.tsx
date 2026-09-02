"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  ShoppingCart,
  Users,
  CreditCard,
  MessageSquareQuote,
  Inbox,
  Building2,
} from "lucide-react";

type NavGroup = {
  title: string;
  items: {
    label: string;
    href: string;
    icon: typeof LayoutDashboard;
  }[];
};

const navGroups: NavGroup[] = [
  {
    title: "OVERVIEW",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    title: "CATALOG",
    items: [
      { label: "Products", href: "/admin/products", icon: Package },
      { label: "Categories", href: "/admin/categories", icon: Tags },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { label: "Shipping", href: "/admin/shipping", icon: Truck },
      { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { label: "Customers", href: "/admin/customers", icon: Users },
      { label: "Payments", href: "/admin/payments", icon: CreditCard },
      { label: "Couriers", href: "/admin/couriers", icon: Building2 },
    ],
  },
  {
    title: "CONTENT",
    items: [
      { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
      { label: "Enquiries", href: "/admin/enquiries", icon: Inbox },
    ],
  },
];

type AdminNavProps = {
  onNavClick?: () => void;
};

export function AdminNav({ onNavClick }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation" className="grid gap-6">
      {navGroups.map((group) => (
        <div key={group.title} className="grid gap-1">
          <p className="px-3 text-[11px] font-bold tracking-widest text-primary/70 uppercase mb-1">
            {group.title}
          </p>
          {group.items.map(({ label, href, icon: Icon }) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-all duration-150 ${
                  active
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-foreground/80 hover:bg-primary/10 hover:text-primary active:scale-[0.99]"
                }`}
                href={href}
                key={href}
                onClick={onNavClick}
              >
                <Icon aria-hidden="true" size={18} className={active ? "text-accent" : "opacity-75"} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
