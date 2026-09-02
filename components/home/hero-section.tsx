import Link from "next/link";
import { ArrowRight, Gift, Heart, Leaf } from "lucide-react";
import { Container } from "@/components/ui/container";

function FoodImageSlot() {
  return (
    <div
      className="relative min-h-80 overflow-hidden rounded-[2rem] border border-primary-foreground/25 bg-[radial-gradient(circle_at_62%_35%,rgb(212_175_55_/_0.3),transparent_18%),radial-gradient(circle_at_20%_80%,rgb(255_253_248_/_0.12),transparent_28%),linear-gradient(135deg,rgb(112_24_34),rgb(53_8_17))] shadow-lifted sm:min-h-[27rem] lg:min-h-[34rem]"
      role="img"
      aria-label="Reserved space for approved Namma Ada food photography"
    >
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-accent/30 bg-accent/10 blur-sm" aria-hidden="true" />
      <div className="absolute -bottom-14 -left-10 h-48 w-48 rounded-full border border-primary-foreground/15" aria-hidden="true" />
      <div className="absolute left-12 top-16 h-28 w-12 -rotate-[42deg] rounded-[100%_0] border border-accent/35 bg-accent/10" aria-hidden="true" />
      <div className="absolute bottom-28 right-16 h-24 w-10 rotate-[42deg] rounded-[0_100%] border border-primary-foreground/20 bg-primary-foreground/10" aria-hidden="true" />
      <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary-foreground/15 bg-primary-foreground/5 shadow-[0_24px_60px_rgb(0_0_0_/_0.18)] sm:h-72 sm:w-72" aria-hidden="true" />
      <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/30 bg-accent/10 sm:h-48 sm:w-48" aria-hidden="true" />
      <div className="absolute right-5 top-5 inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary/35 px-4 py-3 text-xs font-semibold text-primary-foreground/85 backdrop-blur-sm sm:right-7 sm:top-7">
        <Leaf aria-hidden="true" className="text-accent" size={17} />
        Crafted with care
      </div>
      <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-primary-foreground/20 bg-primary/35 px-4 py-3 text-center backdrop-blur-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground/75">Approved food imagery slot</p>
        <p className="mt-1 text-xs text-primary-foreground/60">Photography can be added here when approved.</p>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_78%_22%,rgb(212_175_55_/_0.2),transparent_24%),radial-gradient(circle_at_8%_80%,rgb(255_253_248_/_0.1),transparent_22%),linear-gradient(120deg,rgb(74_14_23),rgb(92_17_30)_55%,rgb(55_8_17))] text-primary-foreground">
      <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
      <Container className="relative grid gap-8 pb-8 pt-32 sm:pb-12 sm:pt-40 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-0 lg:pb-16 lg:pt-44">
        <div className="surface-glass order-2 rounded-[2rem] border-primary-foreground/35 bg-primary-foreground/90 p-6 text-foreground shadow-lifted sm:p-9 lg:relative lg:z-10 lg:-mr-12 lg:order-1 lg:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Authentic Kerala flavours</p>
          <h1 className="mt-5 max-w-2xl font-display text-[clamp(2.65rem,8vw,5.5rem)] leading-[0.96] tracking-[-0.03em] text-primary">
            Soul of Kerala,<br /> served with heart.
          </h1>
          <p className="mt-6 max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">
            At Namma Ada, we bring the soul of Kerala into the homes of Bangalore. Every delicacy is handcrafted with tradition and a whole lot of love.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 !text-primary-foreground transition-[background-color,transform] hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring active:translate-y-px" href="/products">
              Explore Now <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <Link className="inline-flex min-h-12 items-center justify-center rounded-full border border-primary/35 px-5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" href="/contact">
              Bulk orders
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-3 border-t border-primary/15 pt-6">
            <div className="flex flex-col gap-2 text-xs text-muted-foreground"><Leaf aria-hidden="true" className="text-primary" size={20} /><span>Authentic Kerala taste</span></div>
            <div className="flex flex-col gap-2 border-l border-primary/15 pl-3 text-xs text-muted-foreground"><Heart aria-hidden="true" className="text-primary" size={20} /><span>Made with love</span></div>
            <div className="flex flex-col gap-2 border-l border-primary/15 pl-3 text-xs text-muted-foreground"><Gift aria-hidden="true" className="text-primary" size={20} /><span>Bulk orders welcome</span></div>
          </div>
        </div>
        <div className="order-1 lg:order-2"><FoodImageSlot /></div>
      </Container>
    </section>
  );
}
