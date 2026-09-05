"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import type { StorefrontTestimonial } from "@/lib/storefront/testimonials";

function TestimonialCard({ testimonial }: { testimonial: StorefrontTestimonial }) {
  return (
    <div className="group relative flex flex-col justify-between rounded-[24px] sm:rounded-[28px] border border-white/80 bg-gradient-to-br from-white/75 via-white/55 to-white/40 p-6 sm:p-7 backdrop-blur-xl shadow-xl shadow-amber-950/6 transition-all duration-300 hover:border-white hover:shadow-2xl hover:shadow-amber-950/10 min-h-[220px] text-left">
      <div>
        {/* Double quote mark matching second reference image */}
        <div className="flex items-center text-[#5c111a]" aria-hidden="true">
          <span className="font-serif text-3xl sm:text-4xl leading-none font-bold select-none">“</span>
        </div>

        <blockquote className="mt-3 text-xs sm:text-sm leading-relaxed text-[#4a242a]/90">
          {testimonial.content}
        </blockquote>
      </div>

      <div className="mt-5 pt-3 border-t border-primary/10">
        <p className="font-semibold text-xs sm:text-sm text-foreground">
          {testimonial.display_name}
        </p>
        {testimonial.location ? (
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
            {testimonial.location}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function Testimonials({ testimonials }: { testimonials: StorefrontTestimonial[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const total = testimonials.length;

  // Max index for carousel
  // On desktop: if total > 3, we can scroll by cards, max index is total - 3
  // On mobile: max index is total - 1
  const maxIndex = isMobile ? Math.max(0, total - 1) : Math.max(0, total - 3);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 40) handleNext();
    else if (diff < -40) handlePrev();
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-[#f8f0e5] via-[#f2e4d0] to-[#ebd7be] py-16 sm:py-20 text-center"
      id="testimonials"
    >
      {/* Ambient background glow & lighting */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-[450px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-white/80 via-[#fff5e8]/50 to-transparent blur-3xl"
        aria-hidden="true"
      />

      {/* Decorative botanical leaves in corners matching second reference image */}
      <div className="pointer-events-none absolute bottom-0 left-0 z-0 opacity-30 select-none" aria-hidden="true">
        <svg width="240" height="260" viewBox="0 0 240 260" fill="none">
          <path
            d="M0 260C40 210 60 160 50 100C40 40 90 20 140 0C120 50 90 90 100 140C110 190 70 230 0 260Z"
            fill="url(#test-leaf-1)"
          />
          <path
            d="M30 250C70 210 90 160 85 110C80 60 130 40 170 15C150 60 130 100 135 145C140 190 105 230 30 250Z"
            fill="url(#test-leaf-2)"
          />
          <defs>
            <linearGradient id="test-leaf-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dfbe96" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#9a6738" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="test-leaf-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c59966" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#8d5b2c" stopOpacity="0.08" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="pointer-events-none absolute top-4 right-0 z-0 opacity-25 select-none" aria-hidden="true">
        <svg width="220" height="240" viewBox="0 0 220 240" fill="none">
          <path
            d="M220 0C180 50 160 100 170 160C180 220 130 240 80 260C100 210 130 170 120 120C110 70 150 30 220 0Z"
            fill="url(#test-leaf-1)"
          />
        </svg>
      </div>

      <Container className="relative z-10">
        {/* Centered Heading matching second reference image */}
        <div className="mx-auto max-w-2xl">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.24em] text-[#6b212b]">
            TESTIMONIALS
          </p>
          <h2 className="mt-2.5 font-display text-3xl sm:text-4xl lg:text-[42px] font-normal leading-[1.12] text-foreground tracking-tight">
            Loved at every gathering
          </h2>
        </div>

        {/* Dynamic Content */}
        {total === 0 ? (
          <div className="mx-auto mt-10 max-w-md rounded-2xl border border-white/60 bg-white/40 p-8 text-center backdrop-blur-md shadow-sm">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Stories from Namma Ada gatherings will appear here when they are available.
            </p>
          </div>
        ) : total === 1 ? (
          /* Single Testimonial: Strictly CENTERED in the section */
          <div className="mx-auto mt-10 max-w-xl">
            <TestimonialCard testimonial={testimonials[0]} />
          </div>
        ) : total === 2 ? (
          /* Two Testimonials: Centered side-by-side */
          <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        ) : total === 3 && !isMobile ? (
          /* Exactly Three Testimonials on Desktop: 3 in a row matching reference image */
          <div className="mx-auto mt-10 grid max-w-6xl gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        ) : (
          /* Dynamic Carousel for Multiple Testimonials (> 3 on desktop, or multiple on mobile) */
          <div
            className="relative mx-auto mt-10 max-w-6xl"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Desktop Carousel View (shows 3 cards at a time with smooth slide) */}
            <div className="hidden md:block overflow-hidden">
              <div
                className="flex gap-6 transition-transform duration-500 ease-out"
                style={{
                  transform: `translateX(-${currentIndex * (100 / 3 + 2)}%)`,
                }}
              >
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="w-[calc(33.333%-1rem)] shrink-0">
                    <TestimonialCard testimonial={testimonial} />
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Carousel View (shows 1 card at a time with smooth slide) */}
            <div className="md:hidden overflow-hidden px-2">
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{
                  transform: `translateX(-${currentIndex * 100}%)`,
                }}
              >
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="w-full shrink-0 px-1">
                    <TestimonialCard testimonial={testimonial} />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows (when total > 3 on desktop or total > 1 on mobile) */}
            {maxIndex > 0 && (
              <div className="hidden sm:flex items-center justify-between pointer-events-none absolute inset-y-0 -left-4 -right-4">
                <button
                  type="button"
                  aria-label="Previous testimonials"
                  onClick={handlePrev}
                  className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/70 text-[#4a0e17] shadow-md backdrop-blur-md transition-all hover:bg-white hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  aria-label="Next testimonials"
                  onClick={handleNext}
                  className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/70 text-[#4a0e17] shadow-md backdrop-blur-md transition-all hover:bg-white hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

            {/* Navigation Dots below cards matching second reference image */}
            {maxIndex > 0 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Go to slide ${idx + 1}`}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                      currentIndex === idx
                        ? "w-6 bg-[#4a0e17]"
                        : "w-2 bg-[#4a0e17]/25 hover:bg-[#4a0e17]/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}

