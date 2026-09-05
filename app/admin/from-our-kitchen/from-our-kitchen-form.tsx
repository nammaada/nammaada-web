"use client";

import { useState, useRef } from "react";
import {
  Film,
  Plus,
  Trash2,
  RefreshCw,
  X,
  UploadCloud,
  Camera,
  ArrowUpRight,
  Play,
} from "lucide-react";
import {
  saveFromOurKitchenContent,
  uploadReelVideo,
  deleteReelVideo,
} from "@/actions/content";
import { AdminField, FormSection, Submit } from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import type { FromOurKitchenContent } from "@/lib/storefront/content";

export function FromOurKitchenForm({ initialData }: { initialData: FromOurKitchenContent }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      if (!altText) {
        setAltText("Namma Ada kitchen authentic preparation");
      }
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setAltText("");
  };

  return (
    <div className="space-y-8">
      {/* 1. Main Text Content Form */}
      <Card className="p-6 sm:p-8 shadow-xs border border-border">
        <form action={saveFromOurKitchenContent} className="space-y-6">
          <FormSection
            description="Edit the homepage Instagram section copy, heading, and Instagram profile button."
            title="Section Content"
          >
            <div className="grid gap-5">
              <AdminField
                defaultValue={initialData.label}
                helperText="Eyebrow text displayed above the main heading (e.g. FROM OUR KITCHEN)"
                label="Section label"
                name="label"
                placeholder="FROM OUR KITCHEN"
                required
              />

              <AdminField
                defaultValue={initialData.heading}
                helperText="Primary statement inviting customers to view the kitchen"
                label="Heading"
                name="heading"
                placeholder="A glimpse of what's being made."
                required
              />

              <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                <span className="flex items-center gap-1">
                  Description <span className="text-red-800 text-xs">*</span>
                </span>
                <textarea
                  className="min-h-24 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm font-normal text-foreground placeholder:text-muted-foreground/60 transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none leading-relaxed"
                  defaultValue={initialData.description}
                  name="description"
                  placeholder="A curated look at Namma Ada's kitchen will be shared here soon."
                  required
                />
                <span className="text-xs font-normal text-muted-foreground">
                  Descriptive text displayed under the heading
                </span>
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <AdminField
                  defaultValue={initialData.instagramButtonText}
                  helperText="Call-to-action button text"
                  label="Instagram button text"
                  name="instagram_button_text"
                  placeholder="Follow us on Instagram"
                  required
                />

                <AdminField
                  defaultValue={initialData.instagramUrl}
                  helperText="Direct URL to your Instagram profile (opened when user clicks the button)"
                  label="Instagram URL"
                  name="instagram_url"
                  placeholder="https://www.instagram.com/namma_ada/"
                  required
                />
              </div>
            </div>
          </FormSection>

          <div className="flex items-center justify-end pt-4 border-t border-border">
            <Submit label="Save changes" size="lg" />
          </div>
        </form>
      </Card>

      {/* 2. Reel Video Management */}
      <Card className="p-6 sm:p-8 shadow-xs border border-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Instagram Reel Video
              </h2>
              {initialData.reelVideoUrl ? (
                <span className="rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300/60 px-2.5 py-0.5 text-xs font-semibold">
                  Active
                </span>
              ) : (
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                  No video
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              Upload a portrait Instagram reel video to display in the &quot;From Our Kitchen&quot; section on the homepage.
            </p>
          </div>

          {!initialData.reelVideoUrl && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 active:scale-[0.99] cursor-pointer shrink-0"
            >
              <Plus size={16} />
              <span>+ Add reel video</span>
            </button>
          )}
        </div>

        {/* Video Content State */}
        {initialData.reelVideoUrl ? (
          <div className="grid gap-6 md:grid-cols-[260px_1fr] items-start">
            {/* Reel Video Player Preview */}
            <div className="relative aspect-[9/16] w-full max-w-[260px] mx-auto md:mx-0 overflow-hidden rounded-2xl border border-border bg-black shadow-md">
              <video
                controls
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
                src={initialData.reelVideoUrl}
              />
            </div>

            {/* Reel Info & Actions */}
            <div className="space-y-4">
              <div className="rounded-xl bg-secondary/30 p-4 border border-border/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Film size={15} className="text-primary" />
                  <span>Reel Video Active</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This video is currently being displayed on the storefront homepage inside the &quot;From Our Kitchen&quot; showcase.
                </p>
                {initialData.reelVideoAltText && (
                  <p className="text-xs text-muted-foreground pt-1">
                    <strong className="text-foreground">Alt text / Description:</strong> {initialData.reelVideoAltText}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs font-semibold"
                >
                  <RefreshCw size={13} />
                  <span>Replace reel video</span>
                </Button>

                <ConfirmDialog
                  action={deleteReelVideo}
                  confirmLabel="Delete video"
                  description="Are you sure you want to remove the Instagram reel video? The homepage will revert to the clean standard presentation."
                  title="Delete reel video?"
                  triggerBtn={
                    <Button
                      size="sm"
                      type="button"
                      variant="ghost"
                      className="gap-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 hover:text-red-800"
                    >
                      <Trash2 size={13} />
                      <span>Delete video</span>
                    </Button>
                  }
                />

                <a
                  href={initialData.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline ml-auto"
                >
                  <Camera size={14} />
                  <span>View Instagram profile</span>
                  <ArrowUpRight size={12} />
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="rounded-2xl border border-dashed border-border/80 bg-secondary/15 p-8 sm:p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
              <Film size={28} />
            </div>
            <h3 className="font-display text-base font-semibold text-foreground">
              No reel video uploaded yet
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-5">
              Upload a short portrait reel video from your kitchen to give visitors a live, mouth-watering look at your craft.
            </p>
            <Button
              type="button"
              onClick={() => setModalOpen(true)}
              variant="outline"
              className="gap-2 text-xs font-semibold"
            >
              <Plus size={15} />
              <span>+ Add reel video</span>
            </Button>
          </div>
        )}
      </Card>

      {/* ==================================================================== */}
      {/* 3. ONE CLEAN ADD/REPLACE VIDEO MODAL */}
      {/* ==================================================================== */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="fixed inset-0" onClick={closeModal} />

          <div className="relative z-10 flex flex-col w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Film size={18} />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground">
                  {initialData.reelVideoUrl ? "Replace Reel Video" : "Add Reel Video"}
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close modal"
                onClick={closeModal}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form
              action={uploadReelVideo}
              className="p-6 space-y-5 overflow-y-auto"
            >
              {/* Video File Dropzone / Picker */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex flex-col items-center justify-center rounded-xl border border-dashed border-border/90 bg-secondary/25 p-5 text-center transition-colors hover:border-primary/60 hover:bg-secondary/40 cursor-pointer overflow-hidden"
              >
                <input
                  ref={fileInputRef}
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  name="video_file"
                  onChange={handleFileChange}
                  type="file"
                  required
                />

                {previewUrl ? (
                  <div className="relative h-60 w-36 rounded-lg overflow-hidden border border-border bg-black">
                    <video
                      controls
                      className="h-full w-full object-cover"
                      src={previewUrl}
                    />
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                      <RefreshCw size={14} />
                      <span>Change file</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-5">
                    <UploadCloud
                      size={32}
                      className="mx-auto text-primary mb-2 transition-transform group-hover:scale-110"
                    />
                    <p className="text-xs font-semibold text-foreground">
                      Click to choose reel video
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      MP4, WebM, or MOV (up to 25 MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Alt Text Input */}
              <AdminField
                defaultValue={altText}
                helperText="Accessible description of the reel video"
                label="Video description / alt text"
                name="alt_text"
                onChange={(e) => setAltText(e.target.value)}
                placeholder="e.g. Traditional Ada preparation at Namma Ada kitchen"
              />

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  onClick={closeModal}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
                <Submit label="Upload reel video" size="sm" />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
