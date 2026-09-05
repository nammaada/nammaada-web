"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Volume2, VolumeX, Maximize2 } from "lucide-react";

export function ReelCardPlayer({
  src,
  title,
  instagramUrl,
  className = "",
}: {
  src: string;
  title?: string;
  instagramUrl?: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const targetInstagramUrl = instagramUrl || "https://www.instagram.com/namma_ada/";

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay fallback: retry muted if browser policy blocked unmuted
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current
              .play()
              .then(() => setIsPlaying(true))
              .catch(() => {});
          }
        });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      // Return to thumbnail frame
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
      // Reset mute to true so future preview starts muted by default
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleCardClick = () => {
    window.open(targetInstagramUrl, "_blank", "noopener,noreferrer");
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      if (video.requestFullscreen) {
        video.requestFullscreen().catch(() => {});
      } else if ((video as unknown as { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
        (video as unknown as { webkitRequestFullscreen: () => void }).webkitRequestFullscreen();
      }
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      className={`group relative cursor-pointer overflow-hidden select-none ${className}`}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={title ? `${title} (Opens Instagram Reel in a new tab)` : "Watch Instagram Reel (Opens in a new tab)"}
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

      {/* Hover Controls (top right): Fullscreen & Mute/Unmute */}
      <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-2">
        {/* Fullscreen button on hover */}
        <button
          type="button"
          aria-label="View fullscreen"
          title="Fullscreen"
          onClick={handleFullscreen}
          className={`flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition-all duration-200 hover:bg-black/80 hover:scale-105 active:scale-95 shadow-md cursor-pointer ${
            isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
          }`}
        >
          <Maximize2 size={15} />
        </button>

        {/* Mute/unmute button shown when playing */}
        {isPlaying && (
          <button
            type="button"
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            title={isMuted ? "Unmute" : "Mute"}
            onClick={handleToggleMute}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition-all duration-200 hover:bg-black/80 hover:scale-105 active:scale-95 shadow-md cursor-pointer animate-in fade-in zoom-in-90 duration-150"
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        )}
      </div>

      {/* Play indicator overlay visible when not playing */}
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
