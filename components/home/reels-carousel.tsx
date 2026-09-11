"use client";

import { useState, useRef } from "react";
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

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const displayReels = (reels || []).slice(0, 3);
  const total = displayReels.length;

  if (total === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    setActiveReelId(null);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
    setActiveReelId(null);
  };

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

  return (
    <div className="w-full my-6">
      {/* ==================================================================== */}
      {/* 1. MOBILE SCREEN ONLY: 3D ROTATING COVERFLOW STACK WITH BUTTONS      */}
      {/*    - 1 center card in front                                          */}
      {/*    - 2 peek cards on back left & right                               */}
      {/*    - Circular arrow buttons rotate endlessly without breaking        */}
      {/* ==================================================================== */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full flex sm:hidden items-center justify-center h-[395px] overflow-hidden my-2 select-none"
      >
        {displayReels.map((reel, index) => {
          const diff = (index - currentIndex + total) % total;
          const isCenter = diff === 0;
          const isRight = diff === 1;
          const isLeft = diff === total - 1;

          let positionClasses = "opacity-0 pointer-events-none scale-75";
          if (isCenter) {
            positionClasses = "z-20 scale-100 opacity-100 translate-x-0 shadow-2xl pointer-events-auto";
          } else if (isRight) {
            positionClasses = "z-10 scale-[0.84] opacity-55 translate-x-[62%] shadow-md pointer-events-auto";
          } else if (isLeft) {
            positionClasses = "z-10 scale-[0.84] opacity-55 -translate-x-[62%] shadow-md pointer-events-auto";
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

      {/* ==================================================================== */}
      {/* 2. DESKTOP SCREEN ONLY: CLEAN 3-CARD SIDE-BY-SIDE PRESENTATION       */}
      {/* ==================================================================== */}
      <div className="hidden sm:flex w-full items-center justify-center gap-6 pb-4 pt-1">
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
            />
          </div>
        ))}
      </div>
    </div>
  );
}
