"use client";

import { useEffect } from "react";

export function PoliciesScrollHandler() {
  useEffect(() => {
    function scrollToHash() {
      const hash = window.location.hash;
      if (!hash) return;
      const targetId = hash.replace("#", "");
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        // Small timeout allows layout/fonts to settle before scrolling
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }

    // Scroll on mount / refresh
    scrollToHash();

    // Scroll on hash change (e.g. clicking footer links while already on /policies)
    window.addEventListener("hashchange", scrollToHash);
    return () => {
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, []);

  return null;
}
