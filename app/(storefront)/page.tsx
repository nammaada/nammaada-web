import type { Metadata } from "next";
import { BrandValues } from "@/components/home/brand-values";
import { CelebrationCta } from "@/components/home/celebration-cta";
import { FeaturedProducts } from "@/components/home/featured-products";
import { HeroSection } from "@/components/home/hero-section";
import { InstagramPreview } from "@/components/home/instagram-preview";
import { IntroVideo } from "@/components/home/intro-video";
import { StoryPreview } from "@/components/home/story-preview";
import { Testimonials } from "@/components/home/testimonials";
import { JsonLd, ORGANIZATION_SCHEMA, WEBSITE_SCHEMA } from "@/lib/seo/structured-data";
import { getStorefrontCategories } from "@/lib/storefront/categories";
import { getFromOurKitchenContent, getWhoWeAreContent } from "@/lib/storefront/content";
import { getFeaturedProducts } from "@/lib/storefront/products";
import { getTestimonials } from "@/lib/storefront/testimonials";

export const metadata: Metadata = {
  title: {
    absolute: "Namma Ada | Authentic Kerala Food & Traditional Snacks in Bangalore",
  },
  description:
    "Handcrafted authentic Kerala food and traditional snacks in Bangalore. Order fresh Chill Ada, Palada Payasam, Unniyappam, crispy Banana Chips, and pure coconut oil online.",
  alternates: {
    canonical: "https://nammaada.com",
  },
  openGraph: {
    title: "Namma Ada | Authentic Kerala Food & Traditional Snacks in Bangalore",
    description:
      "Handcrafted authentic Kerala food and traditional snacks in Bangalore. Order fresh Chill Ada, Palada Payasam, Unniyappam, crispy Banana Chips, and pure coconut oil online.",
    url: "https://nammaada.com",
    siteName: "Namma Ada",
    locale: "en_IN",
    type: "website",
  },
};

export default async function HomePage() {
  const [featuredProducts, categories, testimonials, whoWeAreContent, fromOurKitchenContent] =
    await Promise.all([
      getFeaturedProducts(),
      getStorefrontCategories(),
      getTestimonials(),
      getWhoWeAreContent(),
      getFromOurKitchenContent(),
    ]);

  return (
    <>
      <JsonLd data={[ORGANIZATION_SCHEMA, WEBSITE_SCHEMA]} />
      <IntroVideo />
      <HeroSection />
      <FeaturedProducts products={featuredProducts} />
      <BrandValues />
      <StoryPreview content={whoWeAreContent} />
      <InstagramPreview content={fromOurKitchenContent} />
      <CelebrationCta />
      <Testimonials testimonials={testimonials} />
    </>
  );
}
