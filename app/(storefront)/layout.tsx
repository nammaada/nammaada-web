import type { ReactNode } from "react";
import { StorefrontFooter } from "@/components/layout/storefront-footer";
import { StorefrontNavbar } from "@/components/layout/storefront-navbar";
import { CartProvider } from "@/components/cart/cart-provider";

export default function StorefrontLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <StorefrontNavbar />
        <main className="flex-1">{children}</main>
        <StorefrontFooter />
      </div>
    </CartProvider>
  );
}
