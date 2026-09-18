"use client";

import { useState, useEffect, useRef } from "react";
import { Play, ArrowUpRight } from "lucide-react";
import {
  extractYouTubeId,
  getYouTubeThumbnailUrl,
  getYouTubeEmbedUrl,
  preloadYouTubeConnection,
} from "@/lib/youtube";

function InstagramIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
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
  isActive = false,
  onActivate,
  onDeactivate,
}: {
  src?: string;
  youtubeUrl?: string;
  youtubeId?: string;
  title?: string;
  instagramUrl?: string;
  className?: string;
  isActive?: boolean;
  onActivate?: () => void;
  onDeactivate?: () => void;
}) {
  const targetInstagramUrl = instagramUrl || "https://www.instagram.com/namma_ada/";
  const ytId = youtubeId || extractYouTubeId(youtubeUrl || src || "");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isIframeLoading, setIsIframeLoading] = useState(false);

  // Progressive thumbnail fallback: maxresdefault -> hqdefault
  const [thumbnailSrc, setThumbnailSrc] = useState<string>(() =>
    ytId ? getYouTubeThumbnailUrl(ytId, "maxres") : ""
  );

  useEffect(() => {
    preloadYouTubeConnection();
    return () => {
      // Ensure iframe is completely stopped on component unmount
      if (iframeRef.current) {
        try {
          iframeRef.current.contentWindow?.postMessage(
            '{"event":"command","func":"stopVideo","args":""}',
            "*"
          );
          iframeRef.current.src = "about:blank";
        } catch {}
      }
    };
  }, []);

  useEffect(() => {
    if (ytId) {
      setThumbnailSrc(getYouTubeThumbnailUrl(ytId, "maxres"));
    }
  }, [ytId]);

  useEffect(() => {
    if (isActive) {
      setIsIframeLoading(true);
    } else {
      setIsIframeLoading(false);
      if (iframeRef.current) {
        try {
          iframeRef.current.contentWindow?.postMessage(
            '{"event":"command","func":"stopVideo","args":""}',
            "*"
          );
          iframeRef.current.src = "about:blank";
        } catch {}
      }
    }
  }, [isActive]);

  const handleThumbnailError = () => {
    if (ytId && thumbnailSrc.includes("maxresdefault")) {
      setThumbnailSrc(getYouTubeThumbnailUrl(ytId, "hq"));
    }
  };

  const handleThumbnailLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    // YouTube returns a 120x90 image if maxresdefault is not available
    if (img.naturalWidth <= 120 && ytId && !thumbnailSrc.includes("hqdefault")) {
      setThumbnailSrc(getYouTubeThumbnailUrl(ytId, "hq"));
    }
  };

  // Click on card / play button toggles playback
  const handleCardClick = () => {
    if (!ytId) return;
    if (!isActive) {
      onActivate?.();
    } else {
      onDeactivate?.();
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative h-full w-full cursor-pointer overflow-hidden select-none bg-black ${className}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={title ? `${title} (Play video)` : "Play YouTube video"}
    >
      {ytId ? (
        <div className="relative h-full w-full bg-black overflow-hidden">
          {/*
            FAST LAZY-LOADED YOUTUBE IFRAME:
            - Rendered when user clicks Play (isActive === true)
            - Shows subtle loading spinner until iframe DOM finishes loading
            - Terminated and stopped completely when deactivated or page navigated
          */}
          {isActive ? (
            <>
              {isIframeLoading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-xs">
                  <div className="size-8 rounded-full border-2 border-white/20 border-t-white animate-spin mb-2" />
                  <span className="text-[10px] font-medium text-white/75">Loading video...</span>
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={getYouTubeEmbedUrl(ytId, {
                  autoplay: true,
                  playsinline: true,
                  controls: true,
                })}
                onLoad={() => setIsIframeLoading(false)}
                title={title || "From our kitchen video"}
                className="absolute inset-0 h-full w-full border-0 object-cover"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="eager"
              />
            </>
          ) : (
            /* Lightweight Thumbnail Layer: Initially rendered without YouTube JS/iframe */
            thumbnailSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnailSrc}
                alt={title || "From our kitchen video"}
                className="absolute inset-0 h-full w-full object-cover pointer-events-none transition-transform duration-300 group-hover:scale-105"
                onError={handleThumbnailError}
                onLoad={handleThumbnailLoad}
                loading="lazy"
                decoding="async"
              />
            )
          )}
        </div>
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-zinc-900 text-zinc-500 text-xs">
          Video content unavailable
        </div>
      )}

      {/* Subtle bottom gradient (visible when not playing) */}
      {!isActive && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
      )}

      {/* Instagram button: opens Instagram directly without triggering playback */}
      <a
        href={targetInstagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="absolute top-3 right-3 z-30 flex items-center gap-1.5 rounded-full bg-black/75 backdrop-blur-md px-2.5 py-1 border border-white/30 text-white shadow-lg pointer-events-auto transition-transform active:scale-90 hover:bg-black/90 cursor-pointer"
        aria-label="Open on Instagram"
        title="Open on Instagram"
      >
        <InstagramIcon className="size-3 text-pink-400 shrink-0" />
        <span className="text-[10px] font-semibold text-white/90">Instagram</span>
        <ArrowUpRight size={10} className="text-white/60 -ml-0.5" />
      </a>

      {/* Clean centered Play icon: shown only before video starts playing */}
      {!isActive && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/15 transition-opacity duration-200">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-black/65 backdrop-blur-xs border border-white/30 text-white shadow-xl transition-all duration-200 group-hover:scale-110">
            <Play size={20} className="translate-x-0.5 fill-white sm:size-5" />
          </div>
        </div>
      )}
    </div>
  );
}
