"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Star,
  RefreshCw,
  X,
  UploadCloud,
  Edit2,
  FileText,
  ImageIcon,
} from "lucide-react";
import {
  saveWhoWeAreContent,
  uploadWhoWeAreImage,
  updateWhoWeAreImage,
  deleteWhoWeAreImage,
  replaceWhoWeAreImage,
} from "@/actions/content";
import { AdminField, Submit } from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import type { WhoWeAreContent, WhoWeAreImage } from "@/lib/storefront/content";

export function OurStoryForm({ initialData }: { initialData: WhoWeAreContent }) {
  // Modal states
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);

  // Add image state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [isPrimary, setIsPrimary] = useState(initialData.images.length === 0);

  // Edit image state
  const [editingImage, setEditingImage] = useState<WhoWeAreImage | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);
  const [editAlt, setEditAlt] = useState("");
  const [editOrder, setEditOrder] = useState(1);
  const [editPrimary, setEditPrimary] = useState(false);

  // Replace image state
  const [replacingImage, setReplacingImage] = useState<WhoWeAreImage | null>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replacePreviewUrl, setReplacePreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
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

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditFile(file);
      setEditPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleReplaceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReplaceFile(file);
      setReplacePreviewUrl(URL.createObjectURL(file));
    }
  };

  const openEditModal = (img: WhoWeAreImage) => {
    setEditingImage(img);
    setEditFile(null);
    setEditPreviewUrl(null);
    setEditAlt(img.alt_text);
    setEditOrder(img.display_order);
    setEditPrimary(img.is_primary);
    setEditModalOpen(true);
  };

  const openReplaceModal = (img: WhoWeAreImage) => {
    setReplacingImage(img);
    setReplaceFile(null);
    setReplacePreviewUrl(null);
    setReplaceModalOpen(true);
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setAltText("");
    setIsPrimary(initialData.images.length === 0);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingImage(null);
    setEditFile(null);
    setEditPreviewUrl(null);
  };

  const closeReplaceModal = () => {
    setReplaceModalOpen(false);
    setReplacingImage(null);
    setReplaceFile(null);
    setReplacePreviewUrl(null);
  };

  return (
    <div className="space-y-8">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Our Story Images ({initialData.images.length}/3)
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Each card represents an individual showcase image on the homepage. Edit, replace, or set primary with large visual previews.
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

          {initialData.images.length < 3 && (
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 active:scale-[0.99] cursor-pointer"
            >
              <Plus size={16} />
              <span>+ Add image</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Large Media Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {initialData.images.map((image, index) => {
          const orderLabel = index === 0 ? "Image 1" : index === 1 ? "Image 2" : "Image 3";

          return (
            <Card
              key={image.id}
              className={`group overflow-hidden rounded-2xl border transition-all bg-card flex flex-col shadow-xs ${
                image.is_primary
                  ? "border-primary/60 ring-2 ring-primary/20"
                  : "border-border hover:border-primary/40 hover:shadow-md"
              }`}
            >
              {/* LARGE IMAGE PREVIEW - Edge to Edge in container */}
              <div className="relative aspect-[4/3] w-full bg-muted/40 overflow-hidden">
                <Image
                  alt={image.alt_text}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  src={image.secure_url}
                  priority
                />

                {/* Overlaid Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                  <span className="rounded-md bg-black/80 px-2.5 py-1 text-xs font-bold text-white shadow-xs">
                    {orderLabel}
                  </span>
                  {image.is_primary && (
                    <span className="rounded-md bg-amber-400 px-2.5 py-1 text-xs font-bold text-black flex items-center gap-1 shadow-xs">
                      <Star size={12} className="fill-black" />
                      <span>Primary</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Card Details & Actions */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    Alt description
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5 line-clamp-2" title={image.alt_text}>
                    {image.alt_text || "Kerala delicacy authentic preparation"}
                  </p>
                </div>

                {/* Action Buttons: [ Edit ] [ Replace ] [ Delete ] */}
                <div className="flex items-center justify-between pt-3 border-t border-border/60 gap-2">
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      onClick={() => openEditModal(image)}
                      variant="outline"
                      size="sm"
                      className="h-8 px-2.5 text-xs font-semibold gap-1"
                    >
                      <Edit2 size={12} />
                      <span>Edit</span>
                    </Button>

                    <Button
                      type="button"
                      onClick={() => openReplaceModal(image)}
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground gap-1"
                    >
                      <RefreshCw size={12} />
                      <span>Replace</span>
                    </Button>
                  </div>

                  <ConfirmDialog
                    action={deleteWhoWeAreImage}
                    confirmLabel="Delete"
                    description="Remove this image from Our Story?"
                    hiddenFields={{ image_id: image.id }}
                    title="Delete image?"
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

        {/* Add Image Slot if fewer than 3 */}
        {initialData.images.length < 3 && (
          <div
            onClick={() => setAddModalOpen(true)}
            className="group flex flex-col items-center justify-center aspect-[4/3] rounded-2xl border-2 border-dashed border-border/90 bg-secondary/15 p-6 text-center hover:border-primary/60 hover:bg-secondary/35 transition-all cursor-pointer shadow-2xs min-h-[260px]"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3 transition-transform group-hover:scale-110">
              <Plus size={28} />
            </div>
            <p className="text-sm font-semibold text-foreground">
              + Add Image {initialData.images.length + 1}
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
              Upload a large showcase photo
            </p>
          </div>
        )}
      </div>

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
                  Edit Our Story Copy
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

            <form action={saveWhoWeAreContent} className="p-6 space-y-4 overflow-y-auto">
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
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField
                  defaultValue={initialData.buttonText}
                  label="Button text"
                  name="button_text"
                  placeholder="Read our story"
                  required
                />
                <AdminField
                  defaultValue={initialData.buttonUrl}
                  label="Button URL"
                  name="button_url"
                  placeholder="/about"
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
                <Submit label="Save copy changes" size="sm" />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. ADD IMAGE MODAL (LARGE PREVIEW) */}
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
                <ImageIcon size={18} className="text-primary" />
                <h3 className="font-display text-base font-semibold text-foreground">
                  Add Our Story Image
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

            <form action={uploadWhoWeAreImage} className="p-6 space-y-5 overflow-y-auto">
              {/* LARGE Image Dropzone / Preview */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/90 bg-secondary/25 p-3 text-center transition-colors hover:border-primary/60 hover:bg-secondary/40 cursor-pointer overflow-hidden"
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
                  <div className="relative h-72 sm:h-80 w-full rounded-xl overflow-hidden bg-black/5">
                    <Image
                      alt="Preview"
                      className="object-contain"
                      fill
                      src={previewUrl}
                    />
                    <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                      <RefreshCw size={15} />
                      <span>Click to change file</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-12">
                    <UploadCloud
                      size={40}
                      className="mx-auto text-primary mb-3 transition-transform group-hover:scale-110"
                    />
                    <p className="text-sm font-semibold text-foreground">
                      Click to choose image file
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPEG, PNG, WebP, AVIF up to 10 MB
                    </p>
                  </div>
                )}
              </div>

              {/* Alt Text */}
              <AdminField
                defaultValue={altText}
                label="Alt text"
                name="alt_text"
                onChange={(e) => setAltText(e.target.value)}
                placeholder="e.g. Handcrafted Kerala Banana Chips freshly made"
                required
              />

              {/* Primary checkbox */}
              <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer pt-1">
                <input
                  type="checkbox"
                  name="is_primary"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary/30"
                />
                <span>Set as primary / main showcase image</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  onClick={closeAddModal}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
                <Submit label="Save and add image" size="sm" />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. EDIT IMAGE MODAL (LARGE PREVIEW) */}
      {/* ==================================================================== */}
      {editModalOpen && editingImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="fixed inset-0" onClick={closeEditModal} />

          <div className="relative z-10 flex flex-col w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-semibold text-foreground">
                  Edit Image Details
                </h3>
                {editingImage.is_primary && (
                  <span className="rounded bg-amber-400 text-black text-[11px] font-bold px-2 py-0.5">
                    Primary
                  </span>
                )}
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={closeEditModal}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form action={updateWhoWeAreImage} className="p-6 space-y-5 overflow-y-auto">
              <input name="image_id" type="hidden" value={editingImage.id} />

              {/* Large Image Preview */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-foreground">Image Preview</p>
                <div
                  onClick={() => editFileInputRef.current?.click()}
                  className="group relative h-72 sm:h-80 w-full rounded-xl overflow-hidden border border-border bg-black/5 flex items-center justify-center cursor-pointer"
                >
                  <Image
                    alt={editAlt || "Preview"}
                    className="object-contain"
                    fill
                    src={editPreviewUrl || editingImage.secure_url}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-2">
                    <RefreshCw size={15} />
                    <span>Click to choose replacement file</span>
                  </div>
                </div>

                <input
                  ref={editFileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  name="image_file"
                  onChange={handleEditFileChange}
                  type="file"
                />

                <p className="text-[11px] text-muted-foreground">
                  {editFile ? `Selected: ${editFile.name}` : "Click preview above if you want to replace this image file."}
                </p>
              </div>

              {/* Alt Text */}
              <AdminField
                defaultValue={editAlt}
                label="Alt text"
                name="alt_text"
                onChange={(e) => setEditAlt(e.target.value)}
                placeholder="Accessible description of the photo"
                required
              />

              {/* Order and Primary Controls */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <AdminField
                  defaultValue={editOrder}
                  helperText="Position (1, 2, 3)"
                  label="Display order"
                  name="display_order"
                  onChange={(e) => setEditOrder(Number(e.target.value))}
                  type="number"
                />

                <div className="flex flex-col justify-center pt-2">
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_primary"
                      checked={editPrimary}
                      onChange={(e) => setEditPrimary(e.target.checked)}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-primary/30"
                    />
                    <span>Set as primary showcase image</span>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
                <ConfirmDialog
                  action={deleteWhoWeAreImage}
                  confirmLabel="Delete image"
                  description="Are you sure you want to delete this image permanently?"
                  hiddenFields={{ image_id: editingImage.id }}
                  title="Delete image?"
                  triggerBtn={
                    <Button
                      size="sm"
                      type="button"
                      variant="ghost"
                      className="text-red-700 hover:bg-red-50 text-xs font-semibold"
                    >
                      <Trash2 size={13} className="mr-1" />
                      <span>Delete image</span>
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

      {/* ==================================================================== */}
      {/* 4. REPLACE IMAGE MODAL (QUICK ACTION) */}
      {/* ==================================================================== */}
      {replaceModalOpen && replacingImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="fixed inset-0" onClick={closeReplaceModal} />

          <div className="relative z-10 flex flex-col w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
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

            <form action={replaceWhoWeAreImage} className="p-6 space-y-4">
              <input name="image_id" type="hidden" value={replacingImage.id} />

              <div
                onClick={() => replaceFileInputRef.current?.click()}
                className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/20 p-4 text-center hover:border-primary/60 cursor-pointer overflow-hidden"
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
                  <div className="relative h-64 sm:h-72 w-full rounded-lg overflow-hidden bg-black/5">
                    <Image
                      alt="Replacement Preview"
                      className="object-contain"
                      fill
                      src={replacePreviewUrl}
                    />
                  </div>
                ) : (
                  <div className="py-10">
                    <RefreshCw size={32} className="mx-auto text-primary mb-2" />
                    <p className="text-sm font-semibold text-foreground">
                      Click to choose replacement file
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPEG, PNG, WebP, AVIF up to 10 MB
                    </p>
                  </div>
                )}
              </div>

              <AdminField
                defaultValue={replacingImage.alt_text}
                label="Alt text"
                name="alt_text"
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
    </div>
  );
}
