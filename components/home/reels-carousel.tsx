"use client";

import { useRef, useState, useEffect, useCallback } from "react";
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [updateScrollState]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-reel-card]");
    const scrollAmount = card ? card.offsetWidth + 14 : 210;

    if (direction === "left") {
      if (el.scrollLeft <= 10) {
        // Wrap to end smoothly
        el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
      } else {
        el.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      }
    } else {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 15) {
        // Wrap to start smoothly
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  if (reels.length === 0) return null;

  return (
    <div className="relative w-full my-6">
      {/* Left swipe button */}
      <button
        type="button"
        aria-label="Swipe reels left"
        onClick={() => handleScroll("left")}
        className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-[#e5d8c6] bg-[#fffdf8]/90 text-[#711e2c] shadow-md backdrop-blur-xs [transform:translateZ(0)] transition-all hover:bg-white hover:scale-105 active:scale-90 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#711e2c]"
      >
        <ChevronLeft size={20} className="mr-0.5" />
      </button>

      {/* Reel cards scroll container - touch swipe preserved and fully functional */}
      <div
        ref={scrollContainerRef}
        onScroll={updateScrollState}
        className="w-full max-w-full flex items-center justify-start sm:justify-center gap-3.5 sm:gap-4 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scrollbar-none px-4 sm:px-0 -mx-4 sm:mx-0 touch-pan-x scroll-smooth"
      >
        {reels.map((reel) => (
          <div
            key={reel.id}
            data-reel-card
            className="w-[185px] xs:w-[200px] sm:w-[210px] aspect-[9/16] shrink-0 rounded-2xl overflow-hidden shadow-soft border border-[#e5d8c6] bg-black relative snap-start sm:snap-center"
          >
            <ReelCardPlayer
              src={reel.video_url}
              title={reel.alt_text}
              instagramUrl={reel.instagram_url || fallbackInstagramUrl}
              className="h-full w-full"
            />
          </div>
        ))}
        <div className="w-1 shrink-0 sm:hidden" aria-hidden="true" />
      </div>

      {/* Right swipe button */}
      <button
        type="button"
        aria-label="Swipe reels right"
        onClick={() => handleScroll("right")}
        className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-[#e5d8c6] bg-[#fffdf8]/90 text-[#711e2c] shadow-md backdrop-blur-xs [transform:translateZ(0)] transition-all hover:bg-white hover:scale-105 active:scale-90 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#711e2c]"
      >
        <ChevronRight size={20} className="ml-0.5" />
      </button>
    </div>
  );
}
