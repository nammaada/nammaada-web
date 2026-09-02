import "server-only";

import { getCloudinaryCloudName } from "@/lib/env/server";

type Crop = "fill" | "fit" | "limit";
type CloudinaryImageOptions = { publicId: string; width: 160 | 320 | 640 | 960 | 1280; height?: number; crop?: Crop };

/** Stable, bounded delivery derivatives. The public ID remains the canonical asset identity. */
export function getCloudinaryImageUrl({ publicId, width, height, crop = "limit" }: CloudinaryImageOptions) {
  const cloudName = getCloudinaryCloudName();
  const dimensions = height ? `w_${width},h_${height},c_${crop}` : `w_${width},c_${crop}`;
  return `https://res.cloudinary.com/${encodeURIComponent(cloudName)}/image/upload/f_auto,q_auto,${dimensions}/${publicId}`;
}
