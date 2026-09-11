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
}: {
  src?: string;
  youtubeUrl?: string;
  youtubeId?: string;
  title?: string;
  instagramUrl?: string;
  className?: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [hasStarted, setHasStarted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

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

  // On desktop hover: start playing video
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!hasStarted) {
      setHasStarted(true);
    } else {
      postToYouTube("playVideo");
    }

    if (isDirectVideo && videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(() => {});
    }
  };

  // On desktop leave: pause video
  const handleMouseLeave = () => {
    setIsHovered(false);
    postToYouTube("pauseVideo");

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
    postToYouTube(nextMuted ? "mute" : "unMute");

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
        - When not hovered (or on initial load / mobile):
          Displays the clean uncropped high-res video frame.
          Zero YouTube branding, avatar, logo, title, or controls!
        - When hovered on desktop:
          Seamlessly reveals and plays the video.
        - When mouse leaves:
          Immediately pauses the video.
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
        <div className="absolute inset-0 h-full w-full overflow-hidden bg-black pointer-events-none">
          {/* YouTube Iframe: mounted on hover, plays on hover, pauses on leave */}
          {hasStarted && (
            <iframe
              ref={iframeRef}
              src={getYouTubeEmbedUrl(ytId, {
                autoplay: true,
                mute: isMuted,
                loop: true,
                controls: false,
              })}
              title={title || "From our kitchen video"}
              className={`h-full w-full border-0 object-cover pointer-events-none transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              tabIndex={-1}
            />
          )}

          {/* Clean paused poster: shown when not hovered and on initial load / mobile */}
          {(!hasStarted || !isHovered) && thumbnailSrc && (
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

      {/* Subtle gentle bottom gradient for depth */}
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

      {/* Minimal custom Play indicator: visible when paused, fades out when playing */}
      <div
        className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          isHovered ? "opacity-0 pointer-events-none" : "opacity-100 bg-black/15"
        }`}
      >
        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-black/65 backdrop-blur-xs border border-white/30 text-white shadow-xl transition-all duration-300 group-hover:scale-110">
          <Play size={20} className="translate-x-0.5 fill-white sm:size-5" />
        </div>
      </div>
    </div>
  );
}
