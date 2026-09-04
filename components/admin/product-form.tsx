"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { Plus, UploadCloud, X, Star, RefreshCw, Trash2, ImageIcon, Check } from "lucide-react";
import {
  saveProduct,
  uploadProductImage,
  deleteProductImage,
  setPrimaryImage,
  replaceProductImage,
  updateProductImage,
} from "@/actions/admin";
import { AdminField, CheckField, FormSection, MoneyField, Submit } from "@/components/admin/admin-form";
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

type Product = {
  id?: string;
  name?: string;
  slug?: string;
  short_description?: string | null;
  description?: string | null;
  category_id?: string | null;
  price_paise?: number;
  stock_quantity?: number;
  delivery_scope?: string;
  is_free_shipping?: boolean;
  is_active?: boolean;
  is_featured?: boolean;
  display_order?: number;
};

export function ProductForm({
  product,
  categories,
  images = [],
  submitLabel,
  isNew,
}: {
  product?: Product;
  categories: { id: string; name: string }[];
  images?: ImageRow[];
  submitLabel?: string;
  isNew?: boolean;
}) {
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(product?.slug));

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [replacingId, setReplacingId] = useState<string | null>(null);

  // For Create Product image staging
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [stagedAlt, setStagedAlt] = useState("");
  const [stagedPreviewUrl, setStagedPreviewUrl] = useState<string | null>(null);

  // Temporary staging state inside the modal (before clicking "Add Image")
  const [modalFile, setModalFile] = useState<File | null>(null);
  const [modalAlt, setModalAlt] = useState("");
  const [modalPreview, setModalPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!slugManuallyEdited) {
      const generated = e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(generated);
    }
  };

  // When admin selects a file inside the Create modal
  const handleModalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setModalFile(file);
      setModalPreview(URL.createObjectURL(file));
      if (!modalAlt) {
        setModalAlt(product?.name || file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  // Confirm adding image on Create
  const handleConfirmCreateImage = () => {
    if (modalFile) {
      setStagedFile(modalFile);
      setStagedAlt(modalAlt);
      setStagedPreviewUrl(modalPreview);
      // Transfer to hidden file input if possible
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(modalFile);
        fileInputRef.current.files = dataTransfer.files;
      }
    }
    setModalOpen(false);
  };

  // Remove staged image on Create
  const handleRemoveStagedImage = () => {
    setStagedFile(null);
    setStagedAlt("");
    setStagedPreviewUrl(null);
    setModalFile(null);
    setModalAlt("");
    setModalPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form action={saveProduct} className="w-full space-y-8">
      <input name="id" type="hidden" value={product?.id ?? ""} />

      {/* Hidden file inputs for Create Product */}
      {isNew && (
        <>
          <input
            ref={fileInputRef}
            name="image_file"
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp,image/avif"
          />
          <input name="image_alt" type="hidden" value={stagedAlt} />
        </>
      )}

      {/* 1. Basic Information */}
      <FormSection description="Product identifiers and public content." title="Basic Information">
        <div className="grid gap-5 sm:grid-cols-2">
          <AdminField
            defaultValue={product?.name}
            label="Product name"
            name="name"
            placeholder="e.g. Pure Coconut Oil"
            required
            onChange={handleNameChange}
          />
          <AdminField
            helperText="Unique URL slug (lowercase letters and hyphens)"
            label="Slug"
            name="slug"
            placeholder="e.g. pure-coconut-oil"
            required
            value={slug}
            onChange={(e) => {
              setSlugManuallyEdited(true);
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ""));
            }}
          />
        </div>

        <AdminField
          defaultValue={product?.short_description ?? ""}
          label="Short description"
          name="short_description"
          placeholder="Brief summary displayed on product cards"
        />

        <label className="grid gap-1.5 text-sm font-semibold text-foreground">
          <span>Full description</span>
          <textarea
            className="min-h-32 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm font-normal text-foreground placeholder:text-muted-foreground/60 transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
            defaultValue={product?.description ?? ""}
            name="description"
            placeholder="Detailed product story, ingredients, usage instructions..."
          />
        </label>
      </FormSection>

      {/* 2. Catalog & Classification */}
      <FormSection description="Assign category and sorting order." title="Catalog & Classification">
        <div className="grid gap-5 sm:grid-cols-2">
          <AdminField label="Category" name="category_id">
            <select
              className="min-h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              defaultValue={product?.category_id ?? ""}
              name="category_id"
            >
              <option value="">Uncategorised</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </AdminField>

          <AdminField
            defaultValue={product?.display_order ?? 0}
            helperText="Lower numbers appear first"
            label="Display order"
            name="display_order"
            type="number"
          />
        </div>
      </FormSection>

      {/* 3. Pricing & Commerce */}
      <FormSection description="Pricing in Indian Rupees (INR) and stock availability." title="Pricing & Commerce">
        <div className="grid gap-5 sm:grid-cols-2">
          <MoneyField label="Price" name="price" paise={product?.price_paise} required />
          <AdminField
            defaultValue={product?.stock_quantity ?? 0}
            helperText="Available units for direct purchase"
            label="Stock quantity"
            name="stock_quantity"
            required
            type="number"
          />
        </div>

        <AdminField helperText="Select shipping availability boundary" label="Delivery scope" name="delivery_scope">
          <select
            className="min-h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            defaultValue={product?.delivery_scope ?? "all_india"}
            name="delivery_scope"
          >
            <option value="all_india">All India Shipping</option>
            <option value="bangalore_only">Bangalore Only</option>
          </select>
        </AdminField>
      </FormSection>

      {/* 4. Product Images (Inside Main Form) */}
      <FormSection description="Product photos for catalog and storefront showcase." title="Product Images">
        {/* On CREATE PRODUCT */}
        {isNew && (
          <div className="flex flex-wrap items-center gap-4 pt-1">
            {stagedPreviewUrl ? (
              <div className="relative flex items-center gap-4 rounded-xl border border-border bg-secondary/30 p-3 pr-4 shadow-2xs">
                <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={stagedAlt || "Preview"} className="h-full w-full object-cover" src={stagedPreviewUrl} />
                </div>
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">
                    <Star className="size-2.5 fill-current" /> Primary
                  </div>
                  <p className="text-xs font-semibold text-foreground truncate max-w-xs">{stagedAlt || stagedFile?.name}</p>
                  <p className="text-[11px] text-muted-foreground">Will be uploaded upon product creation.</p>
                </div>
                <div className="flex items-center gap-1.5 pl-2">
                  <Button
                    size="sm"
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setModalFile(stagedFile);
                      setModalAlt(stagedAlt);
                      setModalPreview(stagedPreviewUrl);
                      setModalOpen(true);
                    }}
                  >
                    <RefreshCw size={13} />
                    <span>Replace</span>
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    variant="ghost"
                    className="text-red-700 hover:bg-red-50 hover:text-red-800"
                    onClick={handleRemoveStagedImage}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setModalFile(null);
                  setModalAlt(product?.name || "");
                  setModalPreview(null);
                  setModalOpen(true);
                }}
                className="group inline-flex items-center gap-2.5 rounded-xl border border-dashed border-border bg-secondary/20 px-5 py-3 text-sm font-semibold text-primary transition-all hover:border-primary/60 hover:bg-secondary/50 active:scale-[0.99] cursor-pointer"
              >
                <Plus size={18} className="transition-transform group-hover:scale-110" />
                <span>+ Add product image</span>
              </button>
            )}
          </div>
        )}

        {/* On EDIT PRODUCT */}
        {!isNew && product?.id && (
          <div className="space-y-4 pt-1">
            <div className="flex flex-wrap items-center gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="relative flex items-center gap-3.5 rounded-xl border border-border bg-secondary/20 p-3 shadow-2xs"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-card">
                    <Image
                      alt={image.alt_text}
                      className="object-cover"
                      fill
                      sizes="96px"
                      src={image.thumbnailUrl}
                    />
                    {image.is_primary && (
                      <span className="absolute top-1 left-1 z-10 rounded bg-accent px-1 py-0.5 text-[9px] font-bold text-accent-foreground shadow-xs">
                        ★ Primary
                      </span>
                    )}
                  </div>

                  {/* Info & Inline Alt */}
                  <div className="space-y-1.5 min-w-[140px]">
                    <p className="text-xs font-semibold text-foreground truncate max-w-[180px]">{image.alt_text || "Product image"}</p>
                    <div className="flex items-center gap-1.5">
                      {/* Set Primary Button */}
                      {!image.is_primary && (
                        <Button
                          formAction={setPrimaryImage}
                          name="id"
                          value={image.id}
                          size="sm"
                          type="submit"
                          variant="outline"
                          className="h-7 text-[11px] px-2"
                        >
                          <Star size={11} className="mr-1" />
                          Primary
                        </Button>
                      )}

                      {/* Replace Toggle */}
                      <Button
                        size="sm"
                        type="button"
                        variant="ghost"
                        className="h-7 text-[11px] px-2"
                        onClick={() => setReplacingId(replacingId === image.id ? null : image.id)}
                      >
                        <RefreshCw size={11} className="mr-1" />
                        Replace
                      </Button>

                      {/* Delete */}
                      <ConfirmDialog
                        action={deleteProductImage}
                        confirmLabel="Delete image"
                        description={
                          image.is_primary
                            ? "This is currently the primary image. Deleting it will remove it from the product."
                            : "Are you sure you want to delete this product image?"
                        }
                        hiddenFields={{
                          product_id: product.id ?? "",
                          id: image.id,
                          public_id: image.cloudinary_public_id,
                        }}
                        title="Delete product image?"
                        triggerBtn={
                          <Button
                            aria-label="Delete image"
                            className="h-7 text-[11px] px-2 text-red-700 hover:bg-red-50 hover:text-red-800"
                            size="sm"
                            type="button"
                            variant="ghost"
                          >
                            <Trash2 size={12} />
                          </Button>
                        }
                      />
                    </div>
                  </div>

                  {/* Inline Replace File Picker */}
                  {replacingId === image.id && (
                    <div className="absolute left-0 top-full mt-2 z-20 w-80 p-3 rounded-xl bg-card border border-border shadow-xl space-y-2 animate-in fade-in">
                      <p className="text-xs font-semibold text-foreground">Select replacement file:</p>
                      <input
                        formAction={replaceProductImage}
                        name="replace_id"
                        type="hidden"
                        value={image.id}
                      />
                      <input
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        className="block w-full text-xs text-muted-foreground file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-secondary file:text-primary"
                        name="file"
                        type="file"
                      />
                    </div>
                  )}
                </div>
              ))}

              {/* Add More Images Button */}
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="group inline-flex items-center gap-2 rounded-xl border border-dashed border-border bg-secondary/20 px-4 py-3 text-sm font-semibold text-primary transition-all hover:border-primary/60 hover:bg-secondary/50 active:scale-[0.99] cursor-pointer"
              >
                <Plus size={16} className="transition-transform group-hover:scale-110" />
                <span>+ Add product image</span>
              </button>
            </div>
          </div>
        )}
      </FormSection>

      {/* 5. Visibility & Settings */}
      <FormSection description="Control product visibility and special flags on storefront." title="Visibility & Settings">
        <div className="grid gap-6 sm:grid-cols-3 pt-1">
          <CheckField defaultChecked={product?.is_active ?? true} description="Visible on storefront" label="Active" name="is_active" />
          <CheckField defaultChecked={product?.is_featured ?? false} description="Highlight on homepage" label="Featured" name="is_featured" />
          <CheckField defaultChecked={product?.is_free_shipping ?? false} description="Waive shipping fee" label="Free shipping" name="is_free_shipping" />
        </div>
      </FormSection>

      {/* Submit Button Bar */}
      <div className="flex items-center justify-end pt-6 border-t border-border">
        <Submit label={submitLabel || (isNew ? "Create product" : "Save product changes")} size="lg" />
      </div>

      {/* ONE Simple Add Image Modal / Pop-up */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          {/* Backdrop Click */}
          <div className="fixed inset-0" onClick={() => setModalOpen(false)} />

          {/* Modal Box */}
          <div className="relative z-10 flex flex-col w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ImageIcon size={18} />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground">
                  {isNew ? "Add Product Image" : "Upload Product Image"}
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            {isNew ? (
              // Create Mode: local staging
              <div className="p-6 space-y-4">
                <div className="rounded-xl border border-dashed border-border/80 bg-secondary/20 p-5 text-center">
                  <UploadCloud size={24} className="mx-auto text-primary mb-2" />
                  <p className="text-xs font-semibold text-foreground mb-1">Choose an image file</p>
                  <p className="text-[11px] text-muted-foreground mb-3">JPG, PNG, WebP, or AVIF (Up to 10 MB)</p>
                  <input
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="block w-full text-xs text-muted-foreground file:mr-2.5 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-secondary file:text-primary cursor-pointer"
                    type="file"
                    onChange={handleModalFileChange}
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-foreground">Alt text / Image label</span>
                  <input
                    className="min-h-10 w-full rounded-lg border border-input bg-card px-3 text-xs font-normal text-foreground placeholder:text-muted-foreground/60 transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
                    placeholder="Describe what is visible in the photo..."
                    value={modalAlt}
                    onChange={(e) => setModalAlt(e.target.value)}
                  />
                </div>

                {modalPreview && (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-2.5">
                    <div className="relative aspect-[4/3] w-16 shrink-0 overflow-hidden rounded border border-border bg-card">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="Preview" className="h-full w-full object-cover" src={modalPreview} />
                    </div>
                    <div className="text-xs min-w-0">
                      <p className="font-semibold text-foreground truncate">{modalFile?.name}</p>
                      <p className="text-[11px] text-muted-foreground">Ready to attach</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                  <Button size="sm" type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    variant="primary"
                    disabled={!modalFile}
                    onClick={handleConfirmCreateImage}
                  >
                    <Check size={14} className="mr-1" />
                    Save & Attach
                  </Button>
                </div>
              </div>
            ) : (
              // Edit Mode: Upload directly to server
              <form action={uploadProductImage} className="p-6 space-y-4">
                <input name="product_id" type="hidden" value={product?.id ?? ""} />

                <div className="rounded-xl border border-dashed border-border/80 bg-secondary/20 p-5 text-center">
                  <UploadCloud size={24} className="mx-auto text-primary mb-2" />
                  <p className="text-xs font-semibold text-foreground mb-1">Select image to upload</p>
                  <p className="text-[11px] text-muted-foreground mb-3">JPG, PNG, WebP, or AVIF (Up to 10 MB)</p>
                  <input
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="block w-full text-xs text-muted-foreground file:mr-2.5 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-secondary file:text-primary cursor-pointer"
                    name="file"
                    required
                    type="file"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-foreground">Alt text</span>
                  <input
                    className="min-h-10 w-full rounded-lg border border-input bg-card px-3 text-xs font-normal text-foreground placeholder:text-muted-foreground/60 transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
                    name="alt_text"
                    placeholder="Describe what is visible in the photo..."
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                  <Button size="sm" type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                  <Submit label="Upload Image" size="sm" />
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
