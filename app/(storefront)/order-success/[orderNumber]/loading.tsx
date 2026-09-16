import { Container } from "@/components/ui/container";

export default function OrderSuccessLoading() {
  return (
    <div className="relative py-10 sm:py-16">
      <Container className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header Skeleton */}
        <div className="text-center space-y-3 mb-8">
          <div className="mx-auto size-16 sm:size-20 rounded-full bg-emerald-100/70 animate-pulse" />
          <div className="mx-auto h-4 w-36 rounded-full bg-[#eedec8] animate-pulse" />
          <div className="mx-auto h-10 w-72 max-w-full rounded-2xl bg-[#eedec8] animate-pulse" />
          <div className="mx-auto h-4 w-60 max-w-full rounded-full bg-[#eedec8]/60 animate-pulse" />
        </div>

        {/* Order Ref Badge Skeleton */}
        <div className="rounded-2xl border border-[#eedec8] bg-white/80 p-5 sm:p-6 shadow-sm mb-6 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-24 rounded bg-[#eedec8] animate-pulse" />
            <div className="h-7 w-48 rounded bg-[#eedec8] animate-pulse" />
          </div>
          <div className="h-7 w-32 rounded-full bg-[#eedec8] animate-pulse" />
        </div>

        {/* Items Skeleton */}
        <div className="rounded-2xl sm:rounded-3xl border border-white/80 bg-white/70 p-6 sm:p-8 shadow-sm space-y-4 mb-6">
          <div className="h-6 w-32 rounded bg-[#eedec8] animate-pulse mb-4" />
          <div className="space-y-3">
            <div className="h-12 w-full rounded-xl bg-[#eedec8]/40 animate-pulse" />
            <div className="h-12 w-full rounded-xl bg-[#eedec8]/40 animate-pulse" />
          </div>
          <div className="border-t border-[#eedec8]/60 pt-4 space-y-2">
            <div className="h-4 w-full rounded bg-[#eedec8]/30 animate-pulse" />
            <div className="h-5 w-full rounded bg-[#eedec8]/50 animate-pulse" />
          </div>
        </div>

        {/* Delivery Details Skeleton */}
        <div className="rounded-2xl border border-white/80 bg-white/70 p-6 sm:p-8 shadow-sm space-y-3 mb-8">
          <div className="h-6 w-44 rounded bg-[#eedec8] animate-pulse" />
          <div className="h-4 w-52 rounded bg-[#eedec8]/50 animate-pulse" />
          <div className="h-4 w-64 rounded bg-[#eedec8]/40 animate-pulse" />
        </div>
      </Container>
    </div>
  );
}
