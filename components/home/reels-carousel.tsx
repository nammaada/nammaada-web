"use client";

import { useState } from "react";
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
  const displayReels = (reels || []).slice(0, 3);

  if (displayReels.length === 0) return null;

  return (
    <div className="w-full my-6">
      {/* 
        Responsive layout:
        - Mobile: Smooth horizontal scroll strip with balanced padding (px-5), equal card width, and snap-centering.
        - Desktop: Elegant centered flex container with 3 cards side-by-side.
        - Single active video: only 1 video plays at a time.
      */}
      <div className="w-full flex items-center justify-start sm:justify-center gap-4 sm:gap-6 overflow-x-auto sm:overflow-visible pb-4 pt-1 snap-x snap-mandatory scrollbar-none px-5 sm:px-0 touch-pan-x">
        {displayReels.map((reel) => (
          <div
            key={reel.id}
            data-reel-card
            className="w-[66vw] max-w-[215px] min-w-[190px] sm:w-[220px] lg:w-[235px] aspect-[9/16] shrink-0 rounded-2xl overflow-hidden shadow-soft border border-[#e5d8c6] bg-black relative snap-center transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
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
        {/* Trailing spacer for mobile padding at the end of scroll */}
        <div className="w-2 shrink-0 sm:hidden" aria-hidden="true" />
      </div>
    </div>
  );
}
