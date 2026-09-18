import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { ProductOptions } from "@/components/storefront/product-options";
import { Container } from "@/components/ui/container";
import { JsonLd } from "@/lib/seo/structured-data";
import { getStorefrontCategories } from "@/lib/storefront/categories";
import { getProductBySlug, getProductVariants } from "@/lib/storefront/products";

type ProductPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found | Namma Ada" };
  }

  const isBangaloreOnly = product.delivery_scope === "bangalore_only";
  const locationSuffix = isBangaloreOnly ? "in Bangalore" : "Online";
  const title = `${product.name} — Authentic Kerala Delicacy ${locationSuffix} | Namma Ada`;

  let description = product.description;
  if (!description || description.trim().toLowerCase() === "full description here") {
    if (product.slug.includes("chill-aada") || product.name.toLowerCase().includes("chill ada")) {
      description =
        "Order authentic CHILL ADA in Bangalore from Namma Ada. A creamy, traditional Kerala dessert handcrafted fresh with authentic ingredients for rich, comforting taste.";
    } else if (product.slug.includes("banana-chips") || product.name.toLowerCase().includes("banana chips")) {
      description =
        "Order crispy authentic BANANA CHIPS online from Namma Ada. Golden, crunchy Kerala banana chips sliced and prepared with traditional care. Delivery across India.";
    } else if (product.slug.includes("unniyappam") || product.name.toLowerCase().includes("unniyappam")) {
      description =
        "Order soft, handcrafted UNNIYAPPAM in Bangalore from Namma Ada. Traditional Kerala sweet fritters made fresh in small batches for your family and celebrations.";
    } else if (product.slug.includes("coconut") || product.name.toLowerCase().includes("coconut oil")) {
      description =
        "Order 100% Pure Cold-Pressed Coconut Oil online from Namma Ada. Fresh, natural, and unrefined Kerala coconut oil delivered to your doorstep across India.";
    } else {
      description = `${product.name} handcrafted with authentic Kerala tradition by Namma Ada. Prepared fresh for every order.`;
    }
  } else if (product.short_description && !description.includes(product.short_description)) {
    description = `${description} ${isBangaloreOnly ? "Available for fresh delivery in Bangalore." : "Available for delivery across India."}`;
  }

  const primaryImage =
    product.images[0]?.url ||
    "https://res.cloudinary.com/htzxecwe/image/upload/v1789553679/namma_ada_email_logo.png";

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `https://nammaada.com/products/${product.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://nammaada.com/products/${product.slug}`,
      siteName: "Namma Ada",
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: primaryImage,
          alt: `${product.name} - Namma Ada`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [primaryImage],
    },
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

  const [variants, categories] = await Promise.all([
    getProductVariants(product.id),
    getStorefrontCategories(),
  ]);
  const category = categories.find((item) => item.id === product.category_id);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.short_description || `${product.name} - Namma Ada`,
    image: product.images.map((img) => img.url),
    sku: product.slug,
    brand: {
      "@type": "Brand",
      name: "Namma Ada",
    },
    offers: {
      "@type": "Offer",
      url: `https://nammaada.com/products/${product.slug}`,
      priceCurrency: "INR",
      price: (product.price_paise / 100).toFixed(2),
      availability: product.is_in_stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "Namma Ada",
      },
    },
  };

  const breadcrumbsSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://nammaada.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: "https://nammaada.com/products",
      },
      ...(category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: category.name,
              item: `https://nammaada.com/categories/${category.slug}`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: product.name,
              item: `https://nammaada.com/products/${product.slug}`,
            },
          ]
        : [
            {
              "@type": "ListItem",
              position: 3,
              name: product.name,
              item: `https://nammaada.com/products/${product.slug}`,
            },
          ]),
    ],
  };

  return (
    <section className="section-shell py-6 sm:py-12">
      <JsonLd data={[productSchema, breadcrumbsSchema]} />
      <Container>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-5 sm:mb-8 text-xs sm:text-sm text-[#6e5b55]">
          <Link className="underline decoration-[#e5d8c6] underline-offset-4 hover:text-[#711e2c]" href="/">
            Home
          </Link>
          <span className="px-2" aria-hidden="true">/</span>
          <Link className="underline decoration-[#e5d8c6] underline-offset-4 hover:text-[#711e2c]" href="/products">
            Products
          </Link>
          {category ? (
            <>
              <span className="px-2" aria-hidden="true">/</span>
              <Link
                className="underline decoration-[#e5d8c6] underline-offset-4 hover:text-[#711e2c]"
                href={`/categories/${category.slug}`}
              >
                {category.name}
              </Link>
            </>
          ) : null}
          <span className="px-2" aria-hidden="true">/</span>
          <span aria-current="page" className="text-[#2b1719] font-semibold">
            {product.name}
          </span>
        </nav>

        {/* Product Layout: Gallery + Details */}
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
              {category ? (
                <Link
                  href={`/categories/${category.slug}`}
                  className="eyebrow hover:text-[#711e2c] transition-colors"
                >
                  {category.name}
                </Link>
              ) : null}
              <h1 className="mt-1.5 font-display text-2xl sm:text-4xl font-semibold leading-tight text-[#2b1719]">
                {product.name}
              </h1>
              {product.short_description && (
                <p className="mt-2 text-sm sm:text-base text-[#6e5b55] leading-relaxed">
                  {product.short_description}
                </p>
              )}
            </div>

            {/* Product Options, Price, Availability, Variants, Add-to-Cart CTA */}
            <div className="rounded-2xl sm:rounded-3xl border border-white/70 bg-gradient-to-br from-white/80 via-white/60 to-white/40 p-5 sm:p-7 backdrop-blur-xl shadow-xl shadow-amber-950/8">
              <ProductOptions product={product} variants={variants} />
            </div>

            {/* Full Description Section */}
            {product.description && (
              <div className="rounded-2xl sm:rounded-3xl border border-white/70 bg-gradient-to-br from-white/80 via-white/60 to-white/40 p-5 sm:p-6 backdrop-blur-xl shadow-xl shadow-amber-950/8 space-y-2">
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#2b1719]">
                  Full Description
                </h2>
                <p className="whitespace-pre-line text-xs sm:text-sm leading-relaxed text-[#6e5b55]">
                  {product.description}
                </p>
              </div>
            )}
          </article>
        </div>
      </Container>
    </section>
  );
}
