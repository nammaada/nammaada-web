"use client";

import { useState } from "react";
import Link from "next/link";
import { Image as ImageIcon, Video, UploadCloud, AlertTriangle, ArrowLeft, Loader2, Smartphone, Monitor, Trash2 } from "lucide-react";
import { getCloudinaryUploadSignatureAction, saveHeroBanner } from "@/actions/admin";
import { AdminField, CheckField, FormSection, Submit } from "@/components/admin/admin-form";
import { getHeroImageUrl, getHeroVideoPosterUrl, getHeroVideoUrl } from "@/lib/cloudinary/delivery";
import type { HeroBanner } from "@/lib/storefront/hero";

type HeroBannerFormProps = {
  banner?: HeroBanner | null;
  cloudName?: string;
};

export function HeroBannerForm({ banner, cloudName: initialCloudName }: HeroBannerFormProps) {
  const [mediaType, setMediaType] = useState<"image" | "video">(banner?.media_type || "image");
  const [mobileMediaType, setMobileMediaType] = useState<"image" | "video">(banner?.mobile_media_type || "image");
  const [isSecondaryEnabled, setIsSecondaryEnabled] = useState(banner?.is_secondary_cta_enabled ?? false);
  
  // Cloudinary public IDs state
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState(banner?.cloudinary_public_id || "");
  const [posterPublicId, setPosterPublicId] = useState(banner?.poster_public_id || "");
  const [mobileMediaPublicId, setMobileMediaPublicId] = useState(banner?.mobile_media_public_id || "");

  // Client-side direct upload state
  const [uploadingState, setUploadingState] = useState<{
    media: boolean;
    poster: boolean;
    mobile: boolean;
    error: string | null;
  }>({
    media: false,
    poster: false,
    mobile: false,
    error: null,
  });

  const [cloudName, setCloudName] = useState(
    initialCloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ""
  );

  // Client direct Cloudinary upload function (Zero binary bytes pass through Vercel!)
  async function handleDirectCloudinaryUpload(
    file: File,
    resourceType: "image" | "video",
    target: "media" | "poster" | "mobile"
  ) {
    const actualResourceType =
      target === "poster"
        ? "image"
        : target === "mobile"
        ? file.type.startsWith("video/") || mobileMediaType === "video"
          ? "video"
          : "image"
        : file.type.startsWith("video/") || resourceType === "video"
        ? "video"
        : "image";

    // Validate limits on browser before uploading
    if (actualResourceType === "video") {
      if (file.size > 25 * 1024 * 1024) {
        setUploadingState((prev) => ({ ...prev, error: "Hero video must be 25 MB or smaller." }));
        return;
      }
    } else {
      if (file.size > 10 * 1024 * 1024) {
        setUploadingState((prev) => ({ ...prev, error: "Image must be 10 MB or smaller." }));
        return;
      }
    }

    setUploadingState((prev) => ({ ...prev, [target]: true, error: null }));

    try {
      // Step 1: Get signed upload parameters from server action (Vercel generates signature only, no binary bytes)
      const sigData = await getCloudinaryUploadSignatureAction();

      if (!sigData?.apiKey || !sigData?.cloudName || !sigData?.signature) {
        throw new Error("Cloudinary authorization failed. Missing server credentials.");
      }

      setCloudName(sigData.cloudName);

      // Step 2: Upload file directly from browser to Cloudinary API
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sigData.apiKey);
      formData.append("timestamp", sigData.timestamp);
      formData.append("signature", sigData.signature);

      const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(sigData.cloudName)}/${actualResourceType}/upload`;
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => null);
        const cloudMsg = errorJson?.error?.message;
        throw new Error(cloudMsg ? `Video upload failed: ${cloudMsg}` : `Cloudinary upload failed (${res.status}).`);
      }

      const json = await res.json();
      const uploadedPublicId = json.public_id;

      if (!uploadedPublicId) {
        throw new Error("Cloudinary upload did not return a valid public ID.");
      }

      if (target === "media") setCloudinaryPublicId(uploadedPublicId);
      if (target === "poster") setPosterPublicId(uploadedPublicId);
      if (target === "mobile") setMobileMediaPublicId(uploadedPublicId);

      setUploadingState((prev) => ({ ...prev, [target]: false }));
    } catch (err: any) {
      setUploadingState((prev) => ({
        ...prev,
        [target]: false,
        error: err.message || "Failed to upload media asset.",
      }));
    }
  }

  const effectiveCloudName = cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";

  const isPosterFromVideo =
    mediaType === "video" && (!posterPublicId || posterPublicId === cloudinaryPublicId);

  const activeMediaUrl = cloudinaryPublicId
    ? mediaType === "video"
      ? getHeroVideoUrl(cloudinaryPublicId, effectiveCloudName)
      : getHeroImageUrl(cloudinaryPublicId, "desktop", effectiveCloudName)
    : null;

  const activePosterUrl = isPosterFromVideo
    ? getHeroVideoPosterUrl(cloudinaryPublicId, "desktop", effectiveCloudName)
    : posterPublicId
    ? getHeroImageUrl(posterPublicId, "desktop", effectiveCloudName)
    : null;

  const activeMobileMediaUrl = mobileMediaPublicId
    ? mobileMediaType === "video"
      ? getHeroVideoUrl(mobileMediaPublicId, effectiveCloudName)
      : getHeroImageUrl(mobileMediaPublicId, "mobile", effectiveCloudName)
    : null;

  return (
    <form action={saveHeroBanner} className="grid gap-8">
      <input name="id" type="hidden" value={banner?.id || ""} />
      <input name="old_cloudinary_public_id" type="hidden" value={banner?.cloudinary_public_id || ""} />
      <input name="old_poster_public_id" type="hidden" value={banner?.poster_public_id || ""} />
      <input name="cloudinary_public_id" type="hidden" value={cloudinaryPublicId} />
      <input name="poster_public_id" type="hidden" value={posterPublicId} />
      <input name="mobile_media_public_id" type="hidden" value={mobileMediaPublicId} />
      <input name="mobile_media_type" type="hidden" value={mobileMediaType} />
      <input name="media_type" type="hidden" value={mediaType} />

      {uploadingState.error && (
        <div role="alert" className="rounded-xl border border-red-900/20 bg-red-900/5 p-4 text-sm font-medium text-red-900 flex items-center gap-2">
          <AlertTriangle className="shrink-0 text-red-800" size={18} />
          <span>{uploadingState.error}</span>
        </div>
      )}

      {/* 1. BANNER MEDIA SECTION */}
      <FormSection
        description="Select media format and upload directly to Cloudinary CDN. Recommended: 1920×1080 px (16:9 widescreen), max 10MB image or 25MB video (<=20s)."
        title="1. Banner Media"
      >
        {/* Recommended Size Note */}
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/80 bg-secondary/30 px-3.5 py-2.5 text-xs text-muted-foreground mb-1">
          <Monitor size={15} className="text-primary shrink-0" />
          <span className="font-semibold text-foreground">Recommended Desktop Size:</span>
          <span className="rounded bg-card px-2 py-0.5 font-medium text-foreground border border-border/60">
            1920 × 1080 px (16:9 Widescreen)
          </span>
          <span className="text-[11px] text-muted-foreground">
            • Image ≤ 10MB (JPG, WebP, PNG) • Video ≤ 25MB (≤20s, MP4/1080p)
          </span>
        </div>

        <div className="grid gap-4">
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Select Hero Media Type</label>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <button
                type="button"
                onClick={() => setMediaType("image")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all cursor-pointer ${
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
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all cursor-pointer ${
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
          <div className="rounded-xl border border-dashed border-border p-5 bg-secondary/20 grid gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <UploadCloud className="text-primary" size={20} />
                <span>{mediaType === "video" ? "Direct Upload Hero Video" : "Direct Upload Hero Image"}</span>
              </div>
              {uploadingState.media && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <Loader2 className="animate-spin" size={14} /> Uploading directly to Cloudinary...
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {mediaType === "video"
                ? "Hero video limit: Max 25 MB, Max 20s duration. 1920×1080 (16:9 widescreen) recommended. Video uploads directly from your browser to Cloudinary CDN."
                : "Hero image limit: Max 10 MB (JPG, PNG, WebP, AVIF). 1920×1080 (16:9 widescreen) recommended. Delivered automatically in optimized dimensions."}
            </p>

            <input
              accept={mediaType === "video" ? "video/mp4,video/webm,video/quicktime,video/*" : "image/jpeg,image/png,image/webp,image/avif,image/*"}
              className="block w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleDirectCloudinaryUpload(file, mediaType, "media");
              }}
              type="file"
            />

            {cloudinaryPublicId && (
              <div className="mt-2 grid gap-3">
                <div className="rounded-lg border border-border bg-card p-3 flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-900 bg-emerald-900/10 px-2 py-0.5 rounded">
                    ✓ Canonical Public ID: {cloudinaryPublicId}
                  </span>
                  {activeMediaUrl && (
                    <a
                      className="text-primary underline font-medium"
                      href={activeMediaUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Preview Media
                    </a>
                  )}
                </div>

                {activeMediaUrl && (
                  <div className="overflow-hidden rounded-xl border border-border bg-black/90 max-h-72 aspect-video flex items-center justify-center">
                    {mediaType === "video" ? (
                      <video
                        controls
                        muted
                        playsInline
                        poster={activePosterUrl || undefined}
                        src={activeMediaUrl}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt="Hero Media Preview"
                        className="h-full w-full object-contain"
                        src={activeMediaUrl}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>



          <AdminField
            defaultValue={banner?.alt_text || ""}
            helperText="Provides accessibility context for screen readers and SEO."
            label="Media Description / Alt Text"
            name="alt_text"
            placeholder="Describe what is visible in this banner media..."
          />
        </div>
      </FormSection>

      {/* 2. BANNER CONTENT SECTION */}
      <FormSection
        description="Configure the eyebrow label, primary title, and description overlay for this banner."
        title="2. Banner Content"
      >
        <AdminField
          defaultValue={banner?.eyebrow || "AUTHENTIC KERALA FLAVOURS"}
          helperText="Small uppercase category or highlight tag above the headline."
          label="Eyebrow Tag"
          name="eyebrow"
          required
          placeholder="AUTHENTIC KERALA FLAVOURS"
        />

        <label className="grid gap-1.5 text-sm font-semibold text-foreground">
          <span>Headline *</span>
          <textarea
            className="min-h-24 w-full rounded-lg border border-input bg-card p-3 text-sm font-normal text-foreground placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
            defaultValue={banner?.headline || "Soul of Kerala,\nserved with heart."}
            name="headline"
            required
            rows={2}
          />
          <span className="text-xs font-normal text-muted-foreground">Main hero headline displayed over the media.</span>
        </label>

        <label className="grid gap-1.5 text-sm font-semibold text-foreground">
          <span>Description *</span>
          <textarea
            className="min-h-24 w-full rounded-lg border border-input bg-card p-3 text-sm font-normal text-foreground placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
            defaultValue={
              banner?.description ||
              "At Namma Ada, we bring the soul of Kerala into the homes of Bangalore. Every delicacy is handcrafted with tradition and a whole lot of love."
            }
            name="description"
            required
            rows={3}
          />
        </label>
      </FormSection>

      {/* 3. CALL TO ACTIONS SECTION */}
      <FormSection description="Configure primary and optional secondary action buttons." title="3. Call To Actions">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField
            defaultValue={banner?.primary_cta_label || "Explore Now"}
            label="Primary Button Label"
            name="primary_cta_label"
            required
            placeholder="Explore Now"
          />
          <AdminField
            defaultValue={banner?.primary_cta_href || "/products"}
            label="Primary Button Destination"
            name="primary_cta_href"
            required
            placeholder="/products"
          />
        </div>

        <div className="rounded-xl border border-border p-4 bg-secondary/10 grid gap-4">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              checked={isSecondaryEnabled}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              name="is_secondary_cta_enabled"
              onChange={(e) => setIsSecondaryEnabled(e.target.checked)}
              type="checkbox"
            />
            <span className="text-sm font-semibold text-foreground">Enable Secondary Button</span>
          </label>

          {isSecondaryEnabled && (
            <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-border">
              <AdminField
                defaultValue={banner?.secondary_cta_label || "Bulk orders"}
                label="Secondary Button Label"
                name="secondary_cta_label"
                placeholder="Bulk orders"
              />
              <AdminField
                defaultValue={banner?.secondary_cta_href || "/contact"}
                label="Secondary Button Destination"
                name="secondary_cta_href"
                placeholder="/contact"
              />
            </div>
          )}
        </div>
      </FormSection>

      {/* 4. DISPLAY & STATUS SECTION */}
      <FormSection description="Set banner visibility and sequence order." title="4. Display & Status">
        <div className="grid gap-4 sm:grid-cols-2 items-center">
          <CheckField
            defaultChecked={banner?.is_active ?? true}
            description="Active banners are included in storefront slider query."
            label="Banner Active"
            name="is_active"
          />
          <AdminField
            defaultValue={banner?.display_order ?? 0}
            helperText="Lower numbers display first (0, 1, 2...)"
            label="Display Order"
            name="display_order"
            type="number"
          />
        </div>
      </FormSection>

      {/* 5. MOBILE HERO BANNER (IMAGE & VIDEO) */}
      <FormSection
        description="Configure an optimized portrait media asset specifically for mobile phone screens. Overrides desktop media on smaller viewports."
        title="5. Mobile Hero Banner (Image & Video)"
      >
        {/* Recommended Size Note */}
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/80 bg-secondary/30 px-3.5 py-2.5 text-xs text-muted-foreground">
          <Smartphone size={15} className="text-primary shrink-0" />
          <span className="font-semibold text-foreground">Recommended Mobile Size:</span>
          <span className="rounded bg-card px-2 py-0.5 font-medium text-foreground border border-border/60">
            1080 × 1920 px (9:16 Portrait)
          </span>
          <span className="text-[11px] text-muted-foreground">
            • Image ≤ 10MB (JPG, WebP, PNG) • Video ≤ 25MB (≤20s, MP4)
          </span>
        </div>

        {/* Mobile Media Type Selector */}
        <div className="grid gap-2 pt-1">
          <label className="text-sm font-semibold text-foreground">Select Mobile Media Type</label>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <button
              type="button"
              onClick={() => setMobileMediaType("image")}
              className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                mobileMediaType === "image"
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-border bg-card text-foreground/80 hover:bg-secondary"
              }`}
            >
              <ImageIcon size={16} />
              <span>Mobile Image</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMediaType("video")}
              className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                mobileMediaType === "video"
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-border bg-card text-foreground/80 hover:bg-secondary"
              }`}
            >
              <Video size={16} />
              <span>Mobile Video</span>
            </button>
          </div>
        </div>

        {/* Mobile Direct Upload Container */}
        <div className="rounded-xl border border-dashed border-border p-5 bg-secondary/20 grid gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <UploadCloud className="text-primary" size={20} />
              <span>{mobileMediaType === "video" ? "Upload Mobile Hero Video" : "Upload Mobile Hero Image"}</span>
            </div>
            {uploadingState.mobile && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Loader2 className="animate-spin" size={14} /> Uploading directly to Cloudinary...
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {mobileMediaType === "video"
              ? "Mobile video limit: Max 25 MB, Max 20s duration. 1080×1920 (9:16 portrait) recommended."
              : "Mobile image limit: Max 10 MB (JPG, PNG, WebP, AVIF). 1080×1920 (9:16 portrait) recommended."}
          </p>

          <input
            accept={
              mobileMediaType === "video"
                ? "video/mp4,video/webm,video/quicktime,video/*"
                : "image/jpeg,image/png,image/webp,image/avif,image/*"
            }
            className="block w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleDirectCloudinaryUpload(file, mobileMediaType, "mobile");
            }}
            type="file"
          />

          {mobileMediaPublicId && (
            <div className="mt-2 grid gap-3">
              <div className="rounded-lg border border-border bg-card p-3 flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-900 bg-emerald-900/10 px-2 py-0.5 rounded truncate max-w-xs">
                  ✓ Mobile Public ID: {mobileMediaPublicId}
                </span>
                <div className="flex items-center gap-2">
                  {activeMobileMediaUrl && (
                    <a
                      className="text-primary underline font-medium"
                      href={activeMobileMediaUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Preview
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setMobileMediaPublicId("")}
                    className="inline-flex items-center gap-1 text-red-700 hover:text-red-800 text-xs font-semibold ml-2 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>

              {activeMobileMediaUrl && (
                <div className="overflow-hidden rounded-xl border border-border bg-black/90 max-h-80 aspect-[9/16] max-w-[180px] flex items-center justify-center shadow-md">
                  {mobileMediaType === "video" ? (
                    <video
                      controls
                      muted
                      playsInline
                      src={activeMobileMediaUrl}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt="Mobile Hero Preview"
                      className="h-full w-full object-cover"
                      src={activeMobileMediaUrl}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Optional Mobile Text Overrides */}
        <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-border/60">
          <AdminField
            defaultValue={banner?.mobile_headline || ""}
            helperText="Shortened headline for mobile screens (optional)."
            label="Mobile Headline (Optional)"
            name="mobile_headline"
            placeholder="Soul of Kerala"
          />
          <AdminField
            defaultValue={banner?.mobile_description || ""}
            helperText="Shorter mobile description (optional)."
            label="Mobile Description (Optional)"
            name="mobile_description"
          />
        </div>
      </FormSection>

      {/* ACTIONS */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Link
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 text-xs font-semibold text-foreground hover:bg-secondary"
          href="/admin/hero-banners"
        >
          <ArrowLeft size={16} /> Cancel
        </Link>

        <Submit
          className="min-w-40"
          disabled={uploadingState.media || uploadingState.poster || uploadingState.mobile}
          label={banner?.id ? "Update Banner" : "Create Banner"}
          size="lg"
        />
      </div>
    </form>
  );
}
