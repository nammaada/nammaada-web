"use client";

import { useState, useCallback } from "react";
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
  const total = displayReels.length;

  const handleActivate = useCallback((id: string) => {
    setActiveReelId(id);
  }, []);

  const handleDeactivate = useCallback((id: string) => {
    setActiveReelId((curr) => (curr === id ? null : curr));
  }, []);

  if (total === 0) return null;

  return (
    <div className="w-full my-6">
      {/* 
        Single unified responsive container:
        - Exactly ONE instance per card in the DOM (maximum 3 cards total, no duplicate mobile/desktop DOM nodes)
        - Desktop: centered flex row, 3 cards side-by-side with smooth hover behavior
        - Mobile: horizontal scroll strip with snap-centering, balanced px-5 padding, no horizontal overflow
      */}
      <div className="w-full flex items-center justify-start sm:justify-center gap-4 sm:gap-6 overflow-x-auto sm:overflow-visible pb-4 pt-1 snap-x snap-mandatory scrollbar-none px-5 sm:px-0 touch-pan-x">
        {displayReels.map((reel) => (
          <div
            key={reel.id}
            data-reel-card
            className="w-[66vw] max-w-[215px] min-w-[190px] sm:w-[220px] lg:w-[235px] aspect-[9/16] shrink-0 rounded-2xl overflow-hidden shadow-soft border border-[#e5d8c6] bg-black relative snap-center transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            <ReelCardPlayer
              youtubeUrl={reel.youtube_url || reel.video_url}
              youtubeId={reel.youtube_id}
              title={reel.alt_text}
              instagramUrl={reel.instagram_url || fallbackInstagramUrl}
              className="h-full w-full"
              isActive={activeReelId === reel.id}
              onActivate={() => handleActivate(reel.id)}
              onDeactivate={() => handleDeactivate(reel.id)}
            />
          </div>
        ))}
        {/* Spacer for comfortable right-edge padding on mobile */}
        <div className="w-2 shrink-0 sm:hidden" aria-hidden="true" />
      </div>
    </div>
  );
}
