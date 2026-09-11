"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Film,
  Plus,
  Trash2,
  X,
  ArrowUpRight,
  Edit2,
  CheckCircle2,
  EyeOff,
  Video,
  FileText,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import {
  saveFromOurKitchenContent,
  createKitchenReel,
  updateKitchenReel,
  deleteKitchenReel,
} from "@/actions/content";
import { AdminField, Submit } from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import type { FromOurKitchenContent, KitchenReel } from "@/lib/storefront/content";
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/youtube";

export function KitchenReelsManager({ initialData }: { initialData: FromOurKitchenContent }) {
  // Limit to max 3 reels
  const canAddReel = initialData.reels.length < 3;

  // Modal states
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Add reel state
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [instagramUrl, setInstagramUrl] = useState(initialData.instagramUrl || "https://www.instagram.com/namma_ada/");
  const [displayOrder, setDisplayOrder] = useState(initialData.reels.length + 1);
  const [isPublished, setIsPublished] = useState(true);

  // Edit reel state
  const [editingReel, setEditingReel] = useState<KitchenReel | null>(null);
  const [editYoutubeUrl, setEditYoutubeUrl] = useState("");
  const [editAlt, setEditAlt] = useState("");
  const [editInstagramUrl, setEditInstagramUrl] = useState("");
  const [editOrder, setEditOrder] = useState(1);
  const [editPublished, setEditPublished] = useState(true);

  const addParsedId = extractYouTubeId(youtubeUrl);
  const editParsedId = extractYouTubeId(editYoutubeUrl);

  const openEditModal = (reel: KitchenReel) => {
    setEditingReel(reel);
    setEditYoutubeUrl(reel.youtube_url || reel.video_url || "");
    setEditAlt(reel.alt_text);
    setEditInstagramUrl(reel.instagram_url);
    setEditOrder(reel.display_order);
    setEditPublished(reel.is_published);
    setEditModalOpen(true);
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
    setYoutubeUrl("");
    setAltText("");
    setDisplayOrder(initialData.reels.length + 1);
    setIsPublished(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingReel(null);
    setEditYoutubeUrl("");
  };

  return (
    <div className="space-y-8">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Instagram Reels ({initialData.reels.length}/3)
            </h2>
            {!canAddReel && (
              <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-0.5 text-xs font-semibold text-amber-700">
                Maximum 3 reels reached
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Showcase up to 3 featured videos on your storefront. Paste YouTube or Shorts URLs for video playback, and Instagram URLs to direct visitors when clicked.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            type="button"
            onClick={() => setCopyModalOpen(true)}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-semibold"
          >
            <FileText size={14} />
            <span>Edit section copy</span>
          </Button>

          {canAddReel ? (
            <button
              type="button"
              onClick={() => {
                setDisplayOrder(initialData.reels.length + 1);
                setAddModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 active:scale-[0.99] cursor-pointer"
            >
              <Plus size={16} />
              <span>+ Add reel</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              title="Maximum of 3 reels reached. Edit or delete an existing reel to add a new one."
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground border border-border cursor-not-allowed opacity-75"
            >
              <Plus size={16} />
              <span>+ Add reel (Max reached)</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of 3 Video Cards */}
      {initialData.reels.length === 0 ? (
        <Card className="p-10 sm:p-14 text-center border-dashed border-2 bg-secondary/15 rounded-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <Video size={32} />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            No Instagram reels published yet
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-6">
            Add up to 3 YouTube / Shorts videos and Instagram links to showcase on the storefront.
          </p>
          <Button
            type="button"
            onClick={() => setAddModalOpen(true)}
            size="md"
            className="gap-2 text-xs font-semibold"
          >
            <Plus size={16} />
            <span>+ Add first reel</span>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl">
          {initialData.reels.map((reel, index) => {
            const ytId = reel.youtube_id || extractYouTubeId(reel.youtube_url || reel.video_url);

            return (
              <Card
                key={reel.id}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col"
              >
                {/* VIDEO PREVIEW - Portrait 9:16 */}
                <div className="relative aspect-[9/16] w-full bg-black overflow-hidden group">
                  {ytId ? (
                    <iframe
                      src={getYouTubeEmbedUrl(ytId)}
                      title={reel.alt_text || `Reel #${reel.display_order}`}
                      className="h-full w-full border-0 pointer-events-auto"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : reel.video_url && !reel.video_url.includes("youtube") ? (
                    <video
                      controls
                      loop
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                      src={reel.video_url}
                    />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center text-muted-foreground bg-zinc-900">
                      <AlertCircle size={32} className="text-amber-500 mb-2" />
                      <p className="text-xs font-medium">Video preview unavailable</p>
                    </div>
                  )}

                  {/* Overlaid Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
                    <span className="rounded-md bg-black/80 px-2.5 py-1 text-xs font-bold text-white shadow-xs">
                      Reel #{reel.display_order || index + 1}
                    </span>

                    {reel.is_published ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/95 px-2 py-1 text-xs font-bold text-white shadow-xs">
                        <CheckCircle2 size={12} />
                        <span>Published</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white/80 backdrop-blur-xs">
                        <EyeOff size={12} />
                        <span>Draft</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Details & Actions */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div className="space-y-2">
                    <h3 className="font-display text-sm font-semibold text-foreground line-clamp-2" title={reel.alt_text}>
                      {reel.alt_text || "Namma Ada reel"}
                    </h3>

                    {/* YouTube URL indicator */}
                    {(reel.youtube_url || ytId) && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="font-medium text-zinc-600">YouTube:</span>
                        <a
                          href={reel.youtube_url || `https://www.youtube.com/watch?v=${ytId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline truncate max-w-[170px]"
                          title={reel.youtube_url || `https://www.youtube.com/watch?v=${ytId}`}
                        >
                          {reel.youtube_url || `youtube.com/watch?v=${ytId}`}
                        </a>
                      </div>
                    )}

                    {/* Instagram Post URL indicator */}
                    {reel.instagram_url && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="font-medium text-zinc-600">Instagram:</span>
                        <a
                          href={reel.instagram_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#711e2c] hover:underline font-medium truncate max-w-[170px] inline-flex items-center gap-0.5"
                          title={reel.instagram_url}
                        >
                          <span className="truncate">{reel.instagram_url}</span>
                          <ArrowUpRight size={11} className="shrink-0" />
                        </a>
                      </div>
                    )}

                    <p className="text-[11px] text-muted-foreground pt-0.5">
                      Display Order: #{reel.display_order}
                    </p>
                  </div>

                  {/* Action Buttons: [ Edit ] [ Delete ] */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/60 gap-2">
                    <Button
                      type="button"
                      onClick={() => openEditModal(reel)}
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs font-semibold gap-1.5"
                    >
                      <Edit2 size={12} />
                      <span>Edit</span>
                    </Button>

                    <ConfirmDialog
                      action={deleteKitchenReel}
                      confirmLabel="Delete"
                      description="Remove this reel permanently?"
                      hiddenFields={{ reel_id: reel.id }}
                      title="Delete reel?"
                      triggerBtn={
                        <Button
                          size="sm"
                          type="button"
                          variant="ghost"
                          className="h-8 px-2 text-xs font-semibold text-red-700 hover:bg-red-50 hover:text-red-800"
                        >
                          <Trash2 size={13} className="mr-1" />
                          <span>Delete</span>
                        </Button>
                      }
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. EDIT SECTION COPY MODAL */}
      {/* ==================================================================== */}
      {copyModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="fixed inset-0" onClick={() => setCopyModalOpen(false)} />

          <div className="relative z-10 flex flex-col w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                <h3 className="font-display text-base font-semibold text-foreground">
                  Edit Instagram Reels Section Copy
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setCopyModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form action={saveFromOurKitchenContent} className="p-6 space-y-4 overflow-y-auto">
              <AdminField
                defaultValue={initialData.label}
                label="Section label"
                name="label"
                placeholder="FROM OUR KITCHEN"
                required
              />

              <AdminField
                defaultValue={initialData.heading}
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
                  required
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField
                  defaultValue={initialData.instagramButtonText}
                  label="Instagram button text"
                  name="instagram_button_text"
                  placeholder="Follow us on Instagram"
                  required
                />
                <AdminField
                  defaultValue={initialData.instagramUrl}
                  label="Default Instagram URL"
                  name="instagram_url"
                  placeholder="https://www.instagram.com/namma_ada/"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  onClick={() => setCopyModalOpen(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
                <Submit label="Save section copy" size="sm" />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. ADD REEL MODAL (YOUTUBE URL + INSTAGRAM POST URL) */}
      {/* ==================================================================== */}
      {addModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="fixed inset-0" onClick={closeAddModal} />

          <div className="relative z-10 flex flex-col w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
              <div className="flex items-center gap-2">
                <Film size={18} className="text-primary" />
                <h3 className="font-display text-base font-semibold text-foreground">
                  Add New Reel (YouTube + Instagram)
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close modal"
                onClick={closeAddModal}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form action={createKitchenReel} className="p-6 space-y-5 overflow-y-auto">
              {/* YouTube Video URL */}
              <div>
                <AdminField
                  value={youtubeUrl}
                  helperText="Paste YouTube Shorts or standard YouTube link (e.g. https://www.youtube.com/shorts/VIDEO_ID or https://www.youtube.com/watch?v=VIDEO_ID)"
                  label="YouTube Video URL *"
                  name="youtube_url"
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/shorts/..."
                  required
                />

                {/* Live Preview Box */}
                {addParsedId ? (
                  <div className="mt-3 p-3 bg-secondary/30 rounded-xl border border-border flex items-center gap-4">
                    <div className="relative h-28 w-20 rounded-lg overflow-hidden border border-border bg-black shrink-0">
                      <Image
                        src={getYouTubeThumbnailUrl(addParsedId)}
                        alt="YouTube Video Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 size={13} />
                        <span>Valid YouTube video detected</span>
                      </p>
                      <p className="text-muted-foreground font-mono text-[11px]">ID: {addParsedId}</p>
                      <p className="text-muted-foreground text-[11px]">
                        This video will play inside the 9:16 vertical card on the website.
                      </p>
                    </div>
                  </div>
                ) : youtubeUrl.trim() ? (
                  <p className="mt-2 text-xs text-amber-700 flex items-center gap-1">
                    <AlertCircle size={13} />
                    <span>Could not extract YouTube ID. Please check the URL format.</span>
                  </p>
                ) : null}
              </div>

              {/* Instagram Post URL */}
              <AdminField
                defaultValue={instagramUrl}
                helperText="Where the visitor goes when they click/tap the reel card"
                label="Instagram Post URL *"
                name="instagram_url"
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://www.instagram.com/reel/..."
                required
              />

              {/* Alt text / Title */}
              <AdminField
                defaultValue={altText}
                label="Title / Description *"
                name="alt_text"
                onChange={(e) => setAltText(e.target.value)}
                placeholder="e.g. Freshly prepared payasam at Namma Ada kitchen"
                required
              />

              {/* Order and Publish flags */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <AdminField
                  defaultValue={displayOrder}
                  label="Display order"
                  name="display_order"
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  type="number"
                />

                <div className="flex flex-col justify-center pt-2">
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_published"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-primary/30"
                    />
                    <span>Active / Published</span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  onClick={closeAddModal}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
                <Submit label="Save reel" size="sm" />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. EDIT REEL MODAL */}
      {/* ==================================================================== */}
      {editModalOpen && editingReel && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="fixed inset-0" onClick={closeEditModal} />

          <div className="relative z-10 flex flex-col w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
              <h3 className="font-display text-base font-semibold text-foreground">
                Edit Reel #{editingReel.display_order}
              </h3>
              <button
                type="button"
                aria-label="Close modal"
                onClick={closeEditModal}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form action={updateKitchenReel} className="p-6 space-y-5 overflow-y-auto">
              <input name="reel_id" type="hidden" value={editingReel.id} />

              {/* YouTube URL */}
              <div>
                <AdminField
                  value={editYoutubeUrl}
                  helperText="YouTube Shorts or standard YouTube URL"
                  label="YouTube Video URL *"
                  name="youtube_url"
                  onChange={(e) => setEditYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/shorts/..."
                  required
                />

                {editParsedId ? (
                  <div className="mt-3 p-3 bg-secondary/30 rounded-xl border border-border flex items-center gap-4">
                    <div className="relative h-28 w-20 rounded-lg overflow-hidden border border-border bg-black shrink-0">
                      <Image
                        src={getYouTubeThumbnailUrl(editParsedId)}
                        alt="YouTube Video Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 size={13} />
                        <span>Valid YouTube video detected</span>
                      </p>
                      <p className="text-muted-foreground font-mono text-[11px]">ID: {editParsedId}</p>
                    </div>
                  </div>
                ) : editYoutubeUrl.trim() ? (
                  <p className="mt-2 text-xs text-amber-700 flex items-center gap-1">
                    <AlertCircle size={13} />
                    <span>Could not extract YouTube ID. Please verify the URL.</span>
                  </p>
                ) : null}
              </div>

              {/* Instagram URL */}
              <AdminField
                defaultValue={editInstagramUrl}
                helperText="Link to the Instagram post/reel opened on click"
                label="Instagram Post URL *"
                name="instagram_url"
                onChange={(e) => setEditInstagramUrl(e.target.value)}
                placeholder="https://www.instagram.com/reel/..."
                required
              />

              {/* Alt text / Title */}
              <AdminField
                defaultValue={editAlt}
                label="Title / Description *"
                name="alt_text"
                onChange={(e) => setEditAlt(e.target.value)}
                placeholder="Description of the video"
                required
              />

              {/* Order and Publish toggle */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <AdminField
                  defaultValue={editOrder}
                  label="Display order"
                  name="display_order"
                  onChange={(e) => setEditOrder(Number(e.target.value))}
                  type="number"
                />

                <div className="flex flex-col justify-center pt-2">
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_published"
                      checked={editPublished}
                      onChange={(e) => setEditPublished(e.target.checked)}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-primary/30"
                    />
                    <span>Active / Published</span>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
                <ConfirmDialog
                  action={deleteKitchenReel}
                  confirmLabel="Delete reel"
                  description="Are you sure you want to delete this reel permanently?"
                  hiddenFields={{ reel_id: editingReel.id }}
                  title="Delete reel?"
                  triggerBtn={
                    <Button
                      size="sm"
                      type="button"
                      variant="ghost"
                      className="text-red-700 hover:bg-red-50 text-xs font-semibold"
                    >
                      <Trash2 size={13} className="mr-1" />
                      <span>Delete reel</span>
                    </Button>
                  }
                />

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    onClick={closeEditModal}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Submit label="Save changes" size="sm" />
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
