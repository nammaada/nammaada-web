"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, ArrowUpRight } from "lucide-react";
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/youtube";

function InstagramIcon({ className = "size-3" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

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
  const [isPlaying, setIsPlaying] = useState(false);

  const targetInstagramUrl = instagramUrl || "https://www.instagram.com/namma_ada/";
  const ytId = youtubeId || extractYouTubeId(youtubeUrl || src || "");

  const handleCardClick = () => {
    window.open(targetInstagramUrl, "_blank", "noopener,noreferrer");
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative cursor-pointer overflow-hidden select-none bg-black ${className}`}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={title ? `${title} (Opens Instagram post in a new tab)` : "Watch Instagram Reel (Opens in a new tab)"}
    >
      {/* Playing state: YouTube iframe embed */}
      {isPlaying && ytId ? (
        <div className="relative h-full w-full bg-black">
          <iframe
            src={getYouTubeEmbedUrl(ytId, true)}
            title={title || "YouTube video player"}
            className="h-full w-full border-0 pointer-events-auto"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          {/* Floating Instagram link button so user can still open post */}
          <button
            type="button"
            onClick={handleCardClick}
            className="absolute top-2.5 right-2.5 z-30 inline-flex items-center gap-1 rounded-full bg-black/75 px-2.5 py-1 text-[10px] font-semibold text-white/95 backdrop-blur-xs border border-white/20 hover:bg-black transition-all cursor-pointer shadow-md"
            title="Open original Instagram post"
          >
            <InstagramIcon className="size-3 text-[#ffcdd2]" />
            <span>Instagram</span>
            <ArrowUpRight size={10} className="text-white/80" />
          </button>
        </div>
      ) : isPlaying && src && !src.includes("youtube") ? (
        <video
          autoPlay
          controls
          loop
          playsInline
          className="h-full w-full object-cover"
          src={src}
          title={title}
        />
      ) : (
        /* Idle / Cover State */
        <div className="relative h-full w-full">
          {ytId ? (
            <Image
              src={getYouTubeThumbnailUrl(ytId)}
              alt={title || "Instagram reel video preview"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
          ) : src ? (
            <video
              preload="metadata"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              src={src}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-zinc-900 text-zinc-500 text-xs font-medium">
              Preview
            </div>
          )}

          {/* Vignette / Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40 transition-opacity group-hover:opacity-85" />

          {/* Instagram Badge (Top Right) */}
          <div className="absolute top-3 right-3 z-20 pointer-events-none">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-xs border border-white/15 shadow-sm">
              <InstagramIcon className="size-3" />
              <span>Instagram</span>
              <ArrowUpRight size={10} className="text-white/70" />
            </span>
          </div>

          {/* Centered Play Button */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <button
              type="button"
              onClick={handlePlayClick}
              aria-label="Play video"
              className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-black/70 border border-white/25 text-white shadow-xl transition-all duration-200 group-hover:scale-110 hover:bg-black/90 active:scale-95 cursor-pointer"
            >
              <Play size={20} className="translate-x-0.5 fill-white sm:size-6" />
            </button>
          </div>

          {/* Bottom Title / Description overlay */}
          {title && (
            <div className="absolute bottom-3 inset-x-3 z-20 pointer-events-none">
              <p className="text-[11px] sm:text-xs font-medium text-white/95 line-clamp-2 drop-shadow-md text-left leading-tight">
                {title}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
