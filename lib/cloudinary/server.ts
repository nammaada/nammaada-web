import "server-only";

import { createHash } from "node:crypto";
import { getCloudinaryEnv } from "@/lib/env/server";

function signature(params: Record<string, string>, secret: string) {
  const serialized = Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join("&");
  return createHash("sha1").update(`${serialized}${secret}`).digest("hex");
}

function timestamp() { return Math.floor(Date.now() / 1000).toString(); }

export async function uploadCloudinaryImage(file: File, publicId?: string) {
  const env = getCloudinaryEnv();
  const time = timestamp();
  const params: Record<string, string> = { timestamp: time };
  if (publicId) params.public_id = publicId;
  const body = new FormData();
  body.append("file", file);
  body.append("api_key", env.apiKey);
  body.append("timestamp", time);
  if (publicId) body.append("public_id", publicId);
  body.append("signature", signature(params, env.apiSecret));
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(env.cloudName)}/image/upload`, { method: "POST", body, cache: "no-store" });
  if (!response.ok) throw new Error("Cloudinary upload failed");
  return await response.json() as { public_id: string; secure_url: string; width: number; height: number; format: string };
}

export async function deleteCloudinaryImage(publicId: string) {
  const env = getCloudinaryEnv();
  const time = timestamp();
  const params = { public_id: publicId, timestamp: time };
  const body = new URLSearchParams({ public_id: publicId, timestamp: time, api_key: env.apiKey, signature: signature(params, env.apiSecret) });
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(env.cloudName)}/image/destroy`, { method: "POST", body, cache: "no-store" });
  if (!response.ok) throw new Error("Cloudinary deletion failed");
}

export function validateImage(file: File) {
  const supported = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
  if (!supported.has(file.type)) return "Use a JPEG, PNG, WebP, or AVIF image.";
  if (file.size > 10 * 1024 * 1024) return "Images must be 10 MB or smaller.";
  return null;
}
