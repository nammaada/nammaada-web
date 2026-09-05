"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Modal } from "@/components/ui/modal";
import type { StorefrontTestimonial } from "@/lib/storefront/testimonials";

function TestimonialCard({ testimonial }: { testimonial: StorefrontTestimonial }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isLongText = (testimonial.content || "").length > 220;

  return (
    <>
      <div className="group relative flex h-[260px] sm:h-[280px] w-full flex-col justify-between rounded-2xl sm:rounded-3xl border border-white/45 bg-gradient-to-br from-white/50 via-[#fcf7ee]/28 to-[#f5e8d5]/18 p-5 sm:p-6 backdrop-blur-xl shadow-[0_16px_36px_-10px_rgba(43,23,25,0.08),inset_0_1px_1.5px_0_rgba(255,255,255,0.75)] transition-all duration-300 hover:border-white/60 hover:from-white/60 hover:via-[#fcf7ee]/38 hover:to-[#f5e8d5]/24 hover:shadow-[0_20px_40px_-10px_rgba(43,23,25,0.12),inset_0_1px_1.5px_0_rgba(255,255,255,0.85)] text-left overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center text-[#711e2c] shrink-0" aria-hidden="true">
            <span className="font-serif text-3xl sm:text-4xl leading-none font-bold select-none">“</span>
          </div>

          <div className="mt-1.5 flex-1 flex flex-col min-h-0 justify-start overflow-hidden">
            {isLongText && isExpanded ? (
              <div className="max-h-[110px] sm:max-h-[125px] overflow-y-auto pr-1 text-xs sm:text-sm leading-relaxed text-[#2b1719]/90 font-normal">
                <blockquote>{testimonial.content}</blockquote>
              </div>
            ) : (
              <blockquote
                className={`text-xs sm:text-sm leading-relaxed text-[#2b1719]/90 font-normal ${
                  isLongText ? "line-clamp-4" : ""
                }`}
              >
                {testimonial.content}
              </blockquote>
            )}

            {isLongText && (
              <div className="mt-1 flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="text-xs font-semibold text-[#711e2c] hover:underline cursor-pointer"
                >
                  {isExpanded ? "Read less" : "Read more"}
                </button>
                {isExpanded && (
                  <>
                    <span className="text-[#e5d8c6] text-xs">•</span>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="text-xs font-semibold text-[#711e2c]/80 hover:text-[#711e2c] hover:underline cursor-pointer"
                    >
                      Full view
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-2 pt-3 border-t border-[#e5d8c6] shrink-0">
          <p className="font-semibold text-xs sm:text-sm text-[#711e2c] truncate">
            {testimonial.display_name}
          </p>
          {testimonial.location ? (
            <p className="text-[11px] sm:text-xs text-[#6e5b55] mt-0.5 font-medium truncate">
              {testimonial.location}
            </p>
          ) : null}
        </div>
      </div>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={testimonial.display_name}
          description={testimonial.location || undefined}
        >
          <div className="space-y-3">
            <div className="flex items-center text-[#711e2c]" aria-hidden="true">
              <span className="font-serif text-3xl sm:text-4xl leading-none font-bold select-none">“</span>
            </div>
            <blockquote className="text-xs sm:text-sm leading-relaxed text-[#2b1719]/90 font-normal max-h-[50vh] overflow-y-auto pr-2">
              {testimonial.content}
            </blockquote>
          </div>
        </Modal>
      )}
    </>
  );
}

export function Testimonials({ testimonials }: { testimonials: StorefrontTestimonial[] }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [screenSize, setScreenSize] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize("mobile");
      } else if (width < 1024) {
        setScreenSize("tablet");
      } else {
        setScreenSize("desktop");
      }
    };

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);

    handleResize();
    window.addEventListener("resize", handleResize);
    mediaQuery.addEventListener("change", handleMotionChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      mediaQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  const total = testimonials.length;
  const visibleCards = screenSize === "desktop" ? 3 : screenSize === "tablet" ? 2 : 1;

  const isCarousel = total > 3 || total > visibleCards;
  const totalPages = isCarousel ? Math.ceil(total / visibleCards) : 1;

  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage((prev) => {
        if (page < 0) return totalPages - 1;
        if (page >= totalPages) return 0;
        return page;
      });
    },
    [totalPages]
  );

  const handlePrev = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const handleNext = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  useEffect(() => {
    if (!isCarousel || isPaused || prefersReducedMotion || totalPages <= 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCarousel, isPaused, prefersReducedMotion, totalPages, currentPage]);

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

  const cardStrideOffset = Math.min(
    currentPage * visibleCards,
    Math.max(0, total - visibleCards)
  );

  const transformStyle =
    screenSize === "mobile"
      ? `translate3d(-${cardStrideOffset * 100}%, 0, 0)`
      : screenSize === "tablet"
      ? `translate3d(calc(-${cardStrideOffset} * (50% + 0.75rem)), 0, 0)`
      : `translate3d(calc(-${cardStrideOffset} * (33.3333% + 0.5rem)), 0, 0)`;

  return (
    <section
      className="relative overflow-hidden bg-transparent py-12 sm:py-16 text-center"
      id="testimonials"
    >
      <Container className="relative z-10">
        {/* Heading */}
        <div className="mx-auto max-w-2xl">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#711e2c]">
            TESTIMONIALS
          </p>
          <h2 className="mt-2 font-display text-2xl sm:text-4xl font-semibold leading-tight text-[#2b1719]">
            Loved at every gathering
          </h2>
        </div>

        {/* Dynamic Content Layout */}
        {total === 0 ? (
          /* CASE A: 0 Testimonials - Honest Empty State */
          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-[#e5d8c6] bg-[#fffdf8] p-6 text-center shadow-soft">
            <p className="text-xs sm:text-sm text-[#6e5b55]">
              Stories from Namma Ada gatherings will appear here when available.
            </p>
          </div>
        ) : total === 1 ? (
          /* CASE B: 1 Testimonial - Centered Single Card */
          <div className="mx-auto mt-8 max-w-xl flex justify-center">
            <div className="w-full h-[260px] sm:h-[280px] flex flex-col">
              <TestimonialCard testimonial={testimonials[0]} />
            </div>
          </div>
        ) : total === 2 ? (
          /* CASE C: 2 Testimonials - Centered Side-by-Side */
          <div className="mx-auto mt-8 grid max-w-3xl gap-5 sm:grid-cols-2">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="h-[260px] sm:h-[280px] flex flex-col">
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>
        ) : total === 3 && visibleCards === 3 ? (
          /* CASE D: Exactly 3 Testimonials on Desktop - 3 Cards Centered */
          <div className="mx-auto mt-8 grid max-w-6xl gap-5 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="h-[260px] sm:h-[280px] flex flex-col">
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>
        ) : (
          /* CASE E: 4+ Testimonials (or 3 on mobile/tablet) - Carousel */
          <div
            className="relative mx-auto mt-8 max-w-6xl"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="overflow-hidden px-1 py-1">
              <div
                className={`flex items-stretch ease-out ${
                  prefersReducedMotion ? "transition-none" : "transition-transform duration-500"
                }`}
                style={{
                  gap: screenSize === "mobile" ? "0px" : "1.25rem",
                  transform: transformStyle,
                  willChange: "transform",
                }}
              >
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className={`h-[260px] sm:h-[280px] shrink-0 flex flex-col ${
                      screenSize === "mobile"
                        ? "w-full px-1"
                        : screenSize === "tablet"
                        ? "w-[calc(50%-0.625rem)] max-w-md"
                        : "w-[calc(33.3333%-0.85rem)] max-w-[380px]"
                    }`}
                  >
                    <TestimonialCard testimonial={testimonial} />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            {totalPages > 1 && (
              <div className="hidden sm:flex items-center justify-between pointer-events-none absolute inset-y-0 -left-4 -right-4">
                <button
                  type="button"
                  aria-label="Previous testimonials"
                  onClick={handlePrev}
                  className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/70 backdrop-blur-md text-[#711e2c] shadow-sm hover:bg-white active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#711e2c]"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  aria-label="Next testimonials"
                  onClick={handleNext}
                  className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/70 backdrop-blur-md text-[#711e2c] shadow-sm hover:bg-white active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#711e2c]"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

            {/* Indicators */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Go to testimonial group ${idx + 1}`}
                    onClick={() => goToPage(idx)}
                    className={`h-2 transition-all duration-300 rounded-full cursor-pointer focus-visible:ring-2 focus-visible:ring-[#711e2c] ${
                      currentPage === idx
                        ? "w-6 bg-[#711e2c]"
                        : "w-2 bg-[#711e2c]/20 hover:bg-[#711e2c]/40"
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
