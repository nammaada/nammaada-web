import { BrandValues } from "@/components/home/brand-values";
import { CelebrationCta } from "@/components/home/celebration-cta";
import { FeaturedProducts } from "@/components/home/featured-products";
import { HeroSection } from "@/components/home/hero-section";
import { InstagramPreview } from "@/components/home/instagram-preview";
import { StoryPreview } from "@/components/home/story-preview";
import { Testimonials } from "@/components/home/testimonials";
import { getFromOurKitchenContent, getWhoWeAreContent } from "@/lib/storefront/content";
import { getFeaturedProducts } from "@/lib/storefront/products";
import { getTestimonials } from "@/lib/storefront/testimonials";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredProducts, testimonials, whoWeAreContent, fromOurKitchenContent] = await Promise.all([
    getFeaturedProducts(),
    getTestimonials(),
    getWhoWeAreContent(),
    getFromOurKitchenContent(),
  ]);

  return (
    <>
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
