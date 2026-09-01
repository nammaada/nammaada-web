import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { siteConfig, storefrontRoutes } from "@/lib/constants/site";

export function StorefrontFooter() {
  return (
    <footer className="border-t border-primary/20 bg-primary text-primary-foreground">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 sm:py-14 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-16">
        <div>
          <Image
            src="/namma-ada-logo.png"
            alt="Namma Ada"
            width={156}
            height={104}
            className="h-16 w-auto object-contain brightness-0 invert"
          />
          <p className="mt-4 max-w-xs text-sm leading-6 text-primary-foreground/75">
            {siteConfig.tagline}
          </p>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/60">Explore</h2>
          <nav className="mt-4 flex flex-col items-start gap-3" aria-label="Footer navigation">
            {storefrontRoutes.map((route) => (
              <Link className="text-sm text-primary-foreground/80 transition-colors hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent" href={route.href} key={route.href}>
                {route.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/60">Stay connected</h2>
          <Link
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-primary-foreground/30 px-4 text-sm font-semibold transition-colors hover:bg-primary-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            href={siteConfig.instagramUrl}
            target="_blank"
            rel="noreferrer"
          >
            <ArrowUpRight aria-hidden="true" size={17} />
            Instagram
          </Link>
        </div>
      </Container>
      <div className="border-t border-primary-foreground/15">
        <Container className="flex flex-col gap-2 py-5 text-xs text-primary-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <p>Made with tradition. Shared with love.</p>
        </Container>
      </div>
    </footer>
  );
}
