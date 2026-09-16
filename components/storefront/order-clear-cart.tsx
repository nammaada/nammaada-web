"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart/cart-provider";

/**
 * Clears the cart when the order success page mounts,
 * preventing checkout page from blinking the 'empty cart' screen before redirect.
 */
export function OrderClearCart() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}
