import { BrandValues } from "@/components/home/brand-values";
import { CelebrationCta } from "@/components/home/celebration-cta";
import { FeaturedProducts } from "@/components/home/featured-products";
import { HeroSection } from "@/components/home/hero-section";
import { InstagramPreview } from "@/components/home/instagram-preview";
import { StoryPreview } from "@/components/home/story-preview";
import { Testimonials } from "@/components/home/testimonials";
import { getFeaturedProducts } from "@/lib/storefront/products";
import { getTestimonials } from "@/lib/storefront/testimonials";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredProducts, testimonials] = await Promise.all([
    getFeaturedProducts(),
    getTestimonials(),
  ]);

  return (
    <>
      <HeroSection />
      <FeaturedProducts products={featuredProducts} />
      <BrandValues />
      <StoryPreview />
      <InstagramPreview />
      <Testimonials testimonials={testimonials} />
      <CelebrationCta />
    </>
  );
}
