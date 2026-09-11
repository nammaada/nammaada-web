"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ReelCardPlayer } from "./reel-card-player";
import type { KitchenReel } from "@/lib/storefront/content";

export function ReelsCarousel({
  reels,
  fallbackInstagramUrl = "https://www.instagram.com/namma_ada/",
}: {
  reels: KitchenReel[];
  fallbackInstagramUrl?: string;
}) {
  const [activeReelId, setActiveReelId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const displayReels = (reels || []).slice(0, 3);
  const total = displayReels.length;

  useEffect(() => {
    setIsMounted(true);
    const checkViewport = () => {
      setIsDesktop(window.innerWidth >= 640);
    };
    checkViewport();
    window.addEventListener("resize", checkViewport, { passive: true });
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    setActiveReelId(null);
  }, [total]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
    setActiveReelId(null);
  }, [total]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
  };

  if (total === 0) return null;

  // On client after mount: conditionally render ONLY the active viewport layout
  // (Prevents duplicate DOM nodes and duplicate video players completely)
  const renderMobileStack = !isMounted || !isDesktop;
  const renderDesktopGrid = !isMounted || isDesktop;

  return (
    <div className="w-full my-6 select-none">
      {/* ==================================================================== */}
      {/* 1. MOBILE ONLY: 3D ROTATING COVERFLOW STACK WITH CIRCULAR BUTTONS    */}
      {/*    - 1 center card in front                                          */}
      {/*    - 2 peek cards on back left & right                               */}
      {/*    - Endlessly rotating circular arrow buttons                       */}
      {/* ==================================================================== */}
      {renderMobileStack && (
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={`${isMounted ? "flex" : "flex sm:hidden"} relative w-full items-center justify-center h-[395px] overflow-hidden my-2 select-none`}
        >
          {displayReels.map((reel, index) => {
            const diff = (index - currentIndex + total) % total;
            const isCenter = diff === 0;
            const isRight = diff === 1;
            const isLeft = diff === total - 1;

            let positionClasses = "opacity-0 pointer-events-none scale-75";
            if (isCenter) {
              positionClasses =
                "z-20 scale-100 opacity-100 translate-x-0 shadow-2xl pointer-events-auto";
            } else if (isRight) {
              positionClasses =
                "z-10 scale-[0.84] opacity-55 translate-x-[62%] shadow-md pointer-events-auto";
            } else if (isLeft) {
              positionClasses =
                "z-10 scale-[0.84] opacity-55 -translate-x-[62%] shadow-md pointer-events-auto";
            }

            return (
              <div
                key={reel.id}
                onClick={() => {
                  if (!isCenter) {
                    setCurrentIndex(index);
                    setActiveReelId(null);
                  }
                }}
                className={`absolute w-[64vw] max-w-[215px] aspect-[9/16] rounded-2xl overflow-hidden border border-[#e5d8c6] bg-black transition-all duration-300 ease-out ${positionClasses}`}
              >
                <ReelCardPlayer
                  src={reel.video_url}
                  youtubeUrl={reel.youtube_url}
                  youtubeId={reel.youtube_id}
                  title={reel.alt_text}
                  instagramUrl={reel.instagram_url || fallbackInstagramUrl}
                  className="h-full w-full"
                  isActive={isCenter && activeReelId === reel.id}
                  onActivate={() => setActiveReelId(reel.id)}
                  onDeactivate={() => setActiveReelId((curr) => (curr === reel.id ? null : curr))}
                />
              </div>
            );
          })}

          {/* Circular Left Arrow Button (<) */}
          {total > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#2b1719] shadow-lg border border-white/60 transition-transform active:scale-90 hover:bg-white cursor-pointer"
              aria-label="Previous video"
            >
              <ChevronLeft size={20} className="-translate-x-0.5" />
            </button>
          )}

          {/* Circular Right Arrow Button (>) */}
          {total > 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#2b1719] shadow-lg border border-white/60 transition-transform active:scale-90 hover:bg-white cursor-pointer"
              aria-label="Next video"
            >
              <ChevronRight size={20} className="translate-x-0.5" />
            </button>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. DESKTOP SCREEN ONLY: CLEAN 3-CARD SIDE-BY-SIDE PRESENTATION       */}
      {/* ==================================================================== */}
      {renderDesktopGrid && (
        <div
          className={`${isMounted ? "flex" : "hidden sm:flex"} w-full items-center justify-center gap-6 pb-4 pt-1`}
        >
          {displayReels.map((reel) => (
            <div
              key={reel.id}
              data-reel-card
              className="w-[220px] lg:w-[235px] aspect-[9/16] shrink-0 rounded-2xl overflow-hidden shadow-soft border border-[#e5d8c6] bg-black relative transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <ReelCardPlayer
                src={reel.video_url}
                youtubeUrl={reel.youtube_url}
                youtubeId={reel.youtube_id}
                title={reel.alt_text}
                instagramUrl={reel.instagram_url || fallbackInstagramUrl}
                className="h-full w-full"
                isActive={activeReelId === reel.id}
                onActivate={() => setActiveReelId(reel.id)}
                onDeactivate={() => setActiveReelId((curr) => (curr === reel.id ? null : curr))}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
