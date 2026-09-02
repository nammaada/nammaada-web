"use client";

import { useState } from "react";
import { Image as ImageIcon, Video, UploadCloud, Info } from "lucide-react";
import { saveHeroMedia } from "@/actions/admin";
import { AdminField, Submit } from "@/components/admin/admin-form";
import type { HeroMediaConfig } from "@/lib/storefront/hero";

export function HeroMediaForm({ config }: { config: HeroMediaConfig }) {
  const [mediaType, setMediaType] = useState<"image" | "video">(config.media_type || "image");

  return (
    <form action={saveHeroMedia} className="grid gap-6">
      {/* Media Type Selector Tabs */}
      <div>
        <label className="text-sm font-semibold text-foreground mb-2 block">Select Hero Media Type</label>
        <input name="media_type" type="hidden" value={mediaType} />

        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <button
            type="button"
            onClick={() => setMediaType("image")}
            className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all ${
              mediaType === "image"
                ? "border-primary bg-primary text-primary-foreground shadow-xs"
                : "border-border bg-card text-foreground/80 hover:bg-secondary"
            }`}
          >
            <ImageIcon size={18} />
            <span>Image</span>
          </button>

          <button
            type="button"
            onClick={() => setMediaType("video")}
            className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all ${
              mediaType === "video"
                ? "border-primary bg-primary text-primary-foreground shadow-xs"
                : "border-border bg-card text-foreground/80 hover:bg-secondary"
            }`}
          >
            <Video size={18} />
            <span>Video</span>
          </button>
        </div>
      </div>

      {/* Main Media Upload Area */}
      <div className="rounded-xl border border-dashed border-border p-5 bg-secondary/30 grid gap-3">
        <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
          <UploadCloud className="text-primary" size={20} />
          <span>{mediaType === "video" ? "Upload Hero Video" : "Upload Hero Image"}</span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {mediaType === "video"
            ? "Upload an MP4, WebM, or MOV video file (Up to 50 MB). The video will loop automatically and play silently."
            : "Upload a high quality JPG, PNG, WebP, or AVIF image (Up to 10 MB). Delivered automatically in optimized formats."}
        </p>

        <input
          accept={mediaType === "video" ? "video/mp4,video/webm,video/quicktime" : "image/jpeg,image/png,image/webp,image/avif"}
          className="block w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
          name="media_file"
          type="file"
        />
      </div>

      {/* Video Poster Image Upload Area (Only visible when Video selected) */}
      {mediaType === "video" && (
        <div className="rounded-xl border border-border p-5 bg-card grid gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
            <ImageIcon className="text-accent" size={18} />
            <span>Poster Fallback Image (Optional)</span>
          </div>

          <p className="text-xs text-muted-foreground">
            Displayed before video loads and shown when users have &quot;prefers-reduced-motion&quot; enabled in their browser.
          </p>

          <input
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="block w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-secondary file:text-primary hover:file:bg-primary/10 cursor-pointer"
            name="poster_file"
            type="file"
          />

          {config.poster_url && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-semibold text-emerald-900 bg-emerald-900/10 rounded px-2 py-0.5">✓ Active poster saved</span>
            </div>
          )}
        </div>
      )}

      {/* Accessibility Alt Text */}
      <AdminField
        defaultValue={config.alt_text || ""}
        helperText="Provides context for screen readers and search engines."
        label="Media Description / Alt Text"
        name="alt_text"
        placeholder="Describe what is visible in the hero media..."
      />

      <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 p-3 text-xs text-amber-900 border border-amber-500/20">
        <Info className="shrink-0 text-amber-800" size={16} />
        <span>Media changes are instantly published to the storefront home page upon saving.</span>
      </div>

      {/* Submit Action */}
      <div className="pt-2">
        <Submit label="Save hero changes" size="lg" />
      </div>
    </form>
  );
}
