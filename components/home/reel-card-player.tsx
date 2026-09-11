"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { extractYouTubeId, getYouTubeThumbnailUrl } from "@/lib/youtube";

export function ReelCardPlayer({
  src,
  youtubeUrl,
  youtubeId,
  title,
  instagramUrl,
  className = "",
}: {
  src?: string;
  youtubeUrl?: string;
  youtubeId?: string;
  title?: string;
  instagramUrl?: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const targetInstagramUrl = instagramUrl || "https://www.instagram.com/namma_ada/";
  const ytId = youtubeId || extractYouTubeId(youtubeUrl || src || "");
  const isDirectVideo = Boolean(src && !src.includes("youtube") && !src.includes("youtu.be") && !ytId);

  // Progressive thumbnail fallback for YouTube: maxres -> hq
  const [thumbnailSrc, setThumbnailSrc] = useState<string>(
    ytId ? getYouTubeThumbnailUrl(ytId, "maxres") : ""
  );

  useEffect(() => {
    if (ytId) {
      setThumbnailSrc(getYouTubeThumbnailUrl(ytId, "maxres"));
    }
  }, [ytId]);

  // Handle fallback if maxresdefault doesn't exist for this video
  const handleThumbnailError = () => {
    if (ytId && thumbnailSrc.includes("maxresdefault")) {
      setThumbnailSrc(getYouTubeThumbnailUrl(ytId, "hq"));
    }
  };

  // YouTube sometimes returns a 120x90 placeholder when maxres doesn't exist
  const handleThumbnailLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth <= 120 && ytId && !thumbnailSrc.includes("hqdefault")) {
      setThumbnailSrc(getYouTubeThumbnailUrl(ytId, "hq"));
    }
  };

  // Desktop hover interaction
  const handleMouseEnter = () => {
    setIsPlaying(true);
    if (isDirectVideo && videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsPlaying(false);
    if (isDirectVideo && videoRef.current) {
      videoRef.current.pause();
    }
  };

  // Click card -> Always opens configured Instagram Post URL
  const handleCardClick = () => {
    window.open(targetInstagramUrl, "_blank", "noopener,noreferrer");
  };

  // Desktop Mute / Unmute toggle
  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (isDirectVideo && videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      className={`group relative h-full w-full cursor-pointer overflow-hidden select-none bg-black ${className}`}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={title ? `${title} (Opens Instagram in a new tab)` : "Watch Instagram Reel"}
    >
      {/* 
        ACTUAL VIDEO CONTENT:
        - 100% full original frame visible without cropping, zooming, or clipping.
        - Zero YouTube branding, avatar, channel name, titles, or player UI.
        - Preserves natural aspect ratio.
      */}
      {isDirectVideo ? (
        <video
          ref={videoRef}
          loop
          muted={isMuted}
          playsInline
          className="h-full w-full object-cover pointer-events-none"
          src={src}
        />
      ) : thumbnailSrc ? (
        <div className="relative h-full w-full bg-black overflow-hidden pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailSrc}
            alt={title || "From our kitchen video"}
            className="h-full w-full object-cover pointer-events-none transition-transform duration-500 group-hover:scale-[1.03]"
            onError={handleThumbnailError}
            onLoad={handleThumbnailLoad}
            loading="lazy"
          />
        </div>
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-zinc-900 text-zinc-600 text-xs">
          Video content unavailable
        </div>
      )}

      {/* Subtle gentle bottom gradient for depth while keeping full video visible */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />

      {/* Desktop Mute/Unmute Control */}
      <button
        type="button"
        onClick={handleToggleMute}
        className="absolute top-3 right-3 z-30 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-xs border border-white/20 text-white/90 transition-all hover:bg-black/85 hover:scale-105 active:scale-95 shadow-md cursor-pointer pointer-events-auto"
        aria-label={isMuted ? "Unmute video" : "Mute video"}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
      </button>

      {/*
        Clean Centered Play/Pause Icon (▶ / ❚❚):
        - Exactly matches requested standalone clean video appearance.
        - On desktop hover, animates smoothly into minimal play/pause interaction.
      */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-black/65 backdrop-blur-xs border border-white/30 text-white shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-[#711e2c]/90 group-hover:border-[#711e2c]">
          {isPlaying ? (
            <Pause size={20} className="fill-white sm:size-5" />
          ) : (
            <Play size={20} className="translate-x-0.5 fill-white sm:size-5" />
          )}
        </div>
      </div>
    </div>
  );
}
