"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

const INTRO_SESSION_KEY = "namma_ada_intro_seen";

export function IntroVideo() {
  const [mounted, setMounted] = useState(false);
  const [hasSeen, setHasSeen] = useState(true); // Default to true to prevent flash on returning users
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Check session storage
    try {
      const seen = sessionStorage.getItem(INTRO_SESSION_KEY);
      if (seen === "true") {
        setIsFinished(true);
        return;
      }
    } catch {
      // In case session storage is restricted
    }

    setHasSeen(false);
    setMounted(true);

    // Responsive video selection: mobile vs desktop
    const isMobile = window.innerWidth < 768;
    setVideoSrc(isMobile ? "/video/ad-mobile-namma.mp4" : "/video/desktop-ada.mp4");

    // Lock page scrolling while intro is playing
    const originalOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  const finishIntro = () => {
    if (isFinished || isFadingOut) return;

    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, "true");
    } catch {
      // Ignore sessionStorage errors in incognito/private modes
    }

    setIsFadingOut(true);

    // Unlock body scroll immediately upon fade start
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";

    // Allow smooth fade-out animation to complete before unmounting
    setTimeout(() => {
      setIsFinished(true);
    }, 750);
  };

  // Attempt autoplay as soon as videoSrc is loaded
  useEffect(() => {
    if (!videoSrc || !videoRef.current || isFinished) return;

    const video = videoRef.current;
    video.muted = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Autoplay restriction detected:", err);
        setAutoplayBlocked(true);
      });
    }

    // Safety timeout: If for any reason video stalls/hangs longer than 20s, allow entering
    const safetyTimer = setTimeout(() => {
      finishIntro();
    }, 20000);

    return () => clearTimeout(safetyTimer);
  }, [videoSrc, isFinished]);

  if (!mounted || hasSeen || isFinished || !videoSrc) {
    return null;
  }

  return (
    <div
      id="namma-intro-overlay"
      aria-label="Welcome to Namma Ada intro video"
      className={`fixed inset-0 z-[99999] flex h-[100dvh] w-screen items-center justify-center bg-[#1b0709] overflow-hidden transition-opacity duration-700 ease-out ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={finishIntro}
        onError={() => {
          console.warn("Intro video could not load, entering homepage");
          finishIntro();
        }}
        className="h-full w-full object-cover object-center pointer-events-none select-none"
      />

      {/* Fallback overlay if browser blocks autoplay */}
      {autoplayBlocked && !isFadingOut && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 bg-black/65 backdrop-blur-xs p-6 text-center">
          <div className="space-y-1 max-w-sm">
            <h2 className="text-xl font-serif text-[#fffcf2] font-semibold tracking-wide">
              Welcome to Namma Ada
            </h2>
            <p className="text-xs text-[#fffcf2]/80">
              Handcrafted Kerala delicacies, made with love.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.play().catch(finishIntro);
                }
                setAutoplayBlocked(false);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-[#711e2c] px-6 py-2.5 text-xs font-bold text-white shadow-xl hover:bg-[#862534] transition-all active:scale-95 cursor-pointer border border-white/20"
            >
              Watch Video
            </button>

            <button
              type="button"
              onClick={finishIntro}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-5 py-2.5 text-xs font-semibold text-[#fffcf2] hover:bg-white/25 transition-all active:scale-95 cursor-pointer border border-white/20"
            >
              <span>Enter Store</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
