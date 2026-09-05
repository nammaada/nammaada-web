"use client";

import { useRef, useState } from "react";
import { Play } from "lucide-react";

export function ReelCardPlayer({
  src,
  title,
  className = "",
}: {
  src: string;
  title?: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Handled safely if autoplay policy triggers
        });
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleTogglePlay}
      className={`group relative cursor-pointer overflow-hidden select-none ${className}`}
    >
      <video
        ref={videoRef}
        loop
        muted
        playsInline
        preload="metadata"
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        src={src}
        title={title}
      />

      {/* Play indicator overlay visible when not hovered / not playing */}
      <div
        className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-all duration-200 ${
          isPlaying ? "bg-transparent opacity-0" : "bg-black/25 opacity-100"
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur-xs transition-transform duration-200 group-hover:scale-110">
          <Play size={20} className="translate-x-0.5 fill-white" />
        </div>
      </div>
    </div>
  );
}
