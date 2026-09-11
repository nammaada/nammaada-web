"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Play } from "lucide-react";
import {
  extractYouTubeId,
  getYouTubeThumbnailUrl,
  loadYouTubeIFrameAPI,
} from "@/lib/youtube";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const isInitializingRef = useRef<boolean>(false);
  const isReadyRef = useRef<boolean>(false);
  const shouldPlayRef = useRef<boolean>(false);
  const isTouchRef = useRef<boolean>(false);

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

  // Safely trigger playback with browser autoplay policy handling
  const safePlay = useCallback((player: any) => {
    if (!player) return;
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

  // Sync playback state with isActive prop
  useEffect(() => {
    shouldPlayRef.current = Boolean(isActive);

    if (isActive) {
      if (!isPlayerMounted) {
        setIsPlayerMounted(true);
        return;
      }

      if (playerRef.current && isReadyRef.current) {
        safePlay(playerRef.current);
      }
    } else {
      if (playerRef.current && isReadyRef.current) {
        try {
          playerRef.current.pauseVideo();
        } catch {}
      }
      setIsPlaying(false);
    }
  }, [isActive, isPlayerMounted, safePlay]);

  // Initialize single YouTube player instance when mounted
  useEffect(() => {
    if (!isPlayerMounted || !ytId || playerRef.current || isInitializingRef.current) {
      return;
    }

    let isCancelled = false;
    isInitializingRef.current = true;

    loadYouTubeIFrameAPI().then(() => {
      if (isCancelled || !containerRef.current || playerRef.current) {
        isInitializingRef.current = false;
        return;
      }

      // Create a dedicated mount point for YT.Player
      containerRef.current.innerHTML = "";
      const mountDiv = document.createElement("div");
      mountDiv.style.width = "100%";
      mountDiv.style.height = "100%";
      containerRef.current.appendChild(mountDiv);

      try {
        const player = new window.YT!.Player(mountDiv, {
          videoId: ytId,
          playerVars: {
            controls: 0,
            rel: 0,
            playsinline: 1,
            enablejsapi: 1,
            autoplay: 0,
            iv_load_policy: 3,
            disablekb: 1,
            fs: 0,
            loop: 1,
            playlist: ytId,
            origin: typeof window !== "undefined" ? window.location.origin : undefined,
          },
          events: {
            onReady: (event: any) => {
              if (isCancelled) {
                try {
                  event.target.destroy();
                } catch {}
                return;
              }
              isReadyRef.current = true;
              isInitializingRef.current = false;

              // Only play if this card is still marked as active
              if (shouldPlayRef.current) {
                safePlay(event.target);
              } else {
                try {
                  event.target.pauseVideo();
                } catch {}
              }
            },
            onStateChange: (event: any) => {
              if (isCancelled) return;
              // YT.PlayerState: PLAYING = 1, PAUSED = 2, ENDED = 0
              if (event.data === 1) {
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

        playerRef.current = player;
      } catch {
        isInitializingRef.current = false;
      }
    });

    return () => {
      isCancelled = true;
      isInitializingRef.current = false;
    };
  }, [isPlayerMounted, ytId, safePlay]);

  // Clean up player on unmount or video ID change
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
      isReadyRef.current = false;
      isInitializingRef.current = false;
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [ytId]);

  // Touch handling for mobile
  const handleTouchStart = () => {
    isTouchRef.current = true;
  };

  // Desktop hover-to-play:
  // Mouse enter starts playback using the SINGLE player instance
  const handleMouseEnter = () => {
    if (isTouchRef.current) return;
    onActivate?.();
  };

  // Mouse leave pauses playback immediately
  const handleMouseLeave = () => {
    if (isTouchRef.current) return;
    onDeactivate?.();
  };

  // Card click / tap handler:
  // - Desktop: opens configured Instagram Post URL in a new tab
  // - Mobile: opens Instagram URL normally without starting duplicate players
  const handleCardClick = () => {
    if (isTouchRef.current) {
      // Mobile tap opens Instagram directly
      window.location.href = targetInstagramUrl;
      setTimeout(() => {
        isTouchRef.current = false;
      }, 500);
      return;
    }

    // Desktop click opens in new tab
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
          {/* YouTube Player Container: mounted on interaction, full 9:16 aspect ratio preserved */}
          <div
            ref={containerRef}
            className={`absolute inset-0 h-full w-full transition-opacity duration-300 pointer-events-none [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0 [&>iframe]:object-cover ${
              isPlaying ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Clean Custom Preview Layer: YouTube thumbnail before playback */}
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
