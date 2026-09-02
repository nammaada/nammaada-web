"use client";

import Image from "next/image";
import { useState } from "react";
import { UploadCloud, Star, ArrowUp, ArrowDown, RefreshCw, Trash2 } from "lucide-react";
import { deleteProductImage, moveProductImage, replaceProductImage, setPrimaryImage, updateProductImage, uploadProductImage } from "@/actions/admin";
import { AdminField, Submit } from "@/components/admin/admin-form";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ImageRow = {
  id: string;
  product_id: string;
  cloudinary_public_id: string;
  alt_text: string;
  display_order: number;
  is_primary: boolean;
  thumbnailUrl: string;
};

export function ImageManager({ productId, images }: { productId: string; images: ImageRow[] }) {
  const [replacingId, setReplacingId] = useState<string | null>(null);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">Product Imagery</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upload, set primary thumbnail, edit alt text, and reorder.
          </p>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-primary">
          {images.length} {images.length === 1 ? "image" : "images"}
        </span>
      </div>

      {/* Upload Dropzone Form */}
      <form action={uploadProductImage} className="rounded-xl border border-dashed border-border/90 bg-card/60 p-5 text-center transition-colors hover:border-primary/40">
        <input name="product_id" type="hidden" value={productId} />
        
        <div className="flex flex-col items-center justify-center">
          <div className="rounded-full bg-primary/10 p-3 text-primary mb-3">
            <UploadCloud size={24} />
          </div>
          <p className="text-sm font-semibold text-foreground">Upload Product Image</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Drag & drop or select JPG, PNG, WebP, or AVIF (Up to 10 MB)
          </p>

          <div className="w-full max-w-md space-y-3 text-left">
            <AdminField label="Alt text" name="alt_text" placeholder="Describe what is visible in the image..." required />
            
            <div className="flex flex-col sm:flex-row gap-3 items-center pt-1">
              <input
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="block w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-secondary file:text-primary hover:file:bg-primary/10 cursor-pointer"
                name="file"
                required
                type="file"
              />
              <Submit label="Upload" size="sm" />
            </div>
          </div>
        </div>
      </form>

      {/* Image Grid / Cards */}
      <div className="grid gap-4">
        {images.map((image, index) => (
          <Card className="p-4 flex flex-col sm:flex-row gap-4 items-start relative overflow-hidden" key={image.id}>
            {/* Primary badge floating indicator */}
            {image.is_primary && (
              <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded-md bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground shadow-xs">
                <Star className="size-3 fill-current" /> Primary
              </span>
            )}

            {/* Thumbnail */}
            <div className="relative aspect-[4/3] w-full sm:w-36 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary/40">
              <Image
                alt={image.alt_text}
                className="object-cover"
                fill
                sizes="180px"
                src={image.thumbnailUrl}
              />
            </div>

            {/* Controls */}
            <div className="flex-1 w-full grid gap-3">
              {/* Alt Text & Order Form */}
              <form action={updateProductImage} className="grid gap-2">
                <input name="product_id" type="hidden" value={productId} />
                <input name="id" type="hidden" value={image.id} />
                
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <AdminField defaultValue={image.alt_text} label="Alt text" name="alt_text" required />
                  </div>
                  <input name="display_order" type="hidden" value={image.display_order} />
                  <Submit label="Save alt" size="sm" variant="secondary" />
                </div>
              </form>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
                <div className="flex items-center gap-1.5">
                  {/* Set Primary Button */}
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
                      <span>{image.is_primary ? "Primary" : "Make primary"}</span>
                    </Button>
                  </form>

                  {/* Move Up */}
                  {index > 0 && (
                    <form action={moveProductImage}>
                      <input name="product_id" type="hidden" value={productId} />
                      <input name="id" type="hidden" value={image.id} />
                      <input name="direction" type="hidden" value="up" />
                      <Button aria-label="Move image up" size="sm" type="submit" variant="ghost">
                        <ArrowUp size={14} />
                      </Button>
                    </form>
                  )}

                  {/* Move Down */}
                  {index < images.length - 1 && (
                    <form action={moveProductImage}>
                      <input name="product_id" type="hidden" value={productId} />
                      <input name="id" type="hidden" value={image.id} />
                      <input name="direction" type="hidden" value="down" />
                      <Button aria-label="Move image down" size="sm" type="submit" variant="ghost">
                        <ArrowDown size={14} />
                      </Button>
                    </form>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Toggle Replace File Picker */}
                  <Button
                    size="sm"
                    type="button"
                    variant="ghost"
                    onClick={() => setReplacingId(replacingId === image.id ? null : image.id)}
                  >
                    <RefreshCw size={14} />
                    <span>Replace</span>
                  </Button>

                  {/* Confirm Delete Dialog */}
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
                      <Button aria-label="Delete image" size="sm" type="button" variant="ghost" className="text-red-800 hover:bg-red-50">
                        <Trash2 size={14} />
                      </Button>
                    }
                  />
                </div>
              </div>

              {/* Inline Replace Form */}
              {replacingId === image.id && (
                <form action={replaceProductImage} className="mt-2 p-3 rounded-lg bg-secondary/60 border border-border/80 grid gap-2 animate-in fade-in">
                  <input name="product_id" type="hidden" value={productId} />
                  <input name="id" type="hidden" value={image.id} />
                  <p className="text-xs font-semibold text-foreground">Select replacement file:</p>
                  <div className="flex items-center gap-2">
                    <input
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="block w-full text-xs text-muted-foreground file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-card file:text-foreground"
                      name="file"
                      required
                      type="file"
                    />
                    <Submit label="Confirm replace" size="sm" />
                  </div>
                </form>
              )}
            </div>
          </Card>
        ))}

        {images.length === 0 && (
          <p className="py-8 text-center text-xs text-muted-foreground italic">
            No images uploaded for this product yet.
          </p>
        )}
      </div>
    </div>
  );
}
