type Crop = "fill" | "fit" | "limit";

export type HeroImagePreset = 1920 | 800 | 400;

function getCloudName() {
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() || process.env.CLOUDINARY_CLOUD_NAME?.trim() || "";
}

/** Stable, bounded delivery derivatives. The public ID remains the canonical asset identity. */
export function getCloudinaryImageUrl({
  publicId,
  width,
  height,
  crop = "limit",
}: {
  publicId: string;
  width: 160 | 320 | 400 | 640 | 800 | 960 | 1280 | 1920;
  height?: number;
  crop?: Crop;
}) {
  const cloudName = getCloudName();
  const dimensions = height ? `w_${width},h_${height},c_${crop}` : `w_${width},c_${crop}`;
  return `https://res.cloudinary.com/${encodeURIComponent(cloudName)}/image/upload/f_auto,q_auto,${dimensions}/${publicId}`;
}

/** Predefined hero image delivery presets to protect transformation cardinality */
export function getHeroImageUrl(publicId: string, target: "desktop" | "mobile" | "thumbnail" = "desktop") {
  const width: HeroImagePreset = target === "desktop" ? 1920 : target === "mobile" ? 800 : 400;
  const crop: Crop = target === "thumbnail" ? "fill" : "limit";
  const height = target === "thumbnail" ? 250 : undefined;
  return getCloudinaryImageUrl({ publicId, width, height, crop });
}

/** Optimized web video delivery URL */
export function getHeroVideoUrl(publicId: string) {
  const cloudName = getCloudName();
  return `https://res.cloudinary.com/${encodeURIComponent(cloudName)}/video/upload/f_auto,q_auto,w_1920,c_limit/${publicId}`;
}

