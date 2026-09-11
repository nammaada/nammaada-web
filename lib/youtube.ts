export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^[\w-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/
  );
  return match ? match[1] : null;
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
  options?: { autoplay?: boolean; mute?: boolean; loop?: boolean; controls?: boolean }
): string {
  const autoplay = options?.autoplay ?? true;
  const mute = options?.mute ?? true;
  const loop = options?.loop ?? true;
  const controls = options?.controls ?? false;

  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    mute: mute ? "1" : "0",
    controls: controls ? "1" : "0",
    loop: loop ? "1" : "0",
    playlist: id,
    playsinline: "1",
    rel: "0",
    enablejsapi: "1",
    iv_load_policy: "3",
    disablekb: "1",
    fs: "0",
  });
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

