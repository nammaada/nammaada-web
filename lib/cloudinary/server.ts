import "server-only";

import { createHash } from "node:crypto";
import { getCloudinaryEnv } from "@/lib/env/server";

function signature(params: Record<string, string>, secret: string) {
  const serialized = Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join("&");
  return createHash("sha1").update(`${serialized}${secret}`).digest("hex");
}

function timestamp() { return Math.floor(Date.now() / 1000).toString(); }

export async function uploadCloudinaryImage(file: File, publicId?: string) {
  return uploadCloudinaryMedia(file, "image", publicId);
}

export async function uploadCloudinaryMedia(file: File, resourceType: "image" | "video" | "auto" = "auto", publicId?: string) {
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
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(env.cloudName)}/${resourceType}/upload`, { method: "POST", body, cache: "no-store" });
  if (!response.ok) throw new Error("Cloudinary upload failed");
  return await response.json() as { public_id: string; secure_url: string; width: number; height: number; format: string; resource_type: string };
}

export async function deleteCloudinaryImage(publicId: string) {
  return deleteCloudinaryMedia(publicId, "image");
}

export async function deleteCloudinaryMedia(publicId: string, resourceType: "image" | "video" = "image") {
  const env = getCloudinaryEnv();
  const time = timestamp();
  const params = { public_id: publicId, timestamp: time };
  const body = new URLSearchParams({ public_id: publicId, timestamp: time, api_key: env.apiKey, signature: signature(params, env.apiSecret) });
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(env.cloudName)}/${resourceType}/destroy`, { method: "POST", body, cache: "no-store" });
  if (!response.ok) throw new Error("Cloudinary deletion failed");
}

export function createUploadSignature() {
  const env = getCloudinaryEnv();
  const time = timestamp();
  const params: Record<string, string> = { timestamp: time };
  const sig = signature(params, env.apiSecret);
  return {
    signature: sig,
    timestamp: time,
    apiKey: env.apiKey,
    cloudName: env.cloudName,
  };
}

export async function verifyCloudinaryVideoDuration(publicId: string, maxSeconds = 20) {
  try {
    const env = getCloudinaryEnv();
    const auth = Buffer.from(`${env.apiKey}:${env.apiSecret}`).toString("base64");
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(env.cloudName)}/resources/video/upload/${encodeURIComponent(publicId)}`,
      {
        headers: { Authorization: `Basic ${auth}` },
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { duration?: number; bytes?: number };
    if (data.duration && data.duration > maxSeconds) {
      return `Hero video duration (${Math.round(data.duration)}s) exceeds the maximum allowed ${maxSeconds} seconds limit.`;
    }
    if (data.bytes && data.bytes > 25 * 1024 * 1024) {
      return `Hero video file size (${(data.bytes / (1024 * 1024)).toFixed(1)} MB) exceeds the 25 MB limit.`;
    }
  } catch {
    // Fail safely if Cloudinary resource API is unreachable
  }
  return null;
}

export function validateImage(file: File) {
  const supported = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
  if (!supported.has(file.type)) return "Use a JPEG, PNG, WebP, or AVIF image.";
  if (file.size > 10 * 1024 * 1024) return "Images must be 10 MB or smaller.";
  return null;
}

export function validateMedia(file: File) {
  const supportedImages = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
  const supportedVideos = new Set(["video/mp4", "video/webm", "video/quicktime"]);

  if (supportedImages.has(file.type)) {
    if (file.size > 10 * 1024 * 1024) return "Images must be 10 MB or smaller.";
    return null;
  }

  if (supportedVideos.has(file.type)) {
    if (file.size > 25 * 1024 * 1024) return "Hero videos must be 25 MB or smaller.";
    return null;
  }

  return "Use a supported image (JPEG, PNG, WebP, AVIF) or video (MP4, WebM, MOV under 25MB).";
}

