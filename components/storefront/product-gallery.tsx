"use client";

import Image from "next/image";
import { useState } from "react";
import type { StorefrontProductImage } from "@/lib/storefront/products";

function Placeholder() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-secondary px-8 text-center text-muted-foreground">
      <span aria-hidden="true" className="font-display text-5xl text-primary/25">NA</span>
      <span className="max-w-xs text-[0.65rem] font-semibold uppercase tracking-[0.16em]">Approved product imagery will appear here</span>
    </div>
  );
}

export function ProductGallery({ productName, images }: { productName: string; images: StorefrontProductImage[] }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const activeImage = images[selectedImage] ?? images[0];

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-secondary sm:aspect-[5/4]">
        {activeImage ? <Image src={activeImage.url} alt={activeImage.alt} fill priority className="object-cover" sizes="(min-width: 1024px) 52vw, 100vw" /> : <Placeholder />}
      </div>

      {images.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto pb-1" aria-label={`${productName} images`}>
          {images.map((image, index) => (
            <button
              aria-label={`Show image ${index + 1} of ${images.length}`}
              aria-pressed={selectedImage === index}
              className={`relative size-16 shrink-0 overflow-hidden rounded-lg border bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:size-20 ${selectedImage === index ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
              key={image.id}
              onClick={() => setSelectedImage(index)}
              type="button"
            >
              <Image src={image.url} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
