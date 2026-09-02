export type CartImage = { url: string; alt: string } | null;

export type CartItem = {
  lineId: string;
  productId: string;
  slug: string;
  name: string;
  variantId: string | null;
  variantName: string | null;
  unitPricePaise: number;
  quantity: number;
  image: CartImage;
};

export type CartItemInput = Omit<CartItem, "lineId" | "quantity"> & { quantity?: number };

const MAX_SAFE = Number.MAX_SAFE_INTEGER;

export function getCartLineId(productId: string, variantId: string | null) {
  return `${productId}:${variantId ?? "base"}`;
}

function isValidImage(value: unknown): value is NonNullable<CartImage> {
  if (!value || typeof value !== "object") return false;
  const image = value as Record<string, unknown>;
  return typeof image.url === "string" && image.url.length > 0 && typeof image.alt === "string" && image.alt.length > 0;
}

function isValidCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.lineId === "string" && item.lineId.length > 0
    && typeof item.productId === "string" && item.productId.length > 0
    && typeof item.slug === "string" && item.slug.length > 0
    && typeof item.name === "string" && item.name.length > 0
    && (item.variantId === null || typeof item.variantId === "string")
    && (item.variantName === null || typeof item.variantName === "string")
    && typeof item.unitPricePaise === "number" && Number.isSafeInteger(item.unitPricePaise) && item.unitPricePaise >= 0
    && typeof item.quantity === "number" && Number.isSafeInteger(item.quantity) && item.quantity >= 1
    && (item.image === null || isValidImage(item.image));
}

export function parseStoredCart(value: string | null): CartItem[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidCartItem).map((item) => ({ ...item, lineId: getCartLineId(item.productId, item.variantId) }));
  } catch {
    return [];
  }
}

export function addCartItem(items: CartItem[], input: CartItemInput): CartItem[] {
  const lineId = getCartLineId(input.productId, input.variantId);
  const quantity = input.quantity ?? 1;
  if (!Number.isSafeInteger(quantity) || quantity < 1 || !Number.isSafeInteger(input.unitPricePaise) || input.unitPricePaise < 0) return items;

  const existing = items.find((item) => item.lineId === lineId);
  if (!existing) return [...items, { ...input, quantity, lineId }];

  const nextQuantity = existing.quantity + quantity;
  return items.map((item) => item.lineId === lineId
    ? { ...input, quantity: Number.isSafeInteger(nextQuantity) && nextQuantity <= MAX_SAFE ? nextQuantity : existing.quantity, lineId }
    : item);
}

export function setCartItemQuantity(items: CartItem[], lineId: string, quantity: number): CartItem[] {
  if (!Number.isSafeInteger(quantity) || quantity < 1) return items.filter((item) => item.lineId !== lineId);
  return items.map((item) => item.lineId === lineId ? { ...item, quantity } : item);
}

export function removeCartItem(items: CartItem[], lineId: string): CartItem[] {
  return items.filter((item) => item.lineId !== lineId);
}

export function getCartSubtotalPaise(items: CartItem[]) {
  return items.reduce((total, item) => total + item.unitPricePaise * item.quantity, 0);
}

export function getCartItemCount(items: CartItem[]) {
  return items.reduce((count, item) => count + item.quantity, 0);
}
