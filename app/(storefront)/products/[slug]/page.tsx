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
  return <div className="flex min-h-96 items-center justify-center rounded-2xl border border-border bg-secondary px-8 text-center text-sm text-muted-foreground">Approved product imagery will appear here.</div>;
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
    <section className="section-shell pt-24 sm:pt-32">
      <Container>
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
          <Link className="underline decoration-border underline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" href="/">Home</Link>
          <span className="px-2" aria-hidden="true">/</span>
          <Link className="underline decoration-border underline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" href="/products">Products</Link>
          <span className="px-2" aria-hidden="true">/</span>
          <span aria-current="page" className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] lg:items-start lg:gap-16">
          {product.images.length > 0 ? <ProductGallery images={product.images} productName={product.name} /> : <ProductImageFallback />}

          <article>
            {category ? <p className="eyebrow">{category.name}</p> : null}
            <h1 className="mt-3 font-display text-4xl leading-[1.05] text-foreground sm:text-5xl">{product.name}</h1>
            {product.description ? <p className="mt-6 whitespace-pre-line text-base leading-7 text-muted-foreground">{product.description}</p> : product.short_description ? <p className="mt-6 text-base leading-7 text-muted-foreground">{product.short_description}</p> : null}
            <div className="mt-8 border-t border-border pt-7"><ProductOptions product={product} variants={variants} /></div>
          </article>
        </div>
      </Container>
    </section>
  );
}
