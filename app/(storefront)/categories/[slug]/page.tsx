import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ProductCatalogView } from "@/components/storefront/product-catalog-view";
import { JsonLd } from "@/lib/seo/structured-data";
import { getCategoryBySlug, getStorefrontCategories } from "@/lib/storefront/categories";
import { getProducts } from "@/lib/storefront/products";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

const CATEGORY_SEO: Record<string, { title: string; description: string }> = {
  payasam: {
    title: "Traditional Kerala Payasam & Ada in Bangalore | Namma Ada",
    description:
      "Traditional Kerala Chill Ada and Palada Payasam prepared fresh with rich milk, jaggery, and authentic spices for everyday cravings and festive celebrations.",
  },
  unniyappam: {
    title: "Handcrafted Kerala Unniyappam in Bangalore | Namma Ada",
    description:
      "Soft, golden traditional sweet fritters made fresh with authentic rice flour, ripe bananas, jaggery, and roasted coconut bits.",
  },
  chips: {
    title: "Crispy Authentic Kerala Banana Chips Online | Namma Ada",
    description:
      "Crisp, golden, thinly sliced authentic Kerala banana chips fried to crunchy perfection using traditional cooking expertise.",
  },
  oil: {
    title: "100% Pure Cold-Pressed Coconut Oil Online | Namma Ada",
    description:
      "100% pure, natural, and cold-pressed coconut oil extracted using traditional techniques. Unrefined with natural aroma and taste.",
  },
  pickles: {
    title: "Traditional Authentic Kerala Pickles Online | Namma Ada",
    description:
      "Authentic, spicy and tangy homemade Kerala pickles prepared using time-honoured family recipes and genuine regional spices.",
  },
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const seo = CATEGORY_SEO[category.slug.toLowerCase()] || {
    title: `${category.name} — Authentic Kerala Delicacies | Namma Ada`,
    description:
      category.description ||
      `Explore authentic ${category.name} handcrafted with traditional Kerala recipes by Namma Ada.`,
  };

  const canonicalUrl = `https://nammaada.com/categories/${category.slug}`;

  return {
    title: { absolute: seo.title },
    description: seo.description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: canonicalUrl,
      siteName: "Namma Ada",
      locale: "en_IN",
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const [categories, allProducts] = await Promise.all([
    getStorefrontCategories(),
    getProducts(),
  ]);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category.name} - Namma Ada`,
    description:
      CATEGORY_SEO[category.slug.toLowerCase()]?.description ||
      `Explore authentic ${category.name} handcrafted by Namma Ada.`,
    itemListElement: allProducts
      .filter((p) => p.category_id === category.id)
      .map((p, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: p.name,
        url: `https://nammaada.com/products/${p.slug}`,
      })),
  };

  return (
    <>
      <JsonLd data={itemListSchema} />
      {/* 100% Identical Header to Products Page */}
      <section className="bg-transparent sm:py-5 text-center">
        <Container>
          <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
            <p className="eyebrow text-center">OUR COLLECTION</p>
            <h1 className="mt-2 font-display text-2xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-[#2b1719] text-center">
              Traditional flavours,<br className="hidden sm:inline" /> timeless classics
            </h1>
            <p className="mt-2 sm:mt-3 text-xs sm:text-base leading-relaxed text-[#6e5b55] text-center max-w-lg">
              Freshly prepared Kerala delicacies, made for everyday cravings and special gatherings.
            </p>
          </div>
        </Container>
      </section>

      {/* 100% Identical Product Catalog View with pre-selected category */}
      <section className="section-shell sm:py-2" aria-labelledby="catalog-heading">
        <Container>
          <ProductCatalogView
            categories={categories}
            initialProducts={allProducts}
            defaultCategorySlug={category.slug}
          />
        </Container>
      </section>
    </>
  );
}
