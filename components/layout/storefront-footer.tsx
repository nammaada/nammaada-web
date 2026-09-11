import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { siteConfig, storefrontRoutes } from "@/lib/constants/site";
import { CopyrightYear } from "@/components/layout/copyright-year";

export function StorefrontFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#711e2c] text-[#fffcf2]">
      {/* Decorative floral background: desktop uses full footer-bg.png; mobile uses subtle corner leaves */}
      <div className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden">
        {/* Desktop / tablet: full panoramic decorative background */}
        <div className="relative h-full w-full hidden sm:block">
          <Image
            src="/footer-bg.webp"
            alt=""
            fill
            priority={false}
            loading="lazy"
            decoding="async"
            className="object-cover object-bottom"
          />
        </div>

        {/* Mobile: clean continuous maroon with small decorative leaves in the bottom corners */}
        <div className="relative h-full w-full block sm:hidden">
          {/* Left corner leaves (small, subtle, positioned at bottom corner) */}
          <div className="absolute bottom-0 left-0 w-40 pointer-events-none select-none z-0">
            <Image
              src="/footer-leaf-left.webp"
              alt=""
              width={235}
              height={170}
              loading="lazy"
              decoding="async"
              className="h-auto w-full object-contain object-left-bottom opacity-40"
            />
          </div>
          {/* Right corner leaves (small, subtle, positioned at bottom corner) */}
          <div className="absolute bottom-0 right-0 w-40 pointer-events-none select-none z-0">
            <Image
              src="/footer-leaf-right.webp"
              alt=""
              width={235}
              height={170}
              loading="lazy"
              decoding="async"
              className="h-auto w-full object-contain object-right-bottom opacity-40"
            />
          </div>
        </div>
      </div>

      <Container className="relative z-10 pt-5 pb-3 sm:pt-7 sm:pb-5 lg:pt-8 lg:pb-5 sm:max-w-3xl lg:max-w-[860px] mx-auto">
        {/* MOBILE LAYOUT (sm:hidden): Clean, compact 2-column side-by-side */}
        <div className="grid grid-cols-2 gap-4 items-start text-left sm:hidden">
          {/* Left Column: Logo + Brand + Contact */}
          <div className="flex flex-col items-start gap-2">
            <Link href="/" aria-label={`${siteConfig.name} home`}>
              <div className="size-16 rounded-full bg-[#fbf7ef] flex items-center justify-center p-2.5 shrink-0 shadow-sm border border-[#e5d8c6]/30">
                <Image
                  src="/namma-ada-logo.png"
                  alt="Namma Ada"
                  width={90}
                  height={60}
                  className="w-auto h-auto max-w-[85%] max-h-[85%] object-contain"
                />
              </div>
            </Link>
            <p className="text-[11px] leading-snug text-[#fffcf2]/85">
              {siteConfig.tagline}
            </p>
            <div className="flex flex-col gap-1.5 pt-1 text-[11px] text-[#ffeec9]">
              <a href="tel:+919995811622" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
                <Phone size={11} className="text-[#f3c87a] shrink-0" />
                <span>+91 9995811622</span>
              </a>
              <a href="mailto:namaste@nammaada.com" className="inline-flex items-center gap-1.5 hover:text-white transition-colors truncate max-w-[145px]">
                <Mail size={11} className="text-[#f3c87a] shrink-0" />
                <span className="truncate">namaste@nammaada.com</span>
              </a>
            </div>
          </div>

          {/* Right Column: Explore Links (2 side-by-side columns) + Instagram */}
          <div className="flex flex-col items-start pl-1 gap-3.5">
            <div className="w-full">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#fbf7ef]">Explore</h3>
              {/* 2 side-by-side columns: Home & Products on left, About & Contact on right */}
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-[12.5px] font-medium text-[#fffcf2]/95" aria-label="Mobile footer navigation">
                {/* Column 1: Home & Products */}
                <div className="flex flex-col gap-2">
                  <Link href="/" className="hover:text-white transition-colors py-0.5" prefetch={true}>
                    Home
                  </Link>
                  <Link href="/products" className="hover:text-white transition-colors py-0.5" prefetch={true}>
                    Products
                  </Link>
                </div>

                {/* Column 2: About & Contact */}
                <div className="flex flex-col gap-2">
                  <Link href="/about" className="hover:text-white transition-colors py-0.5" prefetch={true}>
                    About
                  </Link>
                  <Link href="/contact" className="hover:text-white transition-colors py-0.5" prefetch={true}>
                    Contact
                  </Link>
                </div>
              </div>
            </div>

            <div className="pt-0.5">
              <Link
                className="inline-flex items-center gap-1.5 rounded-full border border-[#fffcf2]/30 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-[#fffcf2] hover:bg-white/20 active:scale-95 transition-all shadow-xs"
                href={siteConfig.instagramUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Visit Namma Ada on Instagram"
              >
                <ArrowUpRight aria-hidden="true" size={13} />
                <span>Instagram</span>
              </Link>
            </div>
          </div>
        </div>

        {/* DESKTOP / TABLET LAYOUT (hidden sm:grid): 3-column layout with cream logo circle */}
        <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-[1.5fr_1fr_1fr] sm:gap-8 lg:gap-8 text-left items-start">
          {/* Brand statement */}
          <div className="space-y-3 flex flex-col items-start text-left w-full">
            <Link href="/" aria-label={`${siteConfig.name} home`} className="inline-flex items-center justify-start">
              <div className="size-20 rounded-full bg-[#fbf7ef] flex items-center justify-center p-3 sm:p-3.5 shrink-0 shadow-sm border border-[#e5d8c6]/30">
                <Image
                  src="/namma-ada-logo.png"
                  alt="Namma Ada"
                  width={140}
                  height={90}
                  className="w-auto h-auto max-w-[210%] max-h-[82%] object-contain"
                />
              </div>
            </Link>
            <p className="max-w-xs text-xs sm:text-sm leading-relaxed text-[#fffcf2]/90 text-left">
              {siteConfig.tagline}
            </p>
          </div>

          {/* Explore Links */}
          <div className="flex flex-col items-start w-full">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#fbf7ef] text-left">Explore</h3>
            <nav className="mt-2.5 flex flex-col items-start gap-2 w-full" aria-label="Footer navigation">
              {storefrontRoutes.map((route) => (
                <Link
                  key={route.href}
                  className="text-xs sm:text-sm text-[#fffcf2]/90 transition-colors hover:text-white text-left"
                  href={route.href}
                  prefetch={true}
                >
                  {route.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social & Contact */}
          <div className="flex flex-col items-start w-full">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#fbf7ef] text-left">Stay Connected</h3>
            <div className="mt-2.5 flex flex-col items-start gap-2.5 w-full">
              <Link
                className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#fffcf2]/30 bg-white/10 px-3.5 text-xs sm:text-sm font-semibold transition-colors hover:bg-white/20 active:scale-95 text-[#fffcf2]"
                href={siteConfig.instagramUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Visit Namma Ada on Instagram"
              >
                <ArrowUpRight aria-hidden="true" size={14} />
                Instagram
              </Link>

              {/* Highlighted Email & Phone */}
              <div className="flex flex-col items-start gap-2 w-full pt-0.5">
                <a
                  href="mailto:namaste@nammaada.com"
                  className="group inline-flex items-center gap-2 rounded-full border border-[#f3c87a]/40 bg-[#f3c87a]/15 px-3 py-1.5 text-xs sm:text-[13px] font-semibold text-[#ffeec9] transition-all hover:bg-[#f3c87a]/25 hover:border-[#f3c87a]/70 hover:text-white shadow-xs"
                  aria-label="Send email to namaste@nammaada.com"
                >
                  <Mail size={13} className="shrink-0 text-[#f3c87a] group-hover:scale-110 transition-transform" />
                  <span className="tracking-wide">namaste@nammaada.com</span>
                </a>

                <a
                  href="tel:+919995811622"
                  className="group inline-flex items-center gap-2 rounded-full border border-[#f3c87a]/40 bg-[#f3c87a]/15 px-3 py-1.5 text-xs sm:text-[13px] font-semibold text-[#ffeec9] transition-all hover:bg-[#f3c87a]/25 hover:border-[#f3c87a]/70 hover:text-white shadow-xs"
                  aria-label="Call +91 9995811622"
                >
                  <Phone size={13} className="shrink-0 text-[#f3c87a] group-hover:scale-110 transition-transform" />
                  <span className="tracking-wide">+91 9995811622</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Copyright & Company Credit - Balanced, Compact Bottom Bar */}
      <div className="relative z-10 border-t border-[#fffcf2]/15 py-2.5 sm:py-3.5">
        <Container className="relative sm:max-w-3xl lg:max-w-[860px] mx-auto">
          <div className="relative flex flex-col items-center gap-1.5 text-center sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-[#fffcf2] font-normal">
            {/* Left: Copyright */}
            <p className="text-center sm:text-left sm:flex-1">
              © <CopyrightYear /> {siteConfig.name}. All rights reserved.
            </p>

            {/* Center: CRAFTED BY EKODRIX (exact horizontal center on desktop) */}
            <p className="text-[10px] sm:text-xs font-semibold tracking-widest text-[#fffcf2]/95 uppercase text-center sm:absolute sm:left-1/2 sm:-translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2 whitespace-nowrap">
              CRAFTED BY EKODRIX
            </p>

            {/* Right: Tradition text */}
            <p className="text-center sm:text-right sm:flex-1">
              Made with tradition. Shared with love.
            </p>
          </div>
        </Container>
      </div>
    </footer>
  );
}
