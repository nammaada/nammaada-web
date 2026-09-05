"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Gift, CheckCircle2 } from "lucide-react";
import { submitBulkEnquiry, type BulkEnquiryState } from "@/actions/enquiry";
import { Container } from "@/components/ui/container";

const initialState: BulkEnquiryState = {};

export function CelebrationCta() {
  const [state, formAction, isPending] = useActionState(submitBulkEnquiry, initialState);
  const [bgLoaded, setBgLoaded] = useState(true);

  return (
    <section className="relative py-12 sm:py-16 bg-transparent" id="bulk-enquiry">
      <Container>
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#2b1719] text-white shadow-lifted">
          {/* Background image overlay */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {bgLoaded && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/cele-bg.png"
                alt="Kerala traditional celebration"
                className="h-full w-full object-cover object-center"
                onError={() => setBgLoaded(false)}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1c080b]/60 via-black/20 to-[#1c080b]/50" />
          </div>

          {/* Content & Form */}
          <div className="relative z-10 p-6 sm:p-10 md:p-12 grid gap-8 lg:grid-cols-12 lg:items-center">
            {/* Left text */}
            <div className="lg:col-span-6 space-y-3">
              <div className="inline-flex items-center gap-2 text-[#d4af37] font-semibold text-xs uppercase tracking-widest drop-shadow-sm">
                <Gift size={16} />
                <span>Bulk Orders & Catering</span>
              </div>

              <h2 className="font-display text-2xl sm:text-4xl font-semibold leading-tight text-white drop-shadow-sm">
                Planning a celebration?
              </h2>

              <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-lg drop-shadow-sm">
                Make your occasion special with authentic Kerala delicacies, freshly prepared for festivals, family functions, and gifting.
              </p>
            </div>

            {/* Right form */}
            <div className="lg:col-span-6">
              <div className="rounded-xl border border-white/20 bg-white/10 p-5 sm:p-6 backdrop-blur-xs">
                {state?.success ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-white animate-in fade-in duration-300">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 mb-3 border border-emerald-400/30">
                      <CheckCircle2 size={28} />
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-semibold">Enquiry Received!</h3>
                    <p className="mt-1.5 text-xs text-white/85 max-w-xs leading-relaxed">
                      Thank you! Our team will contact you shortly with our menu options and bulk pricing.
                    </p>
                  </div>
                ) : (
                  <form action={formAction} className="space-y-3">
                    <div className="flex items-center justify-between pb-1 border-b border-white/15">
                      <p className="text-xs font-bold uppercase tracking-wider text-white/90">
                        Bulk Enquiry Form
                      </p>
                      <span className="text-[11px] text-[#d4af37]">Quick Response</span>
                    </div>

                    {state?.error && (
                      <div className="rounded-lg border border-red-400/30 bg-red-950/70 p-2.5 text-xs text-red-200">
                        {state.error}
                      </div>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        name="name"
                        placeholder="Your Name"
                        required
                        type="text"
                        className="min-h-11 w-full rounded-xl border border-white/30 bg-black/25 px-3.5 text-xs sm:text-sm text-white placeholder:text-white/60 focus:border-white focus:outline-none"
                      />
                      <input
                        name="phone"
                        placeholder="Phone Number"
                        required
                        type="tel"
                        className="min-h-11 w-full rounded-xl border border-white/30 bg-black/25 px-3.5 text-xs sm:text-sm text-white placeholder:text-white/60 focus:border-white focus:outline-none"
                      />
                    </div>

                    <input
                      name="product_requirement"
                      placeholder="Requirements (e.g. Paalada Payasam, Chips)"
                      required
                      type="text"
                      className="min-h-11 w-full rounded-xl border border-white/30 bg-black/25 px-3.5 text-xs sm:text-sm text-white placeholder:text-white/60 focus:border-white focus:outline-none"
                    />

                    <input
                      name="quantity_details"
                      placeholder="Quantity / Event Details"
                      required
                      type="text"
                      className="min-h-11 w-full rounded-xl border border-white/30 bg-black/25 px-3.5 text-xs sm:text-sm text-white placeholder:text-white/60 focus:border-white focus:outline-none"
                    />

                    <button
                      disabled={isPending}
                      type="submit"
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#d4af37] px-6 text-xs sm:text-sm font-bold text-[#2b1719] shadow-md transition-all hover:bg-[#c39e2e] active:scale-98 disabled:opacity-60 cursor-pointer"
                    >
                      <span>{isPending ? "Submitting..." : "Submit Enquiry"}</span>
                      <ArrowRight aria-hidden="true" size={15} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}


