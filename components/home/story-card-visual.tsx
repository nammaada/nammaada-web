"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { WhoWeAreImage } from "@/lib/storefront/content";

export function StoryCardVisual({ images }: { images: WhoWeAreImage[] }) {
  const [activeIndex, setActiveIndex] = useState(() => {
    const primaryIdx = images.findIndex((img) => img.is_primary);
    return primaryIdx >= 0 ? primaryIdx : 0;
  });

  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  // Auto-cycle through images with faster, smoother timing (3000ms)
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (Math.abs(touchDeltaX.current) > 35) {
      if (touchDeltaX.current < 0) {
        // swipe left -> next
        setActiveIndex((prev) => (prev + 1) % images.length);
      } else {
        // swipe right -> previous
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    }
    touchStartX.current = 0;
    touchDeltaX.current = 0;
  };

  if (images.length === 0) {
    return (
      <div className="relative w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[340px] aspect-[4/5] sm:aspect-[3/4] overflow-hidden rounded-3xl sm:rounded-[2rem] border border-white/80 bg-gradient-to-br from-white/75 via-[#f9f3ea]/65 to-[#f2e6d6]/65 p-6 backdrop-blur-xl shadow-lg flex flex-col items-center justify-between">
        <div className="relative flex flex-1 items-center justify-center">
          <div className="relative flex h-40 w-40 items-center justify-center rotate-45 rounded-[2rem] border border-white/95 bg-white/85 shadow-md">
            <div className="h-20 w-20 rounded-2xl border border-amber-300/40 bg-gradient-to-br from-[#dfbe96]/45 via-[#d4af37]/25 to-[#c99863]/35" />
          </div>
        </div>
        <p className="font-display text-lg font-normal text-[#711e2c] text-center">
          From our kitchen to your<br />table.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Product image slider frame with smooth transform */}
      <div
        className="relative w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[340px] aspect-[4/5] sm:aspect-[3/4] rounded-3xl sm:rounded-[2rem] overflow-hidden shadow-2xl shadow-[#2b1719]/12 select-none touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full w-full transition-transform duration-350 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {images.map((img, idx) => (
            <div key={img.id} className="relative h-full w-full shrink-0">
              <Image
                src={img.secure_url}
                alt={img.alt_text || "Namma Ada Kerala Delicacy"}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 340px"
                className="object-cover object-center pointer-events-none"
                priority={idx === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Slider dots if multiple images */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {images.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`View image ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === activeIndex
                  ? "w-5 h-1.5 bg-[#711e2c] shadow-xs"
                  : "w-1.5 h-1.5 bg-[#711e2c]/30 hover:bg-[#711e2c]/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
