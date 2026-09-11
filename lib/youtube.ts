export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/
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
  const params = new URLSearchParams({
    autoplay: options?.autoplay ? "1" : "0",
    mute: options?.mute ?? true ? "1" : "0",
    controls: options?.controls ? "1" : "0",
    loop: options?.loop ?? true ? "1" : "0",
    playlist: id,
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
    iv_load_policy: "3",
    enablejsapi: "1",
    disablekb: "1",
    fs: "0",
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}
