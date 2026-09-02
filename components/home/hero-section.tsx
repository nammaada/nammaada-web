import Link from "next/link";
import { ArrowRight, Gift, Heart, Leaf } from "lucide-react";
import { Container } from "@/components/ui/container";
import { getHeroMediaConfig } from "@/lib/storefront/hero";
import { HeroMediaSlot } from "@/components/home/hero-media-slot";

export async function HeroSection() {
  const mediaConfig = await getHeroMediaConfig();

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_78%_22%,rgb(212_175_55_/_0.2),transparent_24%),radial-gradient(circle_at_8%_80%,rgb(255_253_248_/_0.1),transparent_22%),linear-gradient(120deg,rgb(74_14_23),rgb(92_17_30)_55%,rgb(55_8_17))] text-primary-foreground">
      <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
      
      {/* Reduced Height Container for ~620-680px Desktop Visual Height */}
      <Container className="relative grid gap-8 pb-8 pt-24 sm:pb-10 sm:pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-0 lg:pb-12 lg:pt-32">
        <div className="surface-glass order-2 rounded-[2rem] border-primary-foreground/35 bg-primary-foreground/90 p-5 text-foreground shadow-lifted sm:p-8 lg:relative lg:z-10 lg:-mr-12 lg:order-1 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Authentic Kerala flavours</p>
          
          <h1 className="mt-3 max-w-2xl font-display text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.98] tracking-[-0.03em] text-primary">
            Soul of Kerala,<br /> served with heart.
          </h1>
          
          <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
            At Namma Ada, we bring the soul of Kerala into the homes of Bangalore. Every delicacy is handcrafted with tradition and a whole lot of love.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold !text-primary-foreground transition-[background-color,transform] hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring active:translate-y-px" href="/products">
              Explore Now <ArrowRight aria-hidden="true" size={16} />
            </Link>
            <Link className="inline-flex min-h-11 items-center justify-center rounded-full border border-primary/35 px-5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" href="/contact">
              Bulk orders
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-2 border-t border-primary/15 pt-5">
            <div className="flex flex-col gap-1.5 text-xs text-muted-foreground"><Leaf aria-hidden="true" className="text-primary shrink-0" size={18} /><span>Authentic Kerala taste</span></div>
            <div className="flex flex-col gap-1.5 border-l border-primary/15 pl-3 text-xs text-muted-foreground"><Heart aria-hidden="true" className="text-primary shrink-0" size={18} /><span>Made with love</span></div>
            <div className="flex flex-col gap-1.5 border-l border-primary/15 pl-3 text-xs text-muted-foreground"><Gift aria-hidden="true" className="text-primary shrink-0" size={18} /><span>Bulk orders welcome</span></div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <HeroMediaSlot config={mediaConfig} />
        </div>
      </Container>
    </section>
  );
}
