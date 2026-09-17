"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, ShoppingBag, ArrowLeft, ExternalLink, Truck, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useCustomerAuth } from "@/lib/auth/customer-context";
import { getCustomerOrdersAction, type CustomerOrder } from "@/actions/account";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

function formatPrice(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(paise / 100);
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === "delivered") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
        <CheckCircle2 size={12} /> Delivered
      </span>
    );
  }
  if (s === "shipped") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
        <Truck size={12} /> Dispatched
      </span>
    );
  }
  if (s === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">
        <AlertCircle size={12} /> Cancelled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
      <Clock size={12} /> Processing
    </span>
  );
}

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useCustomerAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/account/login?next=/account/orders");
      return;
    }

    if (user) {
      getCustomerOrdersAction().then((res) => {
        if (res.ok) {
          setOrders(res.orders);
        }
        setLoadingOrders(false);
      });
    }
  }, [authLoading, user, router]);

  if (authLoading || loadingOrders) {
    return (
      <main className="section-shell py-12 sm:py-20">
        <Container className="space-y-4 max-w-4xl">
          <div className="h-4 w-28 animate-pulse rounded bg-[#e5d8c6]" />
          <div className="h-10 max-w-xs animate-pulse rounded bg-[#e5d8c6]" />
          <div className="h-64 w-full animate-pulse rounded-2xl bg-[#e5d8c6]" />
        </Container>
      </main>
    );
  }

  return (
    <section className="section-shell py-10 sm:py-16">
      <Container className="max-w-4xl">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/account"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#711e2c] hover:underline mb-2"
            >
              <ArrowLeft size={14} /> Back to My Account
            </Link>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#2b1719]">
              My Orders
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#6e5b55]">
              Track the status of your Kerala payasam and delicacies orders.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#711e2c] px-5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#5a1723] transition-all self-start sm:self-auto"
          >
            Order More Delicacies
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-3xl border border-[#eedec8] bg-[#fffdf8] p-8 sm:p-12 text-center shadow-sm">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#711e2c]/10 text-[#711e2c] mb-4">
              <Package size={30} />
            </div>
            <h2 className="font-display text-xl font-bold text-[#2b1719]">No orders placed yet</h2>
            <p className="mt-2 text-xs sm:text-sm text-[#6e5b55] max-w-md mx-auto">
              You haven&apos;t ordered any authentic Kerala delicacies yet. Explore our handcrafted payasam, unniyappam, and banana chips!
            </p>
            <div className="mt-6">
              <Link
                href="/products"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#711e2c] px-6 text-sm font-bold text-white shadow-md hover:bg-[#5a1723] transition-all"
              >
                Browse Menu
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((ord) => {
              const orderDate = new Date(ord.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={ord.id}
                  className="rounded-3xl border border-white/70 bg-gradient-to-br from-white/90 via-white/70 to-white/50 p-5 sm:p-7 backdrop-blur-xl shadow-xl shadow-amber-950/8 space-y-5"
                >
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eedec8] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm sm:text-base font-bold text-[#2b1719]">
                          #{ord.orderNumber}
                        </span>
                        <StatusBadge status={ord.orderStatus} />
                      </div>
                      <p className="text-xs text-[#6e5b55] mt-1">Placed on {orderDate}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-[#6e5b55] block">Total Amount</span>
                      <span className="font-display text-lg sm:text-xl font-bold text-[#711e2c]">
                        {formatPrice(ord.totalAmountPaise)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="divide-y divide-[#eedec8]/60">
                    {ord.items.map((item) => (
                      <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs sm:text-sm">
                        <div>
                          <p className="font-semibold text-[#2b1719]">{item.productName}</p>
                          {item.variantName && (
                            <p className="text-[11px] text-[#6e5b55]">{item.variantName}</p>
                          )}
                          <p className="text-[11px] text-[#6e5b55]">
                            Qty: {item.quantity} × {formatPrice(item.unitPricePaise)}
                          </p>
                        </div>
                        <span className="font-bold text-[#2b1719]">
                          {formatPrice(item.lineTotalPaise)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Tracking / Shipping Info if applicable */}
                  {ord.trackingId && (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs text-blue-950">
                        <Truck size={16} className="text-blue-700 shrink-0" />
                        <span>
                          Shipped via <strong>{ord.courierName || "Courier"}</strong> (Tracking:{" "}
                          <code className="font-mono font-bold">{ord.trackingId}</code>)
                        </span>
                      </div>
                      {ord.trackingUrl && (
                        <a
                          href={ord.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
                        >
                          Track Package <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Delivery snapshot */}
                  <div className="border-t border-[#eedec8] pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#6e5b55]">
                    <div>
                      Delivery: <span className="text-[#2b1719] font-medium">{ord.deliveryAddress}, {ord.city} - {ord.pincode}</span>
                    </div>
                    <div>
                      Payment: <span className="text-[#2b1719] font-medium uppercase">{ord.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}</span> ({ord.paymentStatus})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
}
