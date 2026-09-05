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
    <section className="py-12 sm:py-16" id="bulk-enquiry">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-white/25 shadow-2xl shadow-amber-950/25 lg:aspect-[1024/342] lg:min-h-[370px] flex flex-col justify-center">
          {/* Background Image Container */}
          <div className="absolute inset-0 z-0 overflow-hidden bg-[#2d070d]">
            {/* User-supplied clean background image in 1024x342 ratio */}
            {bgLoaded && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
               src="/cele-bg.png"
                alt="Kerala traditional celebration"
                className="h-full w-full object-cover object-left lg:object-center"
                onError={() => setBgLoaded(false)}
              />
            )}

            {/* Subtle natural overlay preserving original colors, golden bokeh, and lamp warmth */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-black/10 to-[#240409]/40 backdrop-blur-[0.3px]" />

            {/* Ambient warm golden glow highlights */}
            <div
              className="pointer-events-none absolute -left-20 top-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute right-10 bottom-0 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl"
              aria-hidden="true"
            />
          </div>

          {/* Content: Left text & Right glass form matching reference layout */}
          <div className="relative z-10 my-auto grid gap-6 sm:gap-8 px-6 py-8 sm:px-10 sm:py-10 lg:py-6 xl:py-8 lg:pl-36 xl:pl-44 lg:pr-8 xl:pr-12 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-8 xl:gap-12">
            {/* Left side: Heading, description & tags */}
            <div className="text-white">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-[32px] xl:text-[40px] font-normal leading-[1.14] tracking-tight text-white">
                Planning a celebration?
              </h2>

              <p className="mt-2.5 sm:mt-3 max-w-xl text-xs sm:text-sm xl:text-[15px] leading-relaxed text-white/90">
                Make your occasion sweeter with authentic Kerala favourites, prepared fresh for festivals, family gatherings, and gifting.
              </p>

              <div className="mt-4 sm:mt-5 flex items-center gap-2.5 text-amber-300 font-semibold text-xs sm:text-sm tracking-wide">
                <Gift size={17} />
                <span>Bulk Orders Welcome</span>
              </div>
            </div>

            {/* Right side: Translucent glass enquiry form */}
            <div className="rounded-2xl sm:rounded-3xl border border-white/40 bg-white/20 sm:bg-white/25 backdrop-blur-md p-4 sm:p-5 xl:p-6 shadow-2xl shadow-black/25">
              {state?.success ? (
                <div className="flex flex-col items-center justify-center py-6 text-center text-white animate-in fade-in duration-300">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 mb-3 border border-emerald-400/30">
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-semibold">Enquiry Received!</h3>
                  <p className="mt-1.5 text-xs text-white/85 max-w-xs leading-relaxed">
                    Thank you! Our team will contact you shortly with our celebration menu and bulk pricing.
                  </p>
                </div>
              ) : (
                <form action={formAction} className="grid gap-2.5 sm:gap-3">
                  <div className="flex items-center justify-between pb-0.5">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                      Bulk Enquiry
                    </p>
                    <span className="text-[11px] text-white/60">Fast response</span>
                  </div>

                  {state?.error && (
                    <div className="rounded-xl border border-red-300/40 bg-red-950/60 p-2.5 text-xs text-red-200">
                      {state.error}
                    </div>
                  )}

                  {/* Name and Phone */}
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <input
                      name="name"
                      placeholder="Name"
                      required
                      type="text"
                      className="min-h-10 sm:min-h-10.5 w-full rounded-xl border border-white/35 bg-white/15 px-3.5 text-xs sm:text-sm text-white placeholder:text-white/65 backdrop-blur-xs transition-colors focus:border-white focus:bg-white/25 focus:outline-none"
                    />
                    <input
                      name="phone"
                      placeholder="Phone Number"
                      required
                      type="tel"
                      className="min-h-10 sm:min-h-10.5 w-full rounded-xl border border-white/35 bg-white/15 px-3.5 text-xs sm:text-sm text-white placeholder:text-white/65 backdrop-blur-xs transition-colors focus:border-white focus:bg-white/25 focus:outline-none"
                    />
                  </div>

                  {/* Product Requirement */}
                  <input
                    name="product_requirement"
                    placeholder="Product Requirement (e.g. Paalada Payasam, Chips)"
                    required
                    type="text"
                    className="min-h-10 sm:min-h-10.5 w-full rounded-xl border border-white/35 bg-white/15 px-3.5 text-xs sm:text-sm text-white placeholder:text-white/65 backdrop-blur-xs transition-colors focus:border-white focus:bg-white/25 focus:outline-none"
                  />

                  {/* Quantity / Bulk Order Details */}
                  <input
                    name="quantity_details"
                    placeholder="Quantity / Bulk Order Details"
                    required
                    type="text"
                    className="min-h-10 sm:min-h-10.5 w-full rounded-xl border border-white/35 bg-white/15 px-3.5 text-xs sm:text-sm text-white placeholder:text-white/65 backdrop-blur-xs transition-colors focus:border-white focus:bg-white/25 focus:outline-none"
                  />

                  {/* Submit Button */}
                  <div className="pt-1">
                    <button
                      disabled={isPending}
                      type="submit"
                      className="inline-flex min-h-10 sm:min-h-10.5 w-full items-center justify-center gap-2 rounded-full bg-[#4a0e17] px-6 text-xs sm:text-sm font-semibold text-white shadow-lg transition-all hover:bg-[#380a11] hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 cursor-pointer"
                    >
                      <span>{isPending ? "Submitting..." : "Submit Enquiry"}</span>
                      <ArrowRight aria-hidden="true" size={15} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

