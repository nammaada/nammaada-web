"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { addCartItem, getCartItemCount, getCartSubtotalPaise, parseStoredCart, removeCartItem, setCartItemQuantity, type CartItem, type CartItemInput } from "@/lib/cart/cart";

const storageKey = "namma-ada-cart";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotalPaise: number;
  hydrated: boolean;
  addItem: (item: CartItemInput) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(storageKey);
    } catch {
      // Storage can be unavailable in privacy-restricted browser contexts.
    }
    const parsed = parseStoredCart(stored);
    if (!stored || parsed.length === 0) {
      if (stored) {
        try {
          window.localStorage.removeItem(storageKey);
        } catch {
          // Invalid or unavailable storage is non-fatal to the cart UI.
        }
      }
    }
    const hydrationTimer = window.setTimeout(() => {
      setItems(parsed);
      setHydrated(true);
    }, 0);

    function handleStorage(event: StorageEvent) {
      if (event.key === storageKey) setItems(parseStoredCart(event.newValue));
    }

    window.addEventListener("storage", handleStorage);
    return () => {
      window.clearTimeout(hydrationTimer);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    if (hydrated) {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(items));
      } catch {
        // The in-memory cart remains usable when persistence is unavailable.
      }
    }
  }, [hydrated, items]);

  const addItem = useCallback((item: CartItemInput) => setItems((current) => addCartItem(current, item)), []);
  const setQuantity = useCallback((lineId: string, quantity: number) => setItems((current) => setCartItemQuantity(current, lineId, quantity)), []);
  const removeItem = useCallback((lineId: string) => setItems((current) => removeCartItem(current, lineId)), []);
  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({ items, itemCount: getCartItemCount(items), subtotalPaise: getCartSubtotalPaise(items), hydrated, addItem, setQuantity, removeItem, clearCart }), [items, hydrated, addItem, setQuantity, removeItem, clearCart]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
