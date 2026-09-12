export function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // If already an 11-character YouTube video ID
  if (/^[\w-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Matches standard watch URLs, shorts, embed, youtu.be, and mobile URLs
  const match = trimmed.match(
    /(?:youtu\.be\/|(?:www\.|m\.)?youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?.*v=|shorts\/))([\w-]{11})/i
  );
  if (match && match[1]) {
    return match[1];
  }

  // Fallback for query parameter v or URL path segments
  try {
    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const v = parsed.searchParams.get("v");
    if (v && /^[\w-]{11}$/.test(v)) {
      return v;
    }
    const parts = parsed.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && /^[\w-]{11}$/.test(last)) {
      return last;
    }
  } catch {}

  return null;
}

export function getYouTubeThumbnailUrl(
  id: string,
  quality: "maxres" | "hq" | "sd" = "maxres"
): string {
  if (quality === "maxres") {
    return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  }
  if (quality === "sd") {
    return `https://img.youtube.com/vi/${id}/sddefault.jpg`;
  }
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export function getYouTubeEmbedUrl(
  id: string,
  options?: {
    autoplay?: boolean;
    mute?: boolean;
    loop?: boolean;
    controls?: boolean;
    playsinline?: boolean;
  }
): string {
  const autoplay = options?.autoplay ?? true;
  const mute = options?.mute ?? false;
  const loop = options?.loop ?? false;
  const controls = options?.controls ?? true;
  const playsinline = options?.playsinline ?? true;

  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    playsinline: playsinline ? "1" : "0",
    rel: "0",
    modestbranding: "1",
    enablejsapi: "1",
  });

  if (mute) params.set("mute", "1");
  if (!controls) params.set("controls", "0");
  if (loop) {
    params.set("loop", "1");
    params.set("playlist", id);
  }

  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement | string,
        config: {
          videoId?: string;
          playerVars?: Record<string, any>;
          events?: {
            onReady?: (event: { target: any }) => void;
            onStateChange?: (event: { data: number; target: any }) => void;
            onError?: (event: { data: number; target: any }) => void;
          };
        }
      ) => any;
      PlayerState?: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApiLoadingPromise: Promise<void> | null = null;

export function loadYouTubeIFrameAPI(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.YT && window.YT.Player) {
    return Promise.resolve();
  }

  if (ytApiLoadingPromise) {
    return ytApiLoadingPromise;
  }

  ytApiLoadingPromise = new Promise<void>((resolve) => {
    const existingScript = document.getElementById("youtube-iframe-api-script");
    if (!existingScript) {
      const tag = document.createElement("script");
      tag.id = "youtube-iframe-api-script";
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScript = document.getElementsByTagName("script")[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(tag, firstScript);
      } else {
        document.head.appendChild(tag);
      }
    }

    const checkReady = () => {
      if (window.YT && window.YT.Player) {
        resolve();
        return true;
      }
      return false;
    };

    if (checkReady()) return;

    const previousOnReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousOnReady === "function") {
        try {
          previousOnReady();
        } catch {}
      }
      resolve();
    };

    const interval = setInterval(() => {
      if (checkReady()) {
        clearInterval(interval);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      resolve();
    }, 10000);
  });

  return ytApiLoadingPromise;
}

// Global registry to ensure ONLY ONE video player can ever produce audio across the page
const activeYouTubePlayers = new Set<any>();

export function registerYouTubePlayer(player: any) {
  if (player) {
    activeYouTubePlayers.add(player);
  }
}

export function unregisterYouTubePlayer(player: any) {
  if (player) {
    activeYouTubePlayers.delete(player);
  }
}

export function pauseAllOtherYouTubePlayers(activePlayer: any) {
  activeYouTubePlayers.forEach((player) => {
    if (player && player !== activePlayer) {
      try {
        player.pauseVideo();
      } catch {}
    }
  });
}


