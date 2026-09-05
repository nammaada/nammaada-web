import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { siteConfig, storefrontRoutes } from "@/lib/constants/site";

export function StorefrontFooter() {
  return (
    <footer className="bg-[#4a0e17] text-[#fffaf1]">
      <Container className="py-8 sm:py-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-12">
        {/* Brand statement */}
        <div className="space-y-3">
          <Link href="/" aria-label={`${siteConfig.name} home`}>
            <Image
              src="/namma-ada-logo.png"
              alt="Namma Ada"
              width={140}
              height={90}
              className="h-12 w-auto object-contain brightness-0 invert"
            />
          </Link>
          <p className="max-w-xs text-xs sm:text-sm leading-relaxed text-[#fffaf1]/80">
            {siteConfig.tagline}
          </p>
        </div>

        {/* Explore Links */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">Explore</h3>
          <nav className="mt-3 flex flex-col items-start gap-2.5" aria-label="Footer navigation">
            {storefrontRoutes.map((route) => (
              <Link
                key={route.href}
                className="text-xs sm:text-sm text-[#fffaf1]/85 transition-colors hover:text-white"
                href={route.href}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">Stay Connected</h3>
          <div className="mt-3">
            <Link
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#fffaf1]/30 bg-white/10 px-4 text-xs sm:text-sm font-semibold transition-colors hover:bg-white/20 active:scale-95"
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Visit Namma Ada on Instagram"
            >
              <ArrowUpRight aria-hidden="true" size={16} />
              Instagram
            </Link>
          </div>
        </div>
      </Container>

      {/* Copyright */}
      <div className="border-t border-[#fffaf1]/15 py-4 text-center sm:text-left">
        <Container className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between text-[11px] sm:text-xs text-[#fffaf1]/65">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <p>Made with tradition. Shared with love.</p>
        </Container>
      </div>
    </footer>
  );
}

