"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { UploadCloud, Star, RefreshCw, Trash2, X, ImageIcon, Check } from "lucide-react";
import {
  deleteProductImage,
  replaceProductImage,
  setPrimaryImage,
  updateProductImage,
  uploadProductImage,
} from "@/actions/admin";
import { AdminField, Submit } from "@/components/admin/admin-form";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";

export type ImageRow = {
  id: string;
  product_id: string;
  cloudinary_public_id: string;
  alt_text: string;
  display_order: number;
  is_primary: boolean;
  thumbnailUrl: string;
};

export function ImageModal({
  productId,
  images,
}: {
  productId: string;
  images: ImageRow[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [replacingId, setReplacingId] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const primaryImage = images.find((img) => img.is_primary) ?? images[0];

  return (
    <>
      {/* Compact Trigger Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group inline-flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground shadow-xs transition-all hover:border-primary/50 hover:bg-secondary/60 active:scale-[0.99] cursor-pointer"
        >
          {primaryImage ? (
            <div className="relative h-6 w-8 shrink-0 overflow-hidden rounded border border-border bg-secondary/40">
              <Image
                alt={primaryImage.alt_text || "Product thumbnail"}
                className="object-cover"
                fill
                sizes="32px"
                src={primaryImage.thumbnailUrl}
              />
            </div>
          ) : (
            <ImageIcon size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
          )}
          <span>Manage Images</span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-bold text-primary">
            {images.length}
          </span>
        </button>
      </div>

      {/* Modal Popup */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          {/* Overlay click to close */}
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />

          {/* Modal Container */}
          <div className="relative z-10 flex flex-col w-full max-w-2xl max-h-[88vh] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ImageIcon size={18} />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">Product Imagery</h2>
                  <p className="text-xs text-muted-foreground">
                    Upload, set primary, edit alt text, or replace photos.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-primary">
                  {images.length} {images.length === 1 ? "image" : "images"}
                </span>
                <button
                  type="button"
                  aria-label="Close modal"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* 1. Upload Box */}
              <form
                action={uploadProductImage}
                className="rounded-xl border border-dashed border-border/90 bg-secondary/20 p-4 sm:p-5 text-center transition-colors hover:border-primary/40"
              >
                <input name="product_id" type="hidden" value={productId} />

                <div className="flex flex-col items-center justify-center">
                  <div className="rounded-full bg-primary/10 p-2.5 text-primary mb-2">
                    <UploadCloud size={20} />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-foreground">Upload new product image</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 mb-3">
                    JPG, PNG, WebP, or AVIF (Up to 10 MB)
                  </p>

                  <div className="w-full max-w-lg space-y-2.5 text-left">
                    <AdminField
                      label="Alt text"
                      name="alt_text"
                      placeholder="Describe what is visible in the image..."
                      required
                    />

                    <div className="flex flex-col sm:flex-row gap-2.5 items-center pt-1">
                      <input
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        className="block w-full text-xs text-muted-foreground file:mr-2.5 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-secondary file:text-primary hover:file:bg-primary/10 cursor-pointer"
                        name="file"
                        required
                        type="file"
                      />
                      <Submit label="Upload" size="sm" />
                    </div>
                  </div>
                </div>
              </form>

              {/* 2. Uploaded Images List */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Current Images ({images.length})
                </p>

                {images.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground italic rounded-xl border border-border/60 bg-secondary/10">
                    No images uploaded for this product yet. Upload your first image above.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className="relative flex flex-col sm:flex-row gap-3.5 items-start rounded-xl border border-border bg-card p-3.5 shadow-2xs"
                      >
                        {/* Primary Badge */}
                        {image.is_primary && (
                          <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground shadow-xs">
                            <Star className="size-3 fill-current" /> Primary
                          </span>
                        )}

                        {/* Thumbnail */}
                        <div className="relative aspect-[4/3] w-full sm:w-28 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary/40">
                          <Image
                            alt={image.alt_text}
                            className="object-cover"
                            fill
                            sizes="120px"
                            src={image.thumbnailUrl}
                          />
                        </div>

                        {/* Details & Actions */}
                        <div className="flex-1 w-full space-y-2.5">
                          {/* Alt text edit form */}
                          <form action={updateProductImage} className="flex gap-2 items-end">
                            <input name="product_id" type="hidden" value={productId} />
                            <input name="id" type="hidden" value={image.id} />
                            <input name="display_order" type="hidden" value={image.display_order} />
                            <div className="flex-1">
                              <AdminField
                                defaultValue={image.alt_text}
                                label="Alt text"
                                name="alt_text"
                                required
                              />
                            </div>
                            <Submit label="Save alt" size="sm" variant="secondary" />
                          </form>

                          {/* Toolbar */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
                            {/* Make Primary */}
                            <form action={setPrimaryImage}>
                              <input name="product_id" type="hidden" value={productId} />
                              <input name="id" type="hidden" value={image.id} />
                              <Button
                                className={image.is_primary ? "bg-accent/20 text-primary border-accent/40" : ""}
                                disabled={image.is_primary}
                                size="sm"
                                type="submit"
                                variant="outline"
                              >
                                <Star className={`size-3.5 ${image.is_primary ? "fill-accent text-accent" : ""}`} />
                                <span>{image.is_primary ? "Primary" : "Set as primary"}</span>
                              </Button>
                            </form>

                            <div className="flex items-center gap-1.5">
                              {/* Replace button */}
                              <Button
                                size="sm"
                                type="button"
                                variant="ghost"
                                onClick={() => setReplacingId(replacingId === image.id ? null : image.id)}
                              >
                                <RefreshCw size={13} />
                                <span>Replace</span>
                              </Button>

                              {/* Delete confirmation */}
                              <ConfirmDialog
                                action={deleteProductImage}
                                confirmLabel="Delete image"
                                description={
                                  image.is_primary
                                    ? "This is currently the primary image. Deleting it will remove it from the product."
                                    : "Are you sure you want to delete this product image?"
                                }
                                hiddenFields={{
                                  product_id: productId,
                                  id: image.id,
                                  public_id: image.cloudinary_public_id,
                                }}
                                title="Delete product image?"
                                triggerBtn={
                                  <Button
                                    aria-label="Delete image"
                                    className="text-red-700 hover:bg-red-50 hover:text-red-800"
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

                          {/* Inline Replace Form */}
                          {replacingId === image.id && (
                            <form
                              action={replaceProductImage}
                              className="mt-2 p-2.5 rounded-lg bg-secondary/50 border border-border grid gap-2 animate-in fade-in"
                            >
                              <input name="product_id" type="hidden" value={productId} />
                              <input name="id" type="hidden" value={image.id} />
                              <p className="text-[11px] font-semibold text-foreground">Choose replacement image file:</p>
                              <div className="flex items-center gap-2">
                                <input
                                  accept="image/jpeg,image/png,image/webp,image/avif"
                                  className="block w-full text-xs text-muted-foreground file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-card file:text-foreground cursor-pointer"
                                  name="file"
                                  required
                                  type="file"
                                />
                                <Submit label="Confirm" size="sm" />
                              </div>
                            </form>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end px-6 py-3 border-t border-border bg-secondary/20 shrink-0">
              <Button size="sm" variant="secondary" onClick={() => setIsOpen(false)}>
                <Check size={14} className="mr-1" />
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
