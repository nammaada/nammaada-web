"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/youtube";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const isTouchRef = useRef(false);

  const [hasMounted, setHasMounted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const targetInstagramUrl = instagramUrl || "https://www.instagram.com/namma_ada/";
  const ytId = youtubeId || extractYouTubeId(youtubeUrl || src || "");
  const isDirectVideo = Boolean(src && !src.includes("youtube") && !src.includes("youtu.be") && !ytId);

  // Progressive thumbnail fallback for clean paused poster (maxres -> hq)
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

  const postToYouTube = (func: string, args: unknown[] = []) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func, args }),
        "*"
      );
    }
  };

  // Sync playback with single active card state
  useEffect(() => {
    if (isActive) {
      setHasMounted(true);
      setIsMuted(false);
      postToYouTube("unMute");
      postToYouTube("setVolume", [100]);
      postToYouTube("playVideo");

      if (isDirectVideo && videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.play().catch(() => {});
      }
    } else {
      setIsMuted(true);
      postToYouTube("pauseVideo");
      postToYouTube("mute");

      if (isDirectVideo && videoRef.current) {
        videoRef.current.muted = true;
        videoRef.current.pause();
      }
    }
  }, [isActive, isDirectVideo]);

  // Touch detection for mobile
  const handleTouchStart = () => {
    isTouchRef.current = true;
  };

  // Desktop hover interaction:
  // When hover -> play video with audio (unmuted)!
  const handleMouseEnter = () => {
    if (isTouchRef.current) return;
    setHasMounted(true);
    setIsMuted(false);
    onActivate?.();
    postToYouTube("unMute");
    postToYouTube("setVolume", [100]);
    postToYouTube("playVideo");

    if (isDirectVideo && videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {});
    }
  };

  // When mouse leaves ("take the hover") -> STOP the video immediately!
  const handleMouseLeave = () => {
    if (isTouchRef.current) return;
    onDeactivate?.();
    setIsMuted(true);
    postToYouTube("pauseVideo");
    postToYouTube("mute");

    if (isDirectVideo && videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.pause();
    }
  };

  // Click / Tap behavior:
  // - Desktop: click opens configured Instagram Post URL in a new tab
  // - Mobile: first tap plays video with audio; tapping while playing opens Instagram Post URL
  const handleCardClick = () => {
    if (isTouchRef.current) {
      if (!isActive) {
        setHasMounted(true);
        setIsMuted(false);
        onActivate?.();
        postToYouTube("unMute");
        postToYouTube("setVolume", [100]);
        postToYouTube("playVideo");
        if (isDirectVideo && videoRef.current) {
          videoRef.current.muted = false;
          videoRef.current.play().catch(() => {});
        }
      } else {
        window.open(targetInstagramUrl, "_blank", "noopener,noreferrer");
      }
      setTimeout(() => {
        isTouchRef.current = false;
      }, 500);
      return;
    }

    // Desktop click opens Instagram
    window.open(targetInstagramUrl, "_blank", "noopener,noreferrer");
  };

  // Toggle Mute / Unmute
  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (nextMuted) {
      postToYouTube("mute");
    } else {
      postToYouTube("unMute");
      postToYouTube("setVolume", [100]);
    }

    if (isDirectVideo && videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
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
      aria-label={title ? `${title} (Opens Instagram in a new tab)` : "Watch Instagram Reel"}
    >
      {/* 
        CLEAN VIDEO PLAYER:
        - Only ONE video plays at a time.
        - Desktop: Hover plays with audio (unmuted). Mouse leave stops video completely.
        - Mobile: Tap plays with audio. Tap while playing opens Instagram.
        - Top mute/unmute button available to toggle audio.
        - pointer-events-none ensures card clicks open Instagram.
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
      ) : ytId ? (
        <div className="relative h-full w-full bg-black overflow-hidden pointer-events-none">
          {/* YouTube Iframe: only visible and playing when isActive */}
          {hasMounted && (
            <iframe
              ref={iframeRef}
              src={getYouTubeEmbedUrl(ytId, {
                autoplay: true,
                mute: false,
                loop: true,
                controls: false,
              })}
              title={title || "From our kitchen video"}
              className={`h-full w-full border-0 object-cover pointer-events-none transition-opacity duration-200 ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              tabIndex={-1}
              loading="eager"
              onLoad={() => {
                if (isActive) {
                  postToYouTube("unMute");
                  postToYouTube("setVolume", [100]);
                  postToYouTube("playVideo");
                }
              }}
            />
          )}

          {/* Clean paused poster: shown whenever card is not active */}
          {(!hasMounted || !isActive) && thumbnailSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnailSrc}
              alt={title || "From our kitchen video"}
              className="absolute inset-0 h-full w-full object-cover pointer-events-none"
              onError={handleThumbnailError}
              onLoad={handleThumbnailLoad}
              loading="eager"
            />
          )}
        </div>
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-zinc-900 text-zinc-600 text-xs">
          Video content unavailable
        </div>
      )}

      {/* Subtle bottom gradient */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />

      {/* Top Mute/Unmute Button (Desktop & Mobile) */}
      <button
        type="button"
        onClick={handleToggleMute}
        className="absolute top-3 right-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-xs border border-white/20 text-white/90 transition-all hover:bg-black/85 hover:scale-105 active:scale-95 shadow-md cursor-pointer pointer-events-auto"
        aria-label={isMuted ? "Unmute video" : "Mute video"}
        title={isMuted ? "Unmute video" : "Mute video"}
      >
        {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
      </button>

      {/* Clean centered Play icon shown when video is paused/inactive */}
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
