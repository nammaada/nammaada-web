export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/
  );
  return match ? match[1] : null;
}

export function getYouTubeThumbnailUrl(id: string): string {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export function getYouTubeEmbedUrl(id: string, autoplay = false): string {
  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
    controls: "1",
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}
