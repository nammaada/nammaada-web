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

    video.defaultMuted = true;
    video.muted = true;

    const tryPlay = () => {
      if (video && video.paused) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay restrictions will unlock on first user gesture
          });
        }
      }
    };

    tryPlay();

    video.addEventListener("canplay", tryPlay);
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("loadedmetadata", tryPlay);

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

  useEffect(() => {
    if (bannerCount <= 1 || isHovered || isReducedMotion) return;

    const timer = setInterval(() => {
      handleNext();
    }, 6000);

    return () => clearInterval(timer);
  }, [bannerCount, isHovered, isReducedMotion, handleNext]);

  useEffect(() => {
    if (bannerCount <= 1) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [bannerCount, handleNext, handlePrev]);

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

  // Fallback hero if no active banners
  if (bannerCount === 0) {
    return (
      <section className="relative w-full overflow-hidden min-h-[620px] sm:min-h-[700px] lg:h-[760px] flex items-center">
        {/* Background Image asset matching Reference 2 mockup */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/nammaad bg image.png"
            alt="Authentic Kerala Payasam & Delicacies"
            className="h-full w-full object-cover object-center pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2b1719]/40 via-transparent to-black/10" />
        </div>

        {/* Editorial Glass Panel matching Reference 2 */}
        <Container className="relative z-20 w-full pt-20 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20">
          <div className="grid lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 xl:col-span-6">
              <div className="relative w-full rounded-3xl sm:rounded-[2.5rem] border border-white/40 bg-gradient-to-br from-white/50 via-[#fcf6ed]/32 to-[#f5e8d6]/22 backdrop-blur-xl p-6 sm:p-8 lg:p-9 shadow-[0_20px_50px_-12px_rgba(43,23,25,0.12),inset_0_1px_1.5px_0_rgba(255,255,255,0.75)]">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em] text-[#711e2c]">
                    A TASTE OF HOME
                  </span>
                  <span className="h-[1.5px] w-10 sm:w-14 bg-[#711e2c]/35 rounded-full" />
                </div>

                <h1 className="mt-3 font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#2b1719] leading-[1.2]">
                  Every celebration begins with a little sweetness.
                </h1>

                <div className="mt-4 space-y-3 text-xs sm:text-sm text-[#4a242a]/90 leading-relaxed max-w-xl">
                  <p>
                    At Namma Ada, we bring the soul of Kerala into the homes of Bangalore. Every bowl of Palada Payasam, every Unniyappam, every bottle of pure coconut oil, and every delicacy we create is handcrafted with tradition and a whole lot of love.
                  </p>
                  <p>
                    We don&apos;t just serve food. We serve memories, festivals, and the comforting taste of home.
                  </p>
                </div>

                {/* Buttons */}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Link
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#711e2c] hover:bg-[#5a1723] px-6 sm:px-7 text-xs sm:text-sm font-semibold text-white shadow-md transition-all duration-150 active:scale-95"
                    href="/products"
                  >
                    Explore Now <ArrowRight size={15} />
                  </Link>

                  <Link
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#711e2c]/20 bg-white/25 hover:bg-white/45 px-6 sm:px-7 text-xs sm:text-sm font-semibold text-[#711e2c] backdrop-blur-xs transition-all duration-150 active:scale-95"
                    href="/contact"
                  >
                    Bulk Orders
                  </Link>
                </div>

                {/* Feature highlights */}
                <div className="mt-6 pt-4 border-t border-[#711e2c]/15 grid grid-cols-3 gap-2">
                  <div className="flex items-center gap-2">
                    <Leaf className="text-[#711e2c] shrink-0" size={16} strokeWidth={2} />
                    <span className="text-[10px] sm:text-[11px] font-semibold text-[#3d0b13]">Authentic Taste</span>
                  </div>
                  <div className="flex items-center gap-2 border-l border-[#711e2c]/15 pl-2 sm:pl-3">
                    <Heart className="text-[#711e2c] shrink-0" size={16} strokeWidth={2} />
                    <span className="text-[10px] sm:text-[11px] font-semibold text-[#3d0b13]">Made With Love</span>
                  </div>
                  <div className="flex items-center gap-2 border-l border-[#711e2c]/15 pl-2 sm:pl-3">
                    <Gift className="text-[#711e2c] shrink-0" size={16} strokeWidth={2} />
                    <span className="text-[10px] sm:text-[11px] font-semibold text-[#3d0b13]">Bulk Orders</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 justify-end items-center pr-4">
              <div className="flex items-center gap-3 rounded-2xl border border-white/65 bg-white/25 backdrop-blur-md px-5 py-3.5 text-white shadow-xl shadow-black/15">
                <Leaf className="text-amber-300 shrink-0" size={22} strokeWidth={2} />
                <div className="text-xs font-semibold leading-tight text-white drop-shadow-sm">
                  Premium<br />Quality
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <section
      aria-label="Storefront Hero Banner Slider"
      className="relative w-full overflow-hidden min-h-[620px] sm:min-h-[700px] lg:h-[760px] flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* BACKGROUND MEDIA SLIDES */}
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
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={banner.alt_text || banner.headline}
                className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                loading={index === 0 ? "eager" : "lazy"}
                src={banner.media_url}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 lg:bg-gradient-to-r lg:from-black/50 lg:via-transparent lg:to-transparent" />
          </div>
        );
      })}

      {/* CONTENT REGION: EDITORIAL GLASS PANEL MATCHING REFERENCE 2 */}
      <Container className="relative z-20 w-full pt-20 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20">
        <div className="grid lg:grid-cols-12 gap-6 items-center">
          {/* LEFT: GLASS CONTENT PANEL */}
          <div className="lg:col-span-7 xl:col-span-6">
            <div
              key={currentIndex}
              className="relative w-full rounded-3xl sm:rounded-[2.5rem] border border-white/40 bg-gradient-to-br from-white/50 via-[#fcf6ed]/32 to-[#f5e8d6]/22 backdrop-blur-xl p-6 sm:p-8 lg:p-9 shadow-[0_20px_50px_-12px_rgba(43,23,25,0.12),inset_0_1px_1.5px_0_rgba(255,255,255,0.75)] animate-in fade-in duration-300"
            >
              {/* Eyebrow */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em] text-[#711e2c]">
                  {currentBanner.eyebrow || "A TASTE OF HOME"}
                </span>
                <span className="h-[1.5px] w-10 sm:w-14 bg-[#711e2c]/35 rounded-full" />
              </div>

              {/* Headline */}
              <h1 className="mt-3 font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#2b1719] leading-[1.2]">
                {currentBanner.headline || "Every celebration begins with a little sweetness."}
              </h1>

              {/* Description Paragraphs */}
              <div className="mt-4 space-y-3 text-xs sm:text-sm text-[#4a242a]/90 leading-relaxed max-w-xl">
                {(currentBanner.description || "At Namma Ada, we bring the soul of Kerala into the homes of Bangalore. Every bowl of Palada Payasam, every Unniyappam, every bottle of pure coconut oil, and every delicacy we create is handcrafted with tradition and a whole lot of love.\n\nWe don't just serve food. We serve memories, festivals, and the comforting taste of home.").split("\n\n").map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#711e2c] hover:bg-[#5a1723] px-6 sm:px-7 text-xs sm:text-sm font-semibold text-white shadow-md transition-all duration-150 active:scale-95"
                  href={currentBanner.primary_cta_href || "/products"}
                >
                  {currentBanner.primary_cta_label || "Explore Now"} <ArrowRight size={15} />
                </Link>

                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#711e2c]/20 bg-white/25 hover:bg-white/45 px-6 sm:px-7 text-xs sm:text-sm font-semibold text-[#711e2c] backdrop-blur-xs transition-all duration-150 active:scale-95"
                  href={currentBanner.secondary_cta_href || "/contact"}
                >
                  {currentBanner.secondary_cta_label || "Bulk Orders"}
                </Link>
              </div>

              {/* Feature Highlights */}
              <div className="mt-6 pt-4 border-t border-[#711e2c]/15 grid grid-cols-3 gap-2">
                <div className="flex items-center gap-2">
                  <Leaf className="text-[#711e2c] shrink-0" size={16} strokeWidth={2} />
                  <span className="text-[10px] sm:text-[11px] font-semibold text-[#3d0b13]">Authentic Taste</span>
                </div>
                <div className="flex items-center gap-2 border-l border-[#711e2c]/15 pl-2 sm:pl-3">
                  <Heart className="text-[#711e2c] shrink-0" size={16} strokeWidth={2} />
                  <span className="text-[10px] sm:text-[11px] font-semibold text-[#3d0b13]">Made With Love</span>
                </div>
                <div className="flex items-center gap-2 border-l border-[#711e2c]/15 pl-2 sm:pl-3">
                  <Gift className="text-[#711e2c] shrink-0" size={16} strokeWidth={2} />
                  <span className="text-[10px] sm:text-[11px] font-semibold text-[#3d0b13]">Bulk Orders</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Floating "Premium Quality" Glass Badge matching Reference 2 */}
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

      {/* CONTROLS (When 2+ active banners) */}
      {bannerCount > 1 && (
        <>
          <button
            aria-label="Previous hero banner"
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-xs transition-all hover:bg-black/60 active:scale-95"
            onClick={handlePrev}
            type="button"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            aria-label="Next hero banner"
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-xs transition-all hover:bg-black/60 active:scale-95"
            onClick={handleNext}
            type="button"
          >
            <ChevronRight size={22} />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 backdrop-blur-md">
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

