"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Play, ArrowUpRight } from "lucide-react";
import {
  extractYouTubeId,
  getYouTubeThumbnailUrl,
  loadYouTubeIFrameAPI,
  registerYouTubePlayer,
  unregisterYouTubePlayer,
  pauseAllOtherYouTubePlayers,
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const isInitializingRef = useRef<boolean>(false);
  const isReadyRef = useRef<boolean>(false);
  const isTouchRef = useRef<boolean>(false);
  const isActiveRef = useRef<boolean>(isActive);

  // Persistent unique element ID for this card's iframe
  const playerIdRef = useRef<string>("");
  if (!playerIdRef.current) {
    playerIdRef.current = `yt-player-${Math.random().toString(36).slice(2, 9)}`;
  }

  const [isPlayerMounted, setIsPlayerMounted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const targetInstagramUrl = instagramUrl || "https://www.instagram.com/namma_ada/";
  const ytId = youtubeId || extractYouTubeId(youtubeUrl || src || "");

  // Progressive thumbnail fallback (maxres -> hq)
  const [thumbnailSrc, setThumbnailSrc] = useState<string>(
    ytId ? getYouTubeThumbnailUrl(ytId, "maxres") : ""
  );

  useEffect(() => {
    if (ytId) {
      setThumbnailSrc(getYouTubeThumbnailUrl(ytId, "maxres"));
    }
  }, [ytId]);

  const handleThumbnailError = () => {
    if (ytId && thumbnailSrc.includes("maxresdefault")) {
      setThumbnailSrc(getYouTubeThumbnailUrl(ytId, "hq"));
    }
  };

  const handleThumbnailLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth <= 120 && ytId && !thumbnailSrc.includes("hqdefault")) {
      setThumbnailSrc(getYouTubeThumbnailUrl(ytId, "hq"));
    }
  };

  // Safe playback function that coordinates with all active players
  const startPlayback = useCallback((player: any) => {
    if (!player) return;
    pauseAllOtherYouTubePlayers(player);
    try {
      player.unMute();
      player.setVolume(100);
      player.playVideo();
    } catch {
      try {
        player.mute();
        player.playVideo();
      } catch {}
    }
  }, []);

  // When the React-rendered iframe finishes loading its document, bind the YT.Player instance
  const handleIFrameLoad = useCallback(() => {
    if (playerRef.current || isInitializingRef.current || !iframeRef.current) return;
    isInitializingRef.current = true;

    loadYouTubeIFrameAPI().then(() => {
      if (!iframeRef.current || playerRef.current) {
        isInitializingRef.current = false;
        return;
      }

      try {
        const player = new window.YT!.Player(playerIdRef.current, {
          events: {
            onReady: (event: any) => {
              isReadyRef.current = true;
              isInitializingRef.current = false;
              playerRef.current = event.target;
              registerYouTubePlayer(event.target);

              // Single source of truth: only play if this card is currently active
              if (isActiveRef.current) {
                startPlayback(event.target);
              }
            },
            onStateChange: (event: any) => {
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
              if (event.data === 1) {
                pauseAllOtherYouTubePlayers(event.target);
                setIsPlaying(true);
              } else if (event.data === 2 || event.data === 0) {
                setIsPlaying(false);
              }
            },
            onError: () => {
              isInitializingRef.current = false;
            },
          },
        });
      } catch {
        isInitializingRef.current = false;
      }
    });
  }, [startPlayback]);

  // Sync playback state strictly with isActive prop
  useEffect(() => {
    isActiveRef.current = isActive;

    if (isActive) {
      if (!isPlayerMounted) {
        setIsPlayerMounted(true);
        return;
      }

      if (playerRef.current && isReadyRef.current) {
        startPlayback(playerRef.current);
      }
    } else {
      if (playerRef.current && isReadyRef.current) {
        try {
          playerRef.current.pauseVideo();
        } catch {}
      }
      setIsPlaying(false);
    }
  }, [isActive, isPlayerMounted, startPlayback]);

  // Clean up player on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        unregisterYouTubePlayer(playerRef.current);
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
      isReadyRef.current = false;
      isInitializingRef.current = false;
    };
  }, []);

  // Detect touch interaction
  const handleTouchStart = () => {
    isTouchRef.current = true;
  };

  // Desktop hover-to-play:
  // Strictly ignore on touch devices or if touch occurred
  const handleMouseEnter = () => {
    if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) {
      return;
    }
    if (isTouchRef.current) return;
    onActivate?.();
  };

  // Desktop hover-leave: pauses playback immediately
  const handleMouseLeave = () => {
    if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) {
      return;
    }
    if (isTouchRef.current) return;
    onDeactivate?.();
  };

  // Card click / tap handler:
  // - Mobile / touch: tapping video plays/pauses video; Instagram button on side opens Instagram
  // - Desktop: hover plays; clicking opens Instagram in a new tab
  const handleCardClick = () => {
    const isMobileDevice =
      isTouchRef.current ||
      (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches);

    if (isMobileDevice) {
      if (!isActive) {
        onActivate?.();
      } else {
        onDeactivate?.();
      }
      setTimeout(() => {
        isTouchRef.current = false;
      }, 300);
      return;
    }

    window.open(targetInstagramUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      onTouchStart={handleTouchStart}
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
      aria-label={title ? `${title} (Opens Instagram)` : "Watch Instagram Reel"}
    >
      {ytId ? (
        <div className="relative h-full w-full bg-black overflow-hidden pointer-events-none">
          {/* 
            Single React-Managed YouTube IFrame:
            - Rendered once when active
            - autoplay=0 prevents browser/URL clash
            - Full 9:16 aspect ratio preserved without zoom or crop
          */}
          {isPlayerMounted && (
            <iframe
              ref={iframeRef}
              id={playerIdRef.current}
              src={`https://www.youtube-nocookie.com/embed/${ytId}?enablejsapi=1&autoplay=0&controls=0&rel=0&playsinline=1&iv_load_policy=3&disablekb=1&fs=0`}
              title={title || "From our kitchen video"}
              className={`absolute inset-0 h-full w-full border-0 object-cover pointer-events-none transition-opacity duration-300 ${
                isPlaying ? "opacity-100" : "opacity-0"
              }`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              tabIndex={-1}
              onLoad={handleIFrameLoad}
            />
          )}

          {/* Clean Custom Preview Layer: YouTube thumbnail shown before video is actively playing */}
          {thumbnailSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnailSrc}
              alt={title || "From our kitchen video"}
              className={`absolute inset-0 h-full w-full object-cover pointer-events-none transition-opacity duration-300 ${
                isPlaying ? "opacity-0" : "opacity-100"
              }`}
              onError={handleThumbnailError}
              onLoad={handleThumbnailLoad}
              loading="eager"
            />
          )}
        </div>
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-zinc-900 text-zinc-500 text-xs">
          Video content unavailable
        </div>
      )}

      {/* Subtle bottom gradient */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />

      {/* Mobile-only Instagram button on the side */}
      <a
        href={targetInstagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="sm:hidden absolute top-3 right-3 z-30 flex items-center gap-1.5 rounded-full bg-black/75 backdrop-blur-md px-2.5 py-1 border border-white/30 text-white shadow-lg pointer-events-auto transition-transform active:scale-90 hover:bg-black/90 cursor-pointer"
        aria-label="Open on Instagram"
        title="Open on Instagram"
      >
        <InstagramIcon className="size-3 text-pink-400 shrink-0" />
        <span className="text-[10px] font-semibold text-white/90">Instagram</span>
        <ArrowUpRight size={10} className="text-white/60 -ml-0.5" />
      </a>

      {/* Clean centered Play icon shown when video is not playing */}
      {!isPlaying && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/15 transition-opacity duration-200">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-black/65 backdrop-blur-xs border border-white/30 text-white shadow-xl transition-all duration-200 group-hover:scale-110">
            <Play size={20} className="translate-x-0.5 fill-white sm:size-5" />
          </div>
        </div>
      )}
    </div>
  );
}
