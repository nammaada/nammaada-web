import { getActiveHeroBanners } from "@/lib/storefront/hero";
import { HeroSlider } from "@/components/home/hero-slider";

export async function HeroSection() {
  const banners = await getActiveHeroBanners();

  return <HeroSlider banners={banners} />;
}

