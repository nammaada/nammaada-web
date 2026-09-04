"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Leaf, Heart, Gift } from "lucide-react";
import { Container } from "@/components/ui/container";
import type { HeroBanner } from "@/lib/storefront/hero";

type HeroSliderProps = {
  banners: HeroBanner[];
};

export function HeroSlider({ banners }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const bannerCount = banners.length;

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setIsReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, []);

  const handleNext = useCallback(() => {
    if (bannerCount > 1) {
      setCurrentIndex((prev) => (prev + 1) % bannerCount);
    }
  }, [bannerCount]);

  const handlePrev = useCallback(() => {
    if (bannerCount > 1) {
      setCurrentIndex((prev) => (prev - 1 + bannerCount) % bannerCount);
    }
  }, [bannerCount]);

  // Autoplay timer (~6 seconds per slide) when 2+ banners and not paused/reduced motion
  useEffect(() => {
    if (bannerCount <= 1 || isHovered || isReducedMotion) return;

    const timer = setInterval(() => {
      handleNext();
    }, 6000);

    return () => clearInterval(timer);
  }, [bannerCount, isHovered, isReducedMotion, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    if (bannerCount <= 1) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [bannerCount, handleNext, handlePrev]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 40;

    if (diff > minSwipeDistance) {
      handleNext();
    } else if (diff < -minSwipeDistance) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // ---------------------------------------------------------------------------
  // CASE 0: NO ACTIVE BANNERS -> BRANDED FALLBACK HERO
  // ---------------------------------------------------------------------------
  if (bannerCount === 0) {
    return (
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_78%_22%,rgb(212_175_55_/_0.2),transparent_24%),linear-gradient(120deg,rgb(74_14_23),rgb(92_17_30)_55%,rgb(55_8_17))] text-primary-foreground min-h-[560px] lg:h-[640px] flex items-center">
        <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />

        <Container className="relative z-10 grid gap-8 py-16 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              AUTHENTIC KERALA FLAVOURS
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Soul of Kerala,<br /> served with heart.
            </h1>
            <p className="text-base text-white/80 max-w-xl leading-relaxed">
              At Namma Ada, we bring the soul of Kerala into the homes of Bangalore. Every delicacy is handcrafted with tradition and a whole lot of love.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lifted hover:bg-primary/90 transition-all"
                href="/products"
              >
                Explore Now <ArrowRight size={16} />
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 text-sm font-semibold text-white hover:bg-white/20 transition-all backdrop-blur-sm"
                href="/contact"
              >
                Bulk orders
              </Link>
            </div>
          </div>

          <div className="relative h-80 rounded-3xl border border-white/20 bg-white/5 backdrop-blur-md p-8 flex flex-col justify-center items-center text-center shadow-lifted">
            <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
              <Leaf className="text-accent" size={32} />
            </div>
            <p className="font-display text-xl font-semibold text-white">Handcrafted Delicacies</p>
            <p className="text-xs text-white/70 mt-2 max-w-sm">
              Fresh ingredients, traditional recipes, and authentic South Indian taste delivered straight to your door.
            </p>
          </div>
        </Container>
      </section>
    );
  }

  // Active banner data for current slide
  const currentBanner = banners[currentIndex];

  return (
    <section
      aria-label="Storefront Hero Banner Slider"
      className="relative w-full overflow-hidden bg-black text-white min-h-[560px] sm:min-h-[580px] lg:h-[640px] flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* FULL-BLEED BACKGROUND MEDIA SLIDES */}
      {banners.map((banner, index) => {
        const isActive = index === currentIndex;
        const isVideo = banner.media_type === "video";

        return (
          <div
            key={banner.id}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Display Background Media */}
            {isVideo ? (
              <>
                {/* Poster Image Always Present as Fallback */}
                {banner.poster_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={banner.alt_text || banner.headline}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                      isActive && !isReducedMotion ? "opacity-30" : "opacity-100"
                    }`}
                    src={banner.poster_url}
                  />
                )}

                {/* Video Element: Lazy Loaded & Mounted ONLY when Active */}
                {isActive && !isReducedMotion && banner.media_url && (
                  <video
                    autoPlay
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover"
                    loop
                    muted
                    playsInline
                    poster={banner.poster_url || undefined}
                    src={banner.media_url}
                  />
                )}
              </>
            ) : (
              /* Image Background Slide */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={banner.alt_text || banner.headline}
                className="absolute inset-0 h-full w-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
                src={banner.media_url}
              />
            )}

            {/* Subtle Dark Warm Vignette/Gradient Overlay for Readable Text */}
            <div className="absolute inset-0 bg-gradient-to-t from-[rgb(25,4,8)]/95 via-[rgb(35,6,12)]/65 to-[rgb(25,4,8)]/45" />
            <div className="absolute inset-0 bg-gradient-to-r from-[rgb(25,4,8)]/90 via-transparent to-transparent" />
          </div>
        );
      })}

      {/* CONTENT OVERLAY */}
      <Container className="relative z-20 w-full py-16 sm:py-20 lg:py-24">
        <div key={currentIndex} className="max-w-2xl space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Eyebrow */}
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.22em] text-amber-300/90">
            {currentBanner.mobile_headline && typeof window !== "undefined" && window.innerWidth < 640
              ? currentBanner.mobile_headline
              : currentBanner.eyebrow}
          </p>

          {/* Headline */}
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05] whitespace-pre-line">
            {currentBanner.headline}
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-white/85 max-w-xl leading-relaxed">
            {currentBanner.mobile_description && typeof window !== "undefined" && window.innerWidth < 640
              ? currentBanner.mobile_description
              : currentBanner.description}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lifted transition-all hover:bg-primary/90 active:scale-95"
              href={currentBanner.primary_cta_href}
            >
              {currentBanner.primary_cta_label} <ArrowRight size={16} />
            </Link>

            {currentBanner.is_secondary_cta_enabled && currentBanner.secondary_cta_label && currentBanner.secondary_cta_href && (
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/35 bg-white/10 px-6 text-sm font-semibold text-white transition-all hover:bg-white/20 active:scale-95 backdrop-blur-sm"
                href={currentBanner.secondary_cta_href}
              >
                {currentBanner.secondary_cta_label}
              </Link>
            )}
          </div>

          {/* Trust Highlights */}
          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/15 pt-4 max-w-md">
            <div className="flex items-center gap-2 text-xs text-white/80">
              <Leaf className="text-amber-400 shrink-0" size={16} />
              <span>Authentic Kerala Taste</span>
            </div>
            <div className="flex items-center gap-2 border-l border-white/15 pl-3 text-xs text-white/80">
              <Heart className="text-amber-400 shrink-0" size={16} />
              <span>Made with Love</span>
            </div>
            <div className="flex items-center gap-2 border-l border-white/15 pl-3 text-xs text-white/80">
              <Gift className="text-amber-400 shrink-0" size={16} />
              <span>Bulk Orders</span>
            </div>
          </div>
        </div>
      </Container>

      {/* SLIDER CONTROLS (Only visible when 2+ active banners) */}
      {bannerCount > 1 && (
        <>
          {/* Previous / Next Edge Buttons */}
          <button
            aria-label="Previous hero banner"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/70 hover:scale-110 active:scale-95"
            onClick={handlePrev}
            type="button"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            aria-label="Next hero banner"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/70 hover:scale-110 active:scale-95"
            onClick={handleNext}
            type="button"
          >
            <ChevronRight size={22} />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 backdrop-blur-md">
            {banners.map((b, idx) => (
              <button
                key={b.id}
                aria-label={`Go to slide ${idx + 1}`}
                aria-current={idx === currentIndex ? "true" : undefined}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? "w-7 bg-amber-400" : "w-2.5 bg-white/40 hover:bg-white/70"
                }`}
                onClick={() => setCurrentIndex(idx)}
                type="button"
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
