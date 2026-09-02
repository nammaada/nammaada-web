import type { Metadata } from "next";
import { CheckoutPage } from "@/components/checkout/checkout-page";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Prepare your Namma Ada delivery details.",
};

export default function CheckoutRoute() {
  return <CheckoutPage />;
}
