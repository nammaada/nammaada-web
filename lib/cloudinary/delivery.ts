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
  cloudName: cloudNameParam,
}: {
  publicId: string;
  width: 160 | 320 | 400 | 640 | 800 | 960 | 1280 | 1920;
  height?: number;
  crop?: Crop;
  cloudName?: string;
}) {
  const cloudName = cloudNameParam || getCloudName();
  const dimensions = height ? `w_${width},h_${height},c_${crop}` : `w_${width},c_${crop}`;
  return `https://res.cloudinary.com/${encodeURIComponent(cloudName)}/image/upload/f_auto,q_auto,${dimensions}/${publicId}`;
}

/** Predefined hero image delivery presets to protect transformation cardinality */
export function getHeroImageUrl(publicId: string, target: "desktop" | "mobile" | "thumbnail" = "desktop", cloudNameOverride?: string) {
  const width: HeroImagePreset = target === "desktop" ? 1920 : target === "mobile" ? 800 : 400;
  const crop: Crop = target === "thumbnail" ? "fill" : "limit";
  const height = target === "thumbnail" ? 250 : undefined;
  return getCloudinaryImageUrl({ publicId, width, height, crop, cloudName: cloudNameOverride });
}

/** Optimized web video delivery URL with explicit format and codec to prevent browser MIME mismatch */
export function getHeroVideoUrl(publicId: string, cloudNameOverride?: string, format: "mp4" | "webm" = "mp4") {
  const cloudName = cloudNameOverride || getCloudName();
  const cleanId = publicId.replace(/\.(mp4|webm|mov|ogg)$/i, "");
  const formatTransform = format === "webm" ? "f_webm,vc_vp9" : "f_mp4,vc_h264";
  return `https://res.cloudinary.com/${encodeURIComponent(cloudName)}/video/upload/${formatTransform},q_auto,w_1920,c_limit/${cleanId}.${format}`;
}

/** Optimized video poster frame delivery URL (extracts frame 0 from video asset as JPG) */
export function getHeroVideoPosterUrl(publicId: string, target: "desktop" | "mobile" | "thumbnail" = "desktop", cloudNameOverride?: string) {
  const cloudName = cloudNameOverride || getCloudName();
  const cleanId = publicId.replace(/\.(mp4|webm|mov|ogg|jpg|jpeg|png)$/i, "");
  const dimensions = target === "thumbnail" ? "w_400,h_250,c_fill" : target === "mobile" ? "w_800,c_limit" : "w_1920,c_limit";
  return `https://res.cloudinary.com/${encodeURIComponent(cloudName)}/video/upload/so_0,f_jpg,${dimensions}/${cleanId}.jpg`;
}

