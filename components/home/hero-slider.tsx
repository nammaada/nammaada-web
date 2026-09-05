"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Leaf, Heart, Gift } from "lucide-react";
import { Container } from "@/components/ui/container";
import type { HeroBanner } from "@/lib/storefront/hero";

type HeroSliderProps = {
  banners: HeroBanner[];
};

function HeroVideoSlide({
  banner,
  isActive,
  isReducedMotion,
}: {
  banner: HeroBanner;
  isActive: boolean;
  isReducedMotion: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isActive || isReducedMotion || hasError) return;

    // Strict browser autoplay compliance
    video.defaultMuted = true;
    video.muted = true;

    const tryPlay = () => {
      if (video && video.paused) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Browser autoplay restrictions will unlock on first user gesture
          });
        }
      }
    };

    tryPlay();

    video.addEventListener("canplay", tryPlay);
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("loadedmetadata", tryPlay);

    // Fallback: unlock playback on first touch/click/scroll/hover if browser blocked initial autoplay
    const handleFirstGesture = () => {
      tryPlay();
      window.removeEventListener("click", handleFirstGesture);
      window.removeEventListener("touchstart", handleFirstGesture);
      window.removeEventListener("scroll", handleFirstGesture);
      window.removeEventListener("pointerdown", handleFirstGesture);
    };

    window.addEventListener("click", handleFirstGesture, { passive: true });
    window.addEventListener("touchstart", handleFirstGesture, { passive: true });
    window.addEventListener("scroll", handleFirstGesture, { passive: true });
    window.addEventListener("pointerdown", handleFirstGesture, { passive: true });

    return () => {
      video.removeEventListener("canplay", tryPlay);
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("loadedmetadata", tryPlay);
      window.removeEventListener("click", handleFirstGesture);
      window.removeEventListener("touchstart", handleFirstGesture);
      window.removeEventListener("scroll", handleFirstGesture);
      window.removeEventListener("pointerdown", handleFirstGesture);
    };
  }, [isActive, isReducedMotion, hasError, banner.media_url]);

  // If video errored out or has no video URL, display fallback poster image
  if (hasError || !banner.media_url) {
    return banner.poster_url ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={banner.alt_text || banner.headline}
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
        src={banner.poster_url}
      />
    ) : null;
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      aria-hidden="true"
      className="absolute inset-0 h-full w-full object-cover pointer-events-none"
      loop
      muted
      onError={() => setHasError(true)}
      playsInline
      preload="auto"
      src={banner.media_url}
    />
  );
}

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
      className="relative w-full overflow-hidden bg-[#2b1719] min-h-[660px] sm:min-h-[720px] lg:h-[780px] flex items-center"
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
            {isVideo ? (
              <HeroVideoSlide
                banner={banner}
                isActive={isActive}
                isReducedMotion={isReducedMotion}
              />
            ) : (
              /* Image Background Slide */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={banner.alt_text || banner.headline}
                className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                loading={index === 0 ? "eager" : "lazy"}
                src={banner.media_url}
              />
            )}
          </div>
        );
      })}

      {/* CONTENT OVERLAY */}
      <Container className="relative z-20 w-full pt-28 pb-14 sm:pt-32 sm:pb-16 lg:pt-36 lg:pb-20">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* LEFT: Translucent Whitish Glass Content Box */}
          <div className="lg:col-span-7 xl:col-span-6">
            <div
              key={currentIndex}
              className="relative w-full rounded-3xl sm:rounded-[2.5rem] border border-white/70 bg-gradient-to-br from-white/75 via-white/55 to-white/40 backdrop-blur-xl p-6 sm:p-9 lg:p-10 shadow-2xl shadow-amber-950/15 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              {/* Eyebrow tag with horizontal line divider matching reference image */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em] text-[#6b1e28]">
                  {currentBanner.mobile_headline && typeof window !== "undefined" && window.innerWidth < 640
                    ? currentBanner.mobile_headline
                    : currentBanner.eyebrow}
                </span>
                <span className="h-[1.5px] w-12 bg-[#6b1e28]/35 rounded-full" />
              </div>

              {/* Headline in serif display font */}
              <h1 className="mt-3.5 font-display text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[#3d0b13] leading-[1.12] whitespace-pre-line">
                {currentBanner.headline}
              </h1>

              {/* Description */}
              <p className="mt-3.5 text-xs sm:text-sm text-[#4a242a]/85 leading-relaxed max-w-md">
                {currentBanner.mobile_description && typeof window !== "undefined" && window.innerWidth < 640
                  ? currentBanner.mobile_description
                  : currentBanner.description}
              </p>

              {/* Buttons Row */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#5c111a] hover:bg-[#480d14] px-6 sm:px-7 text-xs sm:text-sm font-semibold text-white shadow-md transition-all duration-200 active:scale-95"
                  href={currentBanner.primary_cta_href}
                >
                  {currentBanner.primary_cta_label} <ArrowRight size={15} />
                </Link>

                {currentBanner.is_secondary_cta_enabled && currentBanner.secondary_cta_label && currentBanner.secondary_cta_href ? (
                  <Link
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#5c111a]/25 bg-white/40 hover:bg-white/70 px-6 sm:px-7 text-xs sm:text-sm font-semibold text-[#5c111a] backdrop-blur-xs transition-all duration-200 active:scale-95"
                    href={currentBanner.secondary_cta_href}
                  >
                    {currentBanner.secondary_cta_label}
                  </Link>
                ) : (
                  <Link
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#5c111a]/25 bg-white/40 hover:bg-white/70 px-6 sm:px-7 text-xs sm:text-sm font-semibold text-[#5c111a] backdrop-blur-xs transition-all duration-200 active:scale-95"
                    href="/contact"
                  >
                    Bulk Orders
                  </Link>
                )}
              </div>

              {/* Feature Items inside the card at the bottom matching reference image */}
              <div className="mt-7 pt-5 border-t border-[#5c111a]/15 grid grid-cols-3 gap-2">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <Leaf className="text-[#5c111a] shrink-0" size={18} strokeWidth={2} />
                  <div className="text-[10px] sm:text-[11px] font-semibold text-[#3d0b13] leading-tight">
                    Authentic<br className="hidden sm:block" /> Kerala Taste
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-2.5 border-l border-[#5c111a]/15 pl-2 sm:pl-3">
                  <Heart className="text-[#5c111a] shrink-0" size={18} strokeWidth={2} />
                  <div className="text-[10px] sm:text-[11px] font-semibold text-[#3d0b13] leading-tight">
                    Made<br className="hidden sm:block" /> With Love
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-2.5 border-l border-[#5c111a]/15 pl-2 sm:pl-3">
                  <Gift className="text-[#5c111a] shrink-0" size={18} strokeWidth={2} />
                  <div className="text-[10px] sm:text-[11px] font-semibold text-[#3d0b13] leading-tight">
                    Bulk Orders<br className="hidden sm:block" /> Welcome
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Floating "Premium Quality" Glass Badge matching Reference Image */}
          <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 justify-end items-center pr-4">
            <div className="flex items-center gap-3 rounded-2xl border border-white/65 bg-white/25 backdrop-blur-md px-5 py-3.5 text-white shadow-xl shadow-black/15 transition-all hover:bg-white/30">
              <Leaf className="text-amber-300 shrink-0" size={22} strokeWidth={2} />
              <div className="text-xs font-semibold leading-tight text-white drop-shadow-sm">
                Premium<br />Quality
              </div>
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
