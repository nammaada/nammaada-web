"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { WhoWeAreImage } from "@/lib/storefront/content";

export function StoryCardVisual({ images }: { images: WhoWeAreImage[] }) {
  const [activeIndex, setActiveIndex] = useState(() => {
    const primaryIdx = images.findIndex((img) => img.is_primary);
    return primaryIdx >= 0 ? primaryIdx : 0;
  });

  // Auto-cycle through images if multiple
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) {
    // Default abstract diamond artwork when no custom image uploaded
    return (
      <div className="relative w-full max-w-md aspect-[4/3.2] min-h-[340px] overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-white/75 via-[#f9f3ea]/65 to-[#f2e6d6]/65 p-8 backdrop-blur-xl shadow-lg flex flex-col items-center justify-between">
        <div className="relative flex flex-1 items-center justify-center">
          <div className="relative flex h-40 w-40 items-center justify-center rotate-45 rounded-[2rem] border border-white/95 bg-white/85 shadow-md">
            <div className="h-20 w-20 rounded-2xl border border-amber-300/40 bg-gradient-to-br from-[#dfbe96]/45 via-[#d4af37]/25 to-[#c99863]/35" />
          </div>
        </div>
        <p className="font-display text-xl font-normal text-[#4a0e17] text-center">
          From our kitchen to your<br />table.
        </p>
      </div>
    );
  }

  const activeImage = images[activeIndex] || images[0];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Large, clean, standalone image with proper aspect ratio and no cropping */}
      <div className="relative w-full max-w-lg aspect-[4/3.2] rounded-3xl overflow-hidden shadow-xl shadow-amber-950/10 bg-[#fbf7f0] border border-[#e8ded1]/80">
        <Image
          key={activeImage.id}
          src={activeImage.secure_url}
          alt={activeImage.alt_text || "Namma Ada Kerala Delicacy"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 540px"
          className="object-contain p-2.5 transition-opacity duration-500"
          priority
        />
      </div>

      {/* Slider dots if multiple images */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {images.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`View image ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === activeIndex
                  ? "w-6 h-2 bg-[#4a0e17] shadow-xs"
                  : "w-2 h-2 bg-[#4a0e17]/25 hover:bg-[#4a0e17]/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
