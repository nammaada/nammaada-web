"use client";

import { useRef, useState, useEffect } from "react";
import { Play } from "lucide-react";
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

  const [isPlaying, setIsPlaying] = useState(false);

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

  // When isActive becomes true: start playing
  useEffect(() => {
    if (isActive) {
      setIsPlaying(true);
      postToYouTube("playVideo");
      if (isDirectVideo && videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isActive, isDirectVideo]);

  // Touch detection for mobile
  const handleTouchStart = () => {
    isTouchRef.current = true;
  };

  // Desktop hover interaction: immediately start playing on hover!
  // When mouse leaves: DO NOT PAUSE IT!
  const handleMouseEnter = () => {
    if (isTouchRef.current) return;
    setIsPlaying(true);
    onActivate?.();
    postToYouTube("playVideo");
    if (isDirectVideo && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  // Click / Tap behavior:
  // - Desktop: click opens configured Instagram Post URL in a new tab
  // - Mobile: first tap plays video; tapping while playing opens Instagram Post URL
  const handleCardClick = () => {
    if (isTouchRef.current) {
      if (!isPlaying && !isActive) {
        setIsPlaying(true);
        onActivate?.();
        postToYouTube("playVideo");
        if (isDirectVideo && videoRef.current) {
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

  const showVideo = isPlaying || isActive;

  return (
    <div
      onTouchStart={handleTouchStart}
      onMouseEnter={handleMouseEnter}
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
        - Starts playing immediately on desktop hover.
        - Keeps playing when mouse leaves (does not pause).
        - Cleanest YouTube embed with mute=1 (guarantees no browser autoplay block / no red play button).
        - pointer-events-none ensures card clicks open Instagram.
        - No mute button, no extra controls.
      */}
      {isDirectVideo ? (
        <video
          ref={videoRef}
          loop
          muted
          playsInline
          className="h-full w-full object-cover pointer-events-none"
          src={src}
        />
      ) : ytId ? (
        <div className="relative h-full w-full bg-black overflow-hidden pointer-events-none">
          {/* YouTube Iframe: mounted when played, plays continuously */}
          {showVideo && (
            <iframe
              ref={iframeRef}
              src={getYouTubeEmbedUrl(ytId, {
                autoplay: true,
                mute: true,
                loop: true,
                controls: false,
              })}
              title={title || "From our kitchen video"}
              className="h-full w-full border-0 object-cover pointer-events-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              tabIndex={-1}
              loading="eager"
              onLoad={() => {
                postToYouTube("playVideo");
              }}
            />
          )}

          {/* Clean paused poster: shown only before video starts playing */}
          {!showVideo && thumbnailSrc && (
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

      {/* Clean centered Play icon shown only before video starts playing */}
      {!showVideo && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/15">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-black/65 backdrop-blur-xs border border-white/30 text-white shadow-xl transition-all duration-300 group-hover:scale-110">
            <Play size={20} className="translate-x-0.5 fill-white sm:size-5" />
          </div>
        </div>
      )}
    </div>
  );
}
