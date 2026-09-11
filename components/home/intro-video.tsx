"use client";

import { useEffect, useRef, useState } from "react";

const INTRO_STORAGE_KEY = "namma_ada_intro_seen";

export function IntroVideo() {
  const [visible, setVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasFinishedRef = useRef(false);

  useEffect(() => {
    // 1. Check persistent localStorage flag
    try {
      if (typeof window !== "undefined" && window.localStorage.getItem(INTRO_STORAGE_KEY) === "true") {
        return;
      }
    } catch {
      // If localStorage is restricted or throws, avoid trapping user
      return;
    }

    // 2. Responsive video selection based on screen width
    const isMobile = window.innerWidth < 768;
    setVideoSrc(isMobile ? "/video/ad-mobile-namma.mp4" : "/video/desktop-ada.mp4");
    setVisible(true);

    // 3. Lock page scrolling while intro is playing
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow || "";
      document.documentElement.style.overflow = originalHtmlOverflow || "";
    };
  }, []);

  const finishIntro = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;

    // Save persistent flag to localStorage
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(INTRO_STORAGE_KEY, "true");
      }
    } catch {
      // Ignore localStorage errors in private modes
    }

    // Restore page scrolling immediately on fade out start
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";

    // Smoothly fade out overlay
    setIsFadingOut(true);

    // Completely unmount video and overlay after fade transition
    setTimeout(() => {
      setVisible(false);
    }, 700);
  };

  // Autoplay video immediately when mounted and source is set
  useEffect(() => {
    if (!visible || !videoSrc || !videoRef.current || hasFinishedRef.current) return;

    const video = videoRef.current;
    video.muted = true;
    video.defaultMuted = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Intro autoplay prevented:", err);
        // If autoplay is strictly restricted by browser, transition directly to website
        finishIntro();
      });
    }

    // Safety timeout: if video stalls or exceeds 20s, proceed to website
    const safetyTimer = setTimeout(() => {
      finishIntro();
    }, 20000);

    return () => clearTimeout(safetyTimer);
  }, [visible, videoSrc]);

  // If already seen or not visible, do not render overlay in DOM
  if (!visible || !videoSrc) {
    return null;
  }

  return (
    <div
      id="namma-intro-overlay"
      aria-label="Welcome to Namma Ada intro video"
      className={`fixed inset-0 z-[99999] flex h-[100dvh] w-screen items-center justify-center bg-black overflow-hidden transition-opacity duration-700 ease-out select-none ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      onClick={finishIntro}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        muted
        playsInline
        // @ts-ignore
        webkit-playsinline="true"
        preload="auto"
        onEnded={finishIntro}
        onError={finishIntro}
        className="h-full w-full object-cover object-center pointer-events-none select-none"
      />
    </div>
  );
}

