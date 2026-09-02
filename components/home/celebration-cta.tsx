import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";
import { Container } from "@/components/ui/container";

export function CelebrationCta() {
  return (
    <section className="pb-16 sm:pb-24">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_90%_50%,rgb(212_175_55_/_0.18),transparent_25%),linear-gradient(115deg,rgb(74_14_23),rgb(102_20_35))] px-6 py-10 text-primary-foreground sm:px-10 sm:py-12 lg:grid lg:grid-cols-[1fr_0.8fr] lg:items-center lg:gap-12">
          <div className="absolute -bottom-24 -right-10 h-56 w-56 rounded-full border border-accent/25" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-3 text-accent"><Gift aria-hidden="true" size={22} /><span className="text-xs font-semibold uppercase tracking-[0.18em]">Bulk orders welcome</span></div>
            <h2 className="mt-5 max-w-2xl font-display text-3xl leading-tight sm:text-4xl">Planning a celebration?</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground/75">Make your occasion sweeter with authentic Kerala favourites, prepared fresh for festivals, family gatherings, and gifting.</p>
          </div>
          <div className="relative mt-8 rounded-2xl border border-primary-foreground/25 bg-primary-foreground/10 p-4 backdrop-blur-sm lg:mt-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground/65">Bulk enquiry</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="h-10 rounded-full border border-primary-foreground/15 bg-primary-foreground/10" aria-hidden="true" />
              <div className="h-10 rounded-full border border-primary-foreground/15 bg-primary-foreground/10" aria-hidden="true" />
            </div>
            <div className="mt-2 h-10 rounded-full border border-primary-foreground/15 bg-primary-foreground/10" aria-hidden="true" />
            <Link className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary-foreground px-5 text-sm font-semibold text-primary transition-[background-color,transform] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px" href="/contact">Start an enquiry <ArrowRight aria-hidden="true" size={17} /></Link>
            <p className="mt-2 text-center text-[0.6875rem] text-primary-foreground/55">Enquiry form coming soon</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
