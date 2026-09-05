import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { ProductOptions } from "@/components/storefront/product-options";
import { Container } from "@/components/ui/container";
import { getStorefrontCategories } from "@/lib/storefront/categories";
import { getProductBySlug, getProductVariants } from "@/lib/storefront/products";

type ProductPageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found" };
  }

  return {
    title: product.name,
    description: product.description ?? product.short_description ?? undefined,
  };
}

function ProductImageFallback() {
  return (
    <div className="flex min-h-72 sm:min-h-96 items-center justify-center rounded-2xl border border-[#e5d8c6] bg-[#f4efeb] p-8 text-center text-xs sm:text-sm text-[#6e5b55]">
      Product imagery will appear here.
    </div>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [variants, categories] = await Promise.all([getProductVariants(product.id), getStorefrontCategories()]);
  const category = categories.find((item) => item.id === product.category_id);

  return (
    <section className="section-shell py-6 sm:py-12">
      <Container>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-5 sm:mb-8 text-xs sm:text-sm text-[#6e5b55]">
          <Link className="underline decoration-[#e5d8c6] underline-offset-4 hover:text-[#4a0e17]" href="/">
            Home
          </Link>
          <span className="px-2" aria-hidden="true">/</span>
          <Link className="underline decoration-[#e5d8c6] underline-offset-4 hover:text-[#4a0e17]" href="/products">
            Products
          </Link>
          <span className="px-2" aria-hidden="true">/</span>
          <span aria-current="page" className="text-[#2b1719] font-semibold">{product.name}</span>
        </nav>

        {/* Product Mobile Order: 1. Gallery -> 2. Title & Category -> 3. Options & Add to Cart -> 4. Description */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] lg:items-start lg:gap-14">
          {/* 1. Image / Gallery */}
          {product.images.length > 0 ? (
            <ProductGallery images={product.images} productName={product.name} />
          ) : (
            <ProductImageFallback />
          )}

          {/* 2. Title, Category, Options, Description */}
          <article className="space-y-6">
            <div>
              {category ? <p className="eyebrow">{category.name}</p> : null}
              <h1 className="mt-1.5 font-display text-2xl sm:text-4xl font-semibold leading-tight text-[#2b1719]">
                {product.name}
              </h1>
            </div>

            {/* Product Options, Price, Availability, Variants, Add-to-Cart CTA */}
            <div className="rounded-2xl sm:rounded-3xl border border-white/70 bg-gradient-to-br from-white/80 via-white/60 to-white/40 p-5 sm:p-7 backdrop-blur-xl shadow-xl shadow-amber-950/8">
              <ProductOptions product={product} variants={variants} />
            </div>

            {/* Description */}
            {(product.description || product.short_description) && (
              <div className="rounded-2xl sm:rounded-3xl border border-white/70 bg-gradient-to-br from-white/80 via-white/60 to-white/40 p-5 sm:p-6 backdrop-blur-xl shadow-xl shadow-amber-950/8 space-y-2">
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#2b1719]">About this delicacy</h2>
                <p className="whitespace-pre-line text-xs sm:text-sm leading-relaxed text-[#6e5b55]">
                  {product.description || product.short_description}
                </p>
              </div>
            )}
          </article>
        </div>
      </Container>
    </section>
  );
}

