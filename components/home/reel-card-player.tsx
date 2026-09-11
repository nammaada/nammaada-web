"use client";

import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { extractYouTubeId, getYouTubeEmbedUrl } from "@/lib/youtube";

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
  const [isMuted, setIsMuted] = useState(true);

  const targetInstagramUrl = instagramUrl || "https://www.instagram.com/namma_ada/";
  const ytId = youtubeId || extractYouTubeId(youtubeUrl || src || "");
  const isDirectVideo = Boolean(src && !src.includes("youtube") && !src.includes("youtu.be") && !ytId);

  const postToYouTube = (func: string, args: unknown[] = []) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func, args }),
        "*"
      );
    }
  };

  // Click card -> Always open configured Instagram Post URL in a new tab (never open YouTube)
  const handleCardClick = () => {
    window.open(targetInstagramUrl, "_blank", "noopener,noreferrer");
  };

  // Custom Mute / Unmute toggle for both desktop and mobile
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
        OFFICIAL YOUTUBE PLAYER EMBED:
        - Configured with official YouTube IFrame API parameters for cleanest presentation:
          autoplay=1, mute=1, controls=0, loop=1, rel=0, modestbranding=1, iv_load_policy=3, playsinline=1
        - Autoplays automatically on page load when visible (no hover-to-play requirement).
        - Full uncropped original video frame preserved with existing dimensions.
        - pointer-events-none prevents clicks on YouTube UI so all clicks open Instagram.
      */}
      {isDirectVideo ? (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="h-full w-full object-cover pointer-events-none"
          src={src}
        />
      ) : ytId ? (
        <div className="relative h-full w-full bg-black overflow-hidden pointer-events-none">
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
        </div>
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-zinc-900 text-zinc-600 text-xs">
          Video content unavailable
        </div>
      )}

      {/* Subtle gentle bottom gradient for card depth while keeping full video visible */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />

      {/* Small custom Mute/Unmute control (desktop & mobile) */}
      <button
        type="button"
        onClick={handleToggleMute}
        className="absolute top-3 right-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-xs border border-white/20 text-white/90 transition-all hover:bg-black/85 hover:scale-105 active:scale-95 shadow-md cursor-pointer pointer-events-auto"
        aria-label={isMuted ? "Unmute video" : "Mute video"}
        title={isMuted ? "Unmute video" : "Mute video"}
      >
        {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
      </button>
    </div>
  );
}
