"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  ImageIcon,
  Plus,
  Trash2,
  Star,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  X,
  UploadCloud,
  Check,
  Edit2,
} from "lucide-react";
import {
  saveWhoWeAreContent,
  uploadWhoWeAreImage,
  deleteWhoWeAreImage,
  replaceWhoWeAreImage,
  setPrimaryWhoWeAreImage,
  reorderWhoWeAreImages,
  updateWhoWeAreImageAlt,
} from "@/actions/content";
import { AdminField, FormSection, Submit } from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import type { WhoWeAreContent, WhoWeAreImage } from "@/lib/storefront/content";

export function WhoWeAreForm({ initialData }: { initialData: WhoWeAreContent }) {
  // Add modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [isPrimary, setIsPrimary] = useState(initialData.images.length === 0);

  // Replace modal state
  const [replaceTarget, setReplaceTarget] = useState<WhoWeAreImage | null>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replacePreviewUrl, setReplacePreviewUrl] = useState<string | null>(null);
  const [replaceAlt, setReplaceAlt] = useState("");

  // Edit Alt modal/popover state
  const [editingAltTarget, setEditingAltTarget] = useState<WhoWeAreImage | null>(null);
  const [editedAlt, setEditedAlt] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      if (!altText) {
        setAltText(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleReplaceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReplaceFile(file);
      setReplacePreviewUrl(URL.createObjectURL(file));
    }
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setAltText("");
    setIsPrimary(initialData.images.length === 0);
  };

  const closeReplaceModal = () => {
    setReplaceTarget(null);
    setReplaceFile(null);
    setReplacePreviewUrl(null);
    setReplaceAlt("");
  };

  return (
    <div className="space-y-8">
      {/* 1. Main Text Content Form */}
      <Card className="p-6 sm:p-8 shadow-xs border border-border">
        <form action={saveWhoWeAreContent} className="space-y-6">
          <FormSection
            description="Edit the homepage Who We Are copy, section heading, and call-to-action link."
            title="Section Content"
          >
            <div className="grid gap-5">
              <AdminField
                defaultValue={initialData.label}
                helperText="Eyebrow text displayed above the main heading (e.g. WHO WE ARE)"
                label="Section label"
                name="label"
                placeholder="WHO WE ARE"
                required
              />

              <AdminField
                defaultValue={initialData.heading}
                helperText="Primary statement describing your brand's heritage"
                label="Heading"
                name="heading"
                placeholder="A little taste of home, made with a whole lot of love."
                required
              />

              <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                <span className="flex items-center gap-1">
                  Description <span className="text-red-800 text-xs">*</span>
                </span>
                <textarea
                  className="min-h-28 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm font-normal text-foreground placeholder:text-muted-foreground/60 transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none leading-relaxed"
                  defaultValue={initialData.description}
                  name="description"
                  placeholder="Namma Ada is a Bangalore-based Kerala delicacy brand..."
                  required
                />
                <span className="text-xs font-normal text-muted-foreground">
                  The brand story text shown on the homepage
                </span>
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <AdminField
                  defaultValue={initialData.buttonText}
                  helperText="Link text (e.g. Read our story)"
                  label="Button text"
                  name="button_text"
                  placeholder="Read our story"
                  required
                />
                <AdminField
                  defaultValue={initialData.buttonUrl}
                  helperText="Target link path (e.g. /about)"
                  label="Button URL"
                  name="button_url"
                  placeholder="/about"
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

      {/* 2. Image Management Gallery */}
      <Card className="p-6 sm:p-8 shadow-xs border border-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Section Images
              </h2>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-primary">
                {initialData.images.length}/3 uploaded
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              Upload up to 3 images showcasing your Kerala delicacies. The primary image is the main visual on the homepage card.
            </p>
          </div>

          {initialData.images.length < 3 && (
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 active:scale-[0.99] cursor-pointer shrink-0"
            >
              <Plus size={16} />
              <span>+ Add image</span>
            </button>
          )}
        </div>

        {/* Gallery Grid */}
        {initialData.images.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-secondary/15 p-8 sm:p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
              <ImageIcon size={28} />
            </div>
            <h3 className="font-display text-base font-semibold text-foreground">
              No custom images added yet
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-5">
              The homepage currently shows the default geometric Kerala diamond artwork. Upload up to 3 custom photos to showcase your kitchen.
            </p>
            <Button
              type="button"
              onClick={() => setAddModalOpen(true)}
              variant="outline"
              className="gap-2 text-xs font-semibold"
            >
              <Plus size={15} />
              <span>Upload first image</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {initialData.images.map((image, index) => {
              const isFirst = index === 0;
              const isLast = index === initialData.images.length - 1;
              const orderLabel = index === 0 ? "1. Main image" : index === 1 ? "2. Second image" : "3. Third image";

              return (
                <div
                  key={image.id}
                  className={`group relative flex flex-col rounded-2xl border transition-all overflow-hidden bg-card shadow-xs ${
                    image.is_primary
                      ? "border-primary/50 ring-2 ring-primary/20"
                      : "border-border hover:border-border/80"
                  }`}
                >
                  {/* Image Thumbnail */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/40">
                    <Image
                      alt={image.alt_text}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      src={image.secure_url}
                    />

                    {/* Order & Primary Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
                      <span className="rounded-md bg-black/65 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-xs">
                        {orderLabel}
                      </span>
                      {image.is_primary && (
                        <span className="rounded-md bg-amber-500/90 px-2 py-0.5 text-[11px] font-bold text-black flex items-center gap-1 backdrop-blur-xs">
                          <Star size={11} className="fill-black" />
                          <span>Primary</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content & Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground line-clamp-1" title={image.alt_text}>
                        <strong className="text-foreground">Alt text:</strong> {image.alt_text}
                      </p>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-border/60">
                      {/* Set Primary Button */}
                      {!image.is_primary && (
                        <form action={setPrimaryWhoWeAreImage}>
                          <input name="image_id" type="hidden" value={image.id} />
                          <button
                            type="submit"
                            title="Set as primary main image"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer py-1"
                          >
                            <Star size={12} />
                            <span>Set primary</span>
                          </button>
                        </form>
                      )}

                      {/* Reorder Buttons */}
                      <div className="flex items-center gap-1">
                        {!isFirst && (
                          <form action={reorderWhoWeAreImages}>
                            <input name="image_id" type="hidden" value={image.id} />
                            <input name="direction" type="hidden" value="up" />
                            <Button
                              aria-label="Move left"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              size="sm"
                              type="submit"
                              variant="ghost"
                            >
                              <ArrowLeft size={13} />
                            </Button>
                          </form>
                        )}
                        {!isLast && (
                          <form action={reorderWhoWeAreImages}>
                            <input name="image_id" type="hidden" value={image.id} />
                            <input name="direction" type="hidden" value="down" />
                            <Button
                              aria-label="Move right"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              size="sm"
                              type="submit"
                              variant="ghost"
                            >
                              <ArrowRight size={13} />
                            </Button>
                          </form>
                        )}
                      </div>

                      <div className="flex items-center gap-1 ml-auto">
                        {/* Edit Alt button */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAltTarget(image);
                            setEditedAlt(image.alt_text);
                          }}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
                          title="Edit alt text"
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Replace button */}
                        <button
                          type="button"
                          onClick={() => {
                            setReplaceTarget(image);
                            setReplaceAlt(image.alt_text);
                          }}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
                          title="Replace image"
                        >
                          <RefreshCw size={13} />
                        </button>

                        {/* Delete button */}
                        <ConfirmDialog
                          action={deleteWhoWeAreImage}
                          confirmLabel="Delete"
                          description="Are you sure you want to remove this image from the Who We Are section?"
                          hiddenFields={{ image_id: image.id }}
                          title="Delete image?"
                          triggerBtn={
                            <Button
                              aria-label="Delete image"
                              className="h-7 w-7 p-0 text-red-700 hover:bg-red-50 hover:text-red-800"
                              size="sm"
                              type="button"
                              variant="ghost"
                            >
                              <Trash2 size={13} />
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ==================================================================== */}
      {/* 3. ONE CLEAN ADD IMAGE MODAL / POP-UP */}
      {/* ==================================================================== */}
      {addModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="fixed inset-0" onClick={closeAddModal} />

          <div className="relative z-10 flex flex-col w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ImageIcon size={18} />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground">
                  Add Who We Are Image
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

            <form
              action={uploadWhoWeAreImage}
              className="p-6 space-y-5 overflow-y-auto"
            >
              {/* File Dropzone / Picker */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex flex-col items-center justify-center rounded-xl border border-dashed border-border/90 bg-secondary/25 p-5 text-center transition-colors hover:border-primary/60 hover:bg-secondary/40 cursor-pointer overflow-hidden"
              >
                <input
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  name="image_file"
                  onChange={handleFileChange}
                  type="file"
                  required
                />

                {previewUrl ? (
                  <div className="relative h-44 w-full rounded-lg overflow-hidden border border-border/80">
                    <Image
                      alt="Preview"
                      className="object-cover"
                      fill
                      src={previewUrl}
                    />
                    <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                      <RefreshCw size={14} />
                      <span>Change photo</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                    <UploadCloud
                      size={28}
                      className="mx-auto text-primary mb-2 transition-transform group-hover:scale-110"
                    />
                    <p className="text-xs font-semibold text-foreground">
                      Click to choose an image
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      JPEG, PNG, WebP, AVIF up to 10 MB
                    </p>
                  </div>
                )}
              </div>

              {/* Alt Text Input */}
              <label className="grid gap-1.5 text-sm font-semibold text-foreground">
                <span className="flex items-center gap-1">
                  Alt text <span className="text-red-800 text-xs">*</span>
                </span>
                <input
                  className="min-h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm font-normal text-foreground placeholder:text-muted-foreground/60 transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
                  name="alt_text"
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="e.g. Handcrafted Kerala Ada freshly made"
                  required
                  value={altText}
                />
                <span className="text-[11px] font-normal text-muted-foreground">
                  Accessible description for screen readers and SEO
                </span>
              </label>

              {/* Primary Image Checkbox */}
              <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer pt-1">
                <input
                  type="checkbox"
                  name="is_primary"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary/30"
                />
                <span>Set as primary / main image</span>
              </label>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  onClick={closeAddModal}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
                <Submit label="Upload image" size="sm" />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. REPLACE IMAGE MODAL */}
      {/* ==================================================================== */}
      {replaceTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="fixed inset-0" onClick={closeReplaceModal} />

          <div className="relative z-10 flex flex-col w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
              <h3 className="font-display text-base font-semibold text-foreground">
                Replace Image
              </h3>
              <button
                type="button"
                aria-label="Close"
                onClick={closeReplaceModal}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form
              action={replaceWhoWeAreImage}
              className="p-6 space-y-4"
            >
              <input name="image_id" type="hidden" value={replaceTarget.id} />

              <div
                onClick={() => replaceFileInputRef.current?.click()}
                className="relative flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/20 p-5 text-center hover:border-primary/60 cursor-pointer overflow-hidden"
              >
                <input
                  ref={replaceFileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  name="image_file"
                  onChange={handleReplaceFileChange}
                  type="file"
                  required
                />

                {replacePreviewUrl ? (
                  <div className="relative h-44 w-full rounded-lg overflow-hidden">
                    <Image
                      alt="Replacement Preview"
                      className="object-cover"
                      fill
                      src={replacePreviewUrl}
                    />
                  </div>
                ) : (
                  <div className="py-4">
                    <RefreshCw size={24} className="mx-auto text-primary mb-2" />
                    <p className="text-xs font-semibold text-foreground">
                      Choose replacement file
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      JPEG, PNG, WebP, AVIF
                    </p>
                  </div>
                )}
              </div>

              <AdminField
                defaultValue={replaceAlt}
                label="Alt text"
                name="alt_text"
                onChange={(e) => setReplaceAlt(e.target.value)}
              />

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  onClick={closeReplaceModal}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
                <Submit label="Confirm replace" size="sm" />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. EDIT ALT TEXT MODAL */}
      {/* ==================================================================== */}
      {editingAltTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="fixed inset-0" onClick={() => setEditingAltTarget(null)} />

          <div className="relative z-10 flex flex-col w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
              <h3 className="font-display text-base font-semibold text-foreground">
                Edit Alt Text
              </h3>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setEditingAltTarget(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form
              action={updateWhoWeAreImageAlt}
              className="p-6 space-y-4"
            >
              <input name="image_id" type="hidden" value={editingAltTarget.id} />

              <AdminField
                defaultValue={editedAlt}
                label="Image alt text"
                name="alt_text"
                required
              />

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  onClick={() => setEditingAltTarget(null)}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
                <Submit label="Save alt text" size="sm" />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
