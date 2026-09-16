"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

export function OrderFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get("paymentFilter") || "all";

  function handleFilterChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("paymentFilter");
    } else {
      params.set("paymentFilter", value);
    }
    router.push(`/admin/orders?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <Filter size={15} className="text-muted-foreground shrink-0" />
      <select
        aria-label="Filter orders by payment status"
        value={currentFilter}
        onChange={(e) => handleFilterChange(e.target.value)}
        className="rounded-lg border border-input bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 cursor-pointer"
      >
        <option value="all">All Orders</option>
        <option value="paid">Paid</option>
        <option value="pending">Pending</option>
        <option value="cod">COD</option>
      </select>
    </div>
  );
}
