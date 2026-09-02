import type { Metadata } from "next";
import { CartPage as CartPageClient } from "@/components/cart/cart-page";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your Namma Ada selection.",
};

export default function CartRoute() {
  return <CartPageClient />;
}
