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
  videoSrc,
  posterSrc,
  className,
}: {
  banner: HeroBanner;
  isActive: boolean;
  isReducedMotion: boolean;
  videoSrc?: string;
  posterSrc?: string | null;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasError, setHasError] = useState(false);
  const activeSrc = videoSrc || banner.media_url;
  const activePoster = posterSrc !== undefined ? posterSrc : banner.poster_url;

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
            // Autoplay restrictions unlock on gesture
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
  }, [isActive, isReducedMotion, hasError, activeSrc]);

  if (hasError || !activeSrc) {
    return activePoster ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={banner.alt_text || banner.headline}
        className={`absolute inset-0 h-full w-full object-cover pointer-events-none ${className || ""}`}
        src={activePoster}
      />
    ) : null;
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      aria-hidden="true"
      className={`absolute inset-0 h-full w-full object-cover pointer-events-none ${className || ""}`}
      loop
      muted
      onError={() => setHasError(true)}
      playsInline
      preload="auto"
      poster={activePoster || undefined}
      src={activeSrc}
    />
  );
}

export function HeroSlider({ banners }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [manualTrigger, setManualTrigger] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  const bannerCount = banners.length;
  // Guard index within available bounds
  const activeIndex = currentIndex >= bannerCount ? 0 : currentIndex;
  const currentBanner = banners[activeIndex];
  const isCurrentBannerVideo = currentBanner?.media_type === "video";

  const resetTimer = useCallback(() => {
    setManualTrigger((prev) => prev + 1);
  }, []);

  const handleNext = useCallback(() => {
    if (bannerCount > 1) {
      setCurrentIndex((prev) => (prev + 1) % bannerCount);
      resetTimer();
    }
  }, [bannerCount, resetTimer]);

  const handlePrev = useCallback(() => {
    if (bannerCount > 1) {
      setCurrentIndex((prev) => (prev - 1 + bannerCount) % bannerCount);
      resetTimer();
    }
  }, [bannerCount, resetTimer]);

  const handleDotClick = useCallback((idx: number) => {
    setCurrentIndex(idx);
    resetTimer();
  }, [resetTimer]);

  // Automatic slide animation every 5 seconds without pauses
  useEffect(() => {
    if (bannerCount <= 1 || isCurrentBannerVideo) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerCount);
    }, 5000);

    return () => clearInterval(timer);
  }, [bannerCount, isCurrentBannerVideo, manualTrigger]);

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
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diffX = touchStartX.current - touchEndX.current;
    const diffY = (touchStartY.current ?? 0) - (touchEndY.current ?? 0);
    const minSwipeDistance = 40;

    // Only trigger swipe if horizontal motion is dominant, preserving smooth vertical page scroll
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
      if (diffX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
    touchEndY.current = null;
  };

  if (bannerCount === 0) {
    return (
      <section className="relative w-full overflow-hidden min-h-[540px] xs:min-h-[560px] sm:min-h-[700px] lg:h-[760px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="/bg-image-aada.png"
            alt="Authentic Kerala Payasam & Delicacies"
            className="h-full w-full object-cover object-center pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2b1719]/40 via-transparent to-black/10" />
        </div>

        <Container className="relative z-20 w-full pt-20 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20 my-auto">
          <div className="grid lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 xl:col-span-6 flex flex-col justify-center">
              <div className="relative w-full max-w-[68%] xs:max-w-[65%] sm:max-w-none pl-1 sm:pl-0 bg-transparent sm:bg-gradient-to-br sm:from-white/50 sm:via-[#fcf6ed]/32 sm:to-[#f5e8d6]/22 border-0 sm:border sm:border-white/40 shadow-none sm:shadow-[0_20px_50px_-12px_rgba(43,23,25,0.12),inset_0_1px_1.5px_0_rgba(255,255,255,0.75)] sm:rounded-[2.5rem] p-0 sm:p-8 lg:p-9 sm:backdrop-blur-xl">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em] text-[#711e2c]">
                    A TASTE OF HOME
                  </span>
                  <span className="h-[1.5px] w-10 sm:w-14 bg-[#711e2c]/40 rounded-full" />
                </div>

                <h1 className="mt-2.5 sm:mt-3 font-display text-[25px] xs:text-[27px] sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#2b1719] leading-[1.16] sm:leading-[1.2]">
                  Every celebration begins with a little sweetness.
                </h1>

                <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 text-[12.5px] sm:text-sm text-[#381a1f] font-medium sm:font-normal leading-[1.48] sm:leading-relaxed max-w-xl">
                  <p>
                    At Namma Ada, we bring the soul of Kerala into the homes of Bangalore. Every bowl of Palada Payasam, every Unniyappam, every bottle of pure coconut oil, and every delicacy we create is handcrafted with tradition and a whole lot of love.
                  </p>
                  <p className="hidden sm:block">
                    We don&apos;t just serve food. We serve memories, festivals, and the comforting taste of home.
                  </p>
                </div>

                <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full max-w-[215px] sm:max-w-none">
                  <Link
                    className="inline-flex min-h-[44px] sm:min-h-11 items-center justify-center gap-2 rounded-full bg-[#711e2c] hover:bg-[#5a1723] px-6 sm:px-7 text-[13px] sm:text-sm font-semibold text-white shadow-md shadow-[#711e2c]/20 transition-all duration-150 active:scale-95 cursor-pointer"
                    href="/products"
                  >
                    <span>Explore Now</span>
                    <ArrowRight size={15} />
                  </Link>
                  <Link
                    className="inline-flex min-h-[44px] sm:min-h-11 items-center justify-center rounded-full border border-[#711e2c]/20 bg-[#f4efe8] sm:bg-white/25 hover:bg-[#ebe2d8] sm:hover:bg-white/45 px-6 sm:px-7 text-[13px] sm:text-sm font-semibold text-[#711e2c] sm:backdrop-blur-xs transition-all duration-150 active:scale-95 shadow-xs sm:shadow-none cursor-pointer"
                    href="/contact"
                  >
                    <span>Bulk Orders</span>
                  </Link>
                </div>

                {/* Desktop-only feature row */}
                <div className="hidden sm:grid sm:grid-cols-3 sm:gap-2 sm:mt-6 sm:pt-4 sm:border-t sm:border-[#711e2c]/15">
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
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section
      aria-label="Storefront Hero Banner Slider"
      className="relative w-full overflow-hidden min-h-[540px] xs:min-h-[560px] sm:min-h-[700px] lg:h-[760px] flex items-center touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* HORIZONTAL SLIDING CAROUSEL TRACK */}
      <div
        className="absolute inset-0 flex h-full w-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {banners.map((banner, index) => {
          const isActive = index === activeIndex;
          const isVideo = banner.media_type === "video";

          return (
            <div
              key={banner.id}
              aria-hidden={!isActive}
              className="relative h-full w-full min-w-full shrink-0 overflow-hidden"
            >
              {banner.mobile_media_url ? (
                <>
                  {banner.mobile_media_type === "video" ? (
                    <HeroVideoSlide
                      banner={banner}
                      className="sm:hidden"
                      isActive={isActive}
                      isReducedMotion={false}
                      videoSrc={banner.mobile_media_url}
                    />
                  ) : (
                    <img
                      alt={banner.alt_text || banner.headline}
                      className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none sm:hidden"
                      loading={index === 0 ? "eager" : "lazy"}
                      src={banner.mobile_media_url}
                    />
                  )}

                  {isVideo ? (
                    <HeroVideoSlide
                      banner={banner}
                      className="hidden sm:block"
                      isActive={isActive}
                      isReducedMotion={false}
                    />
                  ) : (
                    <img
                      alt={banner.alt_text || banner.headline}
                      className="hidden sm:block absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
                      loading={index === 0 ? "eager" : "lazy"}
                      src={banner.media_url}
                    />
                  )}
                </>
              ) : (
                <>
                  {isVideo ? (
                    <HeroVideoSlide
                      banner={banner}
                      isActive={isActive}
                      isReducedMotion={false}
                    />
                  ) : (
                    <img
                      alt={banner.alt_text || banner.headline}
                      className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
                      loading={index === 0 ? "eager" : "lazy"}
                      src={banner.media_url}
                    />
                  )}
                </>
              )}

              {/* Contrast overlay */}
              {isVideo ? (
                <div className="absolute inset-0 bg-black/10 pointer-events-none" />
              ) : (
                <div className="absolute inset-0 bg-transparent sm:bg-gradient-to-t sm:from-black/60 sm:via-transparent sm:to-black/20 lg:bg-gradient-to-r lg:from-black/50 lg:via-transparent lg:to-transparent pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>

      {/* CONTENT REGION: EDITORIAL GLASS PANEL (Hidden when video mode is active) */}
      {!isCurrentBannerVideo && currentBanner && (
        <Container className="relative z-20 w-full pt-20 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20 my-auto">
          <div className="grid lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 xl:col-span-6 flex flex-col justify-center">
              <div
                key={activeIndex}
                className="relative w-full max-w-[68%] xs:max-w-[65%] sm:max-w-none pl-1 sm:pl-0 bg-transparent sm:bg-gradient-to-br sm:from-white/50 sm:via-[#fcf6ed]/32 sm:to-[#f5e8d6]/22 border-0 sm:border sm:border-white/40 shadow-none sm:shadow-[0_20px_50px_-12px_rgba(43,23,25,0.12),inset_0_1px_1.5px_0_rgba(255,255,255,0.75)] sm:rounded-[2.5rem] p-0 sm:p-8 lg:p-9 sm:backdrop-blur-xl animate-in fade-in duration-300"
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em] text-[#711e2c]">
                    {currentBanner.eyebrow || "A TASTE OF HOME"}
                  </span>
                  <span className="h-[1.5px] w-10 sm:w-14 bg-[#711e2c]/40 rounded-full" />
                </div>

                <h1 className="mt-2.5 sm:mt-3 font-display text-[25px] xs:text-[27px] sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#2b1719] leading-[1.16] sm:leading-[1.2]">
                  {currentBanner.mobile_headline ? (
                    <>
                      <span className="sm:hidden">{currentBanner.mobile_headline}</span>
                      <span className="hidden sm:inline">{currentBanner.headline}</span>
                    </>
                  ) : (
                    currentBanner.headline || "Every celebration begins with a little sweetness."
                  )}
                </h1>

                <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 text-[12.5px] sm:text-sm text-[#381a1f] font-medium sm:font-normal leading-[1.48] sm:leading-relaxed max-w-xl">
                  {(currentBanner.description || "At Namma Ada, we bring the soul of Kerala into the homes of Bangalore. Every bowl of Palada Payasam, every Unniyappam, every bottle of pure coconut oil, and every delicacy we create is handcrafted with tradition and a whole lot of love.\n\nWe don't just serve food. We serve memories, festivals, and the comforting taste of home.").split("\n\n").map((para, idx) => (
                    <p key={idx} className={idx > 0 ? "hidden sm:block" : ""}>{para}</p>
                  ))}
                </div>

                <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full max-w-[215px] sm:max-w-none">
                  <Link
                    className="inline-flex min-h-[44px] sm:min-h-11 items-center justify-center gap-2 rounded-full bg-[#711e2c] hover:bg-[#5a1723] px-6 sm:px-7 text-[13px] sm:text-sm font-semibold text-white shadow-md shadow-[#711e2c]/20 transition-all duration-150 active:scale-95 cursor-pointer"
                    href={currentBanner.primary_cta_href || "/products"}
                  >
                    <span>Explore Now</span> <ArrowRight size={15} />
                  </Link>

                  <Link
                    className="inline-flex min-h-[44px] sm:min-h-11 items-center justify-center rounded-full border border-[#711e2c]/20 bg-[#f4efe8] sm:bg-white/25 hover:bg-[#ebe2d8] sm:hover:bg-white/45 px-6 sm:px-7 text-[13px] sm:text-sm font-semibold text-[#711e2c] sm:backdrop-blur-xs transition-all duration-150 active:scale-95 shadow-xs sm:shadow-none cursor-pointer"
                    href={currentBanner.secondary_cta_href || "/contact"}
                  >
                    <span>Bulk Orders</span>
                  </Link>
                </div>

                <div className="hidden sm:grid sm:grid-cols-3 sm:gap-2 sm:mt-6 sm:pt-4 sm:border-t sm:border-[#711e2c]/15">
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
          </div>
        </Container>
      )}

      {bannerCount > 1 && !isCurrentBannerVideo && (
        <>
          <button
            aria-label="Previous hero banner"
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-xs transition-all hover:bg-black/60 active:scale-95 cursor-pointer shadow-md"
            onClick={handlePrev}
            type="button"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            aria-label="Next hero banner"
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-xs transition-all hover:bg-black/60 active:scale-95 cursor-pointer shadow-md"
            onClick={handleNext}
            type="button"
          >
            <ChevronRight size={22} />
          </button>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3.5 py-1.5 backdrop-blur-md shadow-lg">
            {banners.map((b, idx) => (
              <button
                key={b.id}
                aria-label={`Go to slide ${idx + 1}`}
                aria-current={idx === activeIndex ? "true" : undefined}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === activeIndex ? "w-7 bg-[#fbf7ef] shadow-sm" : "w-2.5 bg-white/40 hover:bg-white/70"
                }`}
                onClick={() => handleDotClick(idx)}
                type="button"
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
