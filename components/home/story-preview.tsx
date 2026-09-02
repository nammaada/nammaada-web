import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";

export function StoryPreview() {
  return (
    <section className="section-shell overflow-hidden">
      <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
        <div className="relative min-h-72 overflow-hidden rounded-[2rem] border border-border bg-[radial-gradient(circle_at_50%_35%,rgb(212_175_55_/_0.25),transparent_22%),linear-gradient(145deg,rgb(244_239_235),rgb(241_232_217))] p-8 shadow-soft sm:min-h-96">
          <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2rem] border border-primary/25 bg-card/60 shadow-[0_12px_30px_rgb(74_14_23_/_0.08)] sm:h-56 sm:w-56" aria-hidden="true" />
          <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[1.5rem] border border-accent/30 bg-accent/10" aria-hidden="true" />
          <div className="absolute -left-10 top-10 h-36 w-12 -rotate-[42deg] rounded-[100%_0] border border-primary/15" aria-hidden="true" />
          <div className="absolute -right-8 bottom-10 h-36 w-12 rotate-[42deg] rounded-[0_100%] border border-primary/15" aria-hidden="true" />
          <p className="absolute inset-x-8 bottom-8 text-center font-display text-2xl text-primary sm:text-3xl">From our kitchen to your table.</p>
        </div>
        <div>
          <p className="eyebrow">Who we are</p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl leading-[1.02] text-foreground sm:text-5xl">A little taste of home, made with a whole lot of love.</h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">Namma Ada is a Bangalore-based Kerala delicacy brand inspired by recipes passed down through generations. Rooted in authenticity and made fresh for every order, we bring Kerala&apos;s timeless taste to your table.</p>
          <Link className="mt-7 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" href="/about">Read our story <ArrowUpRight aria-hidden="true" size={16} /></Link>
        </div>
      </Container>
    </section>
  );
}
