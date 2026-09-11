"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const targetInstagramUrl = instagramUrl || "https://www.instagram.com/namma_ada/";
  const ytId = youtubeId || extractYouTubeId(youtubeUrl || src || "");

  // On desktop hover: play and unmute video
  const handleMouseEnter = () => {
    setIsPlaying(true);
    setIsMuted(false);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "unMute" }),
        "*"
      );
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "playVideo" }),
        "*"
      );
    }
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsPlaying(false);
    setIsMuted(true);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "mute" }),
        "*"
      );
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "pauseVideo" }),
        "*"
      );
    }
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.pause();
    }
  };

  // Click card -> Always open Instagram Post URL in a new tab
  const handleCardClick = () => {
    window.open(targetInstagramUrl, "_blank", "noopener,noreferrer");
  };

  // Toggle Mute / Unmute on desktop
  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: nextMuted ? "mute" : "unMute" }),
        "*"
      );
    }
    if (videoRef.current) {
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
      aria-label={title ? `${title} (Opens Instagram post in a new tab)` : "Watch Instagram Reel (Opens in a new tab)"}
    >
      {/* 
        Video Stream: Full uncropped view.
        pointer-events-none ensures all clicks hit the card and navigate to Instagram.
      */}
      {ytId ? (
        <div className="absolute inset-0 h-full w-full overflow-hidden bg-black pointer-events-none">
          <iframe
            ref={iframeRef}
            src={getYouTubeEmbedUrl(ytId, { autoplay: false, mute: true, loop: true, controls: false })}
            title={title || "Video content"}
            className="h-full w-full border-0 object-cover pointer-events-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      ) : src ? (
        <video
          ref={videoRef}
          loop
          muted
          playsInline
          className="h-full w-full object-cover pointer-events-none"
          src={src}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-zinc-900 text-zinc-600 text-xs">
          Video unavailable
        </div>
      )}

      {/* Minimal Mute/Unmute toggle for Desktop */}
      <button
        type="button"
        onClick={handleToggleMute}
        className="absolute top-3 right-3 z-30 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-black/60 border border-white/20 text-white/90 transition-all hover:bg-black/85 hover:scale-105 active:scale-95 shadow-md cursor-pointer pointer-events-auto"
        aria-label={isMuted ? "Unmute video" : "Mute video"}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
      </button>

      {/* Clean centered Play icon (▶) shown when not playing/hovered */}
      <div
        className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-all duration-200 ${
          isPlaying ? "bg-transparent opacity-0" : "bg-black/20 opacity-100"
        }`}
      >
        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-black/65 border border-white/25 text-white shadow-xl transition-transform duration-200 group-hover:scale-110">
          <Play size={20} className="translate-x-0.5 fill-white sm:size-6" />
        </div>
      </div>
    </div>
  );
}
