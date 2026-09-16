export type EmailOrderItem = {
  name: string;
  variantName?: string | null;
  quantity: number;
  unitPricePaise: number;
  lineTotalPaise: number;
  imageUrl?: string | null;
};

export type OrderEmailData = {
  orderId?: string;
  orderNumber: string;
  orderDate?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  deliveryAddress: string;
  deliveryDistrictCity: string;
  deliveryState: string;
  deliveryCountry?: string | null;
  deliveryPincode: string;
  subtotalPaise: number;
  shippingFeePaise: number;
  totalAmountPaise: number;
  paymentMethod: "ONLINE" | "COD";
  paymentStatus: "paid" | "pending" | "failed";
  orderStatus?: string;
  razorpayPaymentId?: string | null;
  items: EmailOrderItem[];
  siteUrl?: string;
};
