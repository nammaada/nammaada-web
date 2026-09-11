import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, PackageCheck, MapPin, Phone, Mail, ArrowRight, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Order Confirmed | Namma Ada",
  description: "Your order has been received and confirmed.",
};

function formatINR(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(paise / 100);
}

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const supabase = createSupabaseAdminClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*, order_items(*), payments(razorpay_payment_id, status)")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error || !order) {
    notFound();
  }

  const items = (order.order_items as unknown as Array<{
    id: string;
    product_name_snapshot: string;
    variant_name_snapshot: string | null;
    quantity: number;
    unit_price_paise: number;
    line_total_paise: number;
  }>) || [];

  const payments = (order.payments as unknown as Array<{
    razorpay_payment_id: string | null;
    status: string;
  }>) || [];

  const latestPayment = payments[0];
  const whatsappUrl = `https://wa.me/919995811622?text=Hi%20Namma%20Ada,%20I%20have%20a%20question%20regarding%20my%20order%20%23${order.order_number}`;

  return (
    <div className="relative py-10 sm:py-16">
      <Container className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Celebration Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex size-16 sm:size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-inner">
            <CheckCircle2 size={36} className="sm:size-10" />
          </div>
          <p className="eyebrow text-emerald-800 font-bold tracking-wider">Payment Received & Verified</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#2b1719]">
            Thank You for Your Order!
          </h1>
          <p className="text-xs sm:text-sm text-[#2b1719]/75 max-w-md mx-auto">
            Your delicacies are being carefully prepared with authentic tradition. A confirmation has been recorded.
          </p>
        </div>

        {/* Order Reference Badge */}
        <div className="rounded-2xl border border-[#eedec8] bg-white/80 backdrop-blur-md p-5 sm:p-6 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-[#6e5b55]">Order Reference</span>
            <p className="font-mono text-xl sm:text-2xl font-bold text-[#711e2c]">{order.order_number}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Paid via Razorpay
            </span>
            {latestPayment?.razorpay_payment_id ? (
              <span className="font-mono text-[11px] text-[#6e5b55] bg-[#f4efeb] px-2.5 py-1 rounded-md border border-[#eedec8]">
                ID: {latestPayment.razorpay_payment_id}
              </span>
            ) : null}
          </div>
        </div>

        {/* Ordered Items Breakdown */}
        <div className="rounded-2xl sm:rounded-3xl border border-white/80 bg-white/70 backdrop-blur-xl p-6 sm:p-8 shadow-sm space-y-6 mb-6">
          <div className="flex items-center justify-between border-b border-[#eedec8]/80 pb-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2b1719] flex items-center gap-2">
              <PackageCheck size={20} className="text-[#711e2c]" />
              Items Ordered
            </h2>
            <span className="text-xs font-semibold text-[#6e5b55]">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>

          <div className="divide-y divide-[#eedec8]/50">
            {items.map((item) => (
              <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-[#2b1719] truncate">
                    {item.product_name_snapshot}
                  </p>
                  {item.variant_name_snapshot ? (
                    <p className="text-[11px] text-[#6e5b55]">{item.variant_name_snapshot}</p>
                  ) : null}
                  <p className="text-[11px] text-[#6e5b55] mt-0.5">
                    {item.quantity} × {formatINR(item.unit_price_paise)}
                  </p>
                </div>
                <span className="text-xs sm:text-sm font-bold text-[#711e2c] shrink-0">
                  {formatINR(item.line_total_paise)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="border-t border-[#eedec8]/80 pt-4 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between text-[#6e5b55]">
              <span>Subtotal</span>
              <span className="font-semibold">{formatINR(order.subtotal_paise)}</span>
            </div>
            <div className="flex justify-between text-[#6e5b55]">
              <span>Shipping Fee</span>
              <span className="font-semibold">
                {order.shipping_fee_paise === 0 ? "Free" : formatINR(order.shipping_fee_paise)}
              </span>
            </div>
            <div className="flex justify-between text-sm sm:text-base font-bold text-[#2b1719] border-t border-[#eedec8]/80 pt-2">
              <span>Total Paid</span>
              <span className="text-[#711e2c] text-lg font-serif">{formatINR(order.total_amount_paise)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Details Card */}
        <div className="rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl p-6 sm:p-8 shadow-sm space-y-4 mb-8">
          <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2b1719] flex items-center gap-2">
            <MapPin size={20} className="text-[#711e2c]" />
            Delivery Destination
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 text-xs sm:text-sm text-[#2b1719]/80">
            <div>
              <p className="font-bold text-[#2b1719]">{order.customer_name_snapshot}</p>
              <p className="mt-1 leading-relaxed">{order.delivery_address_snapshot}</p>
              <p className="mt-0.5">
                {order.delivery_district_city}, {order.delivery_state} - {order.delivery_pincode}
              </p>
            </div>

            <div className="space-y-1.5 sm:border-l sm:border-[#eedec8]/60 sm:pl-6">
              <p className="flex items-center gap-2">
                <Phone size={14} className="text-[#711e2c]" />
                <span className="font-medium">{order.customer_phone_snapshot}</span>
              </p>
              {order.customer_email_snapshot ? (
                <p className="flex items-center gap-2">
                  <Mail size={14} className="text-[#711e2c]" />
                  <span className="font-medium">{order.customer_email_snapshot}</span>
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#1e8341] hover:bg-[#25D366]/20 transition-all active:scale-95 shadow-2xs"
          >
            <MessageCircle size={16} />
            <span>Need Help? Chat on WhatsApp</span>
          </a>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full bg-[#711e2c] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-[#5a1723] transition-all active:scale-95"
          >
            <span>Explore More Delicacies</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </Container>
    </div>
  );
}
