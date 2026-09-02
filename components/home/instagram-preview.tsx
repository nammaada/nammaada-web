import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/constants/site";

export function InstagramPreview() {
  return (
    <section className="section-shell bg-secondary/45">
      <Container>
        <div className="rounded-[2rem] border border-border bg-card/70 px-6 py-12 text-center sm:px-10">
          <p className="eyebrow">From our kitchen</p>
          <h2 className="mt-3 font-display text-3xl text-foreground sm:text-4xl">A glimpse of what&apos;s being made.</h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-muted-foreground">A curated look at Namma Ada&apos;s kitchen will be shared here soon.</p>
          <Link className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/30 px-5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" href={siteConfig.instagramUrl} target="_blank" rel="noreferrer">Follow us on Instagram <ArrowUpRight aria-hidden="true" size={16} /></Link>
        </div>
      </Container>
    </section>
  );
}
