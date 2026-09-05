import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { siteConfig, storefrontRoutes } from "@/lib/constants/site";

export function StorefrontFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#711e2c] text-[#fffcf2]">
      {/* Full floral background image across the entire footer */}
      <div className="pointer-events-none absolute inset-0 z-0 select-none">
        <Image
          src="/footer-bg.png"
          alt=""
          fill
          priority={false}
          className="object-cover object-bottom"
        />
      </div>

      <Container className="relative z-10 py-10 sm:py-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-12 text-center sm:text-left">
        {/* Brand statement */}
        <div className="space-y-3 flex flex-col items-center sm:items-start text-center sm:text-left">
          <Link href="/" aria-label={`${siteConfig.name} home`} className="inline-block">
            <Image
              src="/namma-ada-logo.png"
              alt="Namma Ada"
              width={140}
              height={90}
              className="h-12 w-auto object-contain brightness-0 invert mx-auto sm:mx-0"
            />
          </Link>
          <p className="max-w-xs text-xs sm:text-sm leading-relaxed text-[#fffcf2]/90 mx-auto sm:mx-0">
            {siteConfig.tagline}
          </p>
        </div>

        {/* Explore Links */}
        <div className="flex flex-col items-center sm:items-start">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">Explore</h3>
          <nav className="mt-3 flex flex-col items-center sm:items-start gap-2.5" aria-label="Footer navigation">
            {storefrontRoutes.map((route) => (
              <Link
                key={route.href}
                className="text-xs sm:text-sm text-[#fffcf2]/90 transition-colors hover:text-white"
                href={route.href}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Social */}
        <div className="flex flex-col items-center sm:items-start">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">Stay Connected</h3>
          <div className="mt-3 flex justify-center sm:justify-start">
            <Link
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#fffcf2]/30 bg-white/10 px-4 text-xs sm:text-sm font-semibold transition-colors hover:bg-white/20 active:scale-95 text-[#fffcf2]"
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

      {/* Copyright & Company Credit */}
      <div className="relative z-10 border-t border-[#fffcf2]/20 py-6 pb-8">
        <Container className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-[#fffcf2] font-normal text-center sm:text-left">
            <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
            <p>Made with tradition. Shared with love.</p>
          </div>
          <div className="pt-2 text-center">
            <p className="text-[11px] sm:text-xs font-medium tracking-widest text-[#fffcf2]/90 uppercase">
              CRAFTED BY EKODRIX
            </p>
          </div>
        </Container>
      </div>
    </footer>
  );
}
