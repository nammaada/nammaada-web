import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ProductCatalogView } from "@/components/storefront/product-catalog-view";
import { JsonLd } from "@/lib/seo/structured-data";
import { getStorefrontCategories } from "@/lib/storefront/categories";
import { getProducts } from "@/lib/storefront/products";

type ProductsPageProps = {
  searchParams: Promise<{ category?: string; sort?: string; price?: string }>;
};

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const category = resolvedSearchParams?.category;

  if (category) {
    redirect(`/categories/${category}`);
  }

  const defaultTitle = "Authentic Kerala Food & Traditional Snacks in Bangalore | Namma Ada";
  const defaultDescription =
    "Explore Namma Ada's handcrafted Kerala delicacies in Bangalore. Order fresh Chill Ada, Unniyappam, crispy Banana Chips, and 100% pure cold-pressed coconut oil online.";

  return {
    title: {
      absolute: defaultTitle,
    },
    description: defaultDescription,
    alternates: {
      canonical: "https://nammaada.com/products",
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: defaultTitle,
      description: defaultDescription,
      url: "https://nammaada.com/products",
      siteName: "Namma Ada",
      locale: "en_IN",
      type: "website",
    },
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const categoryParam = resolvedSearchParams?.category;

  // When a category query is passed, seamlessly redirect to clean SEO URL /categories/[slug]
  if (categoryParam) {
    redirect(`/categories/${categoryParam}`);
  }

  const [categories, allProducts] = await Promise.all([
    getStorefrontCategories(),
    getProducts(),
  ]);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Namma Ada Products Collection",
    description:
      "Handcrafted authentic Kerala food and traditional delicacies available in Bangalore and across India.",
    itemListElement: allProducts.map((p, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: p.name,
      url: `https://nammaada.com/products/${p.slug}`,
    })),
  };

  return (
    <>
      <JsonLd data={itemListSchema} />
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

      <section className="section-shell sm:py-2" aria-labelledby="catalog-heading">
        <Container>
          <ProductCatalogView
            categories={categories}
            initialProducts={allProducts}
          />
        </Container>
      </section>
    </>
  );
}
