import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronRight, Mail, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { siteConfig, storefrontRoutes } from "@/lib/constants/site";
import { CopyrightYear } from "@/components/layout/copyright-year";

function InstagramIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

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
          {/* Left corner leaves */}
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
          {/* Right corner leaves */}
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

      <Container className="relative z-10 pt-6 pb-4 sm:pt-8 sm:pb-6 lg:pt-9 lg:pb-6 sm:max-w-3xl lg:max-w-[860px] mx-auto">
        {/* MOBILE LAYOUT (sm:hidden): Matches Image 2 side-by-side with vertical divider */}
        <div className="grid grid-cols-[1.1fr_1fr] gap-3 items-start text-left sm:hidden">
          {/* Left Column: Logo + Brand + Gold line + Contact with badges */}
          <div className="flex flex-col items-start gap-1.5">
            <Link href="/" aria-label={`${siteConfig.name} home`}>
              <div className="size-16 rounded-full bg-[#f8d9b3] flex items-center justify-center p-2 shrink-0 shadow-sm border border-[#e7be8b]/40">
                <Image
                  src="/namma-ada-logo.png"
                  alt="Namma Ada"
                  width={90}
                  height={60}
                  className="w-auto h-auto max-w-[85%] max-h-[85%] object-contain"
                />
              </div>
            </Link>

            <div className="pt-0.5">
              <p className="font-serif text-[11px] leading-tight text-[#fffcf2]">
                Soul Of Kerala,
              </p>
              <p className="font-serif text-[11px] leading-tight text-[#fffcf2]">
                Served With Heart.
              </p>
            </div>

            {/* Gold divider line */}
            <div className="w-8 h-[1px] bg-[#f3c87a]/60 my-0.5" />

            {/* Contact items with circular badges */}
            <div className="flex flex-col gap-1.5 pt-0.5 text-[11px] text-[#fffcf2]/90 w-full">
              <a
                href="tel:+919995811622"
                className="group flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <span className="size-5 rounded-full bg-black/20 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                  <Phone size={9} className="text-[#fffcf2]" />
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium">+91 9995811622</span>
              </a>
              <a
                href="mailto:namaste@nammaada.com"
                className="group flex items-center gap-1.5 hover:text-white transition-colors truncate max-w-[130px]"
              >
                <span className="size-5 rounded-full bg-black/20 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                  <Mail size={9} className="text-[#fffcf2]" />
                </span>
                <span className="truncate text-[10px] sm:text-[11px] font-medium">namaste@nammaada.co...</span>
              </a>
            </div>
          </div>

          {/* Right Column: EXPLORE with chevrons + Instagram button with vertical divider */}
          <div className="flex flex-col items-start border-l border-white/15 pl-3.5 h-full justify-between">
            <div className="w-full">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#fbf7ef]">
                Explore
              </h3>
              <nav className="mt-2 flex flex-col gap-1 w-full" aria-label="Mobile footer explore navigation">
                {storefrontRoutes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    prefetch={true}
                    className="group flex items-center justify-between text-xs text-[#fffcf2]/90 hover:text-white transition-colors py-0.5"
                  >
                    <span>{route.label}</span>
                    <ChevronRight size={13} className="text-[#fffcf2]/50 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </nav>
            </div>

            {/* Instagram Button */}
            <div className="pt-2 w-full">
              <Link
                href={siteConfig.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-between w-full max-w-[125px] rounded-full border border-white/25 bg-white/10 px-2.5 py-1.5 text-xs text-[#fffcf2] hover:bg-white/20 active:scale-95 transition-all shadow-xs"
                aria-label="Follow Namma Ada on Instagram"
              >
                <span className="inline-flex items-center gap-1.5 min-w-0">
                  <InstagramIcon className="size-3.5 shrink-0" />
                  <span className="text-[11px] font-medium truncate">Instagram</span>
                </span>
                <ArrowUpRight size={12} className="shrink-0 text-white/70" />
              </Link>
            </div>
          </div>
        </div>

        {/* DESKTOP / TABLET LAYOUT (hidden sm:grid): 3 columns with vertical borders matching Image 2 */}
        <div className="hidden sm:grid sm:grid-cols-[1.25fr_1fr_1.25fr] gap-6 lg:gap-8 text-left items-start">
          {/* Column 1: Brand statement + Contact badges */}
          <div className="space-y-3 flex flex-col items-start text-left w-full">
            <Link href="/" aria-label={`${siteConfig.name} home`} className="inline-flex items-center justify-start">
              <div className="size-24 rounded-full bg-[#f8d9b3] flex items-center justify-center p-3 shrink-0 shadow-sm border border-[#e7be8b]/40">
                <Image
                  src="/namma-ada-logo.png"
                  alt="Namma Ada"
                  width={140}
                  height={90}
                  className="w-auto h-auto max-w-[90%] max-h-[85%] object-contain"
                />
              </div>
            </Link>

            <div>
              <p className="font-serif text-sm leading-snug text-[#fffcf2]">
                Soul Of Kerala,
              </p>
              <p className="font-serif text-sm leading-snug text-[#fffcf2]">
                Served With Heart.
              </p>
            </div>

            {/* Gold accent line */}
            <div className="w-10 h-[1.5px] bg-[#f3c87a]/70 my-0.5 rounded-full" />

            {/* Contact items with circular badges */}
            <div className="flex flex-col gap-2 pt-1 text-xs text-[#fffcf2]/90 w-full">
              <a
                href="tel:+919995811622"
                className="group inline-flex items-center gap-2.5 hover:text-white transition-colors"
              >
                <span className="size-7 rounded-full bg-black/20 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                  <Phone size={12} className="text-[#fffcf2]" />
                </span>
                <span className="font-medium">+91 9995811622</span>
              </a>
              <a
                href="mailto:namaste@nammaada.com"
                className="group inline-flex items-center gap-2.5 hover:text-white transition-colors"
              >
                <span className="size-7 rounded-full bg-black/20 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                  <Mail size={12} className="text-[#fffcf2]" />
                </span>
                <span className="font-medium truncate">namaste@nammaada.com</span>
              </a>
            </div>
          </div>

          {/* Column 2: Explore Links with Chevrons and Left Divider */}
          <div className="flex flex-col items-start w-full border-l border-white/15 pl-6 lg:pl-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#fbf7ef] text-left">
              Explore
            </h3>
            <nav className="mt-3 flex flex-col items-start gap-2.5 w-full max-w-[160px]" aria-label="Footer navigation">
              {storefrontRoutes.map((route) => (
                <Link
                  key={route.href}
                  className="group flex items-center justify-between w-full text-xs sm:text-sm text-[#fffcf2]/90 transition-colors hover:text-white text-left py-0.5"
                  href={route.href}
                  prefetch={true}
                >
                  <span>{route.label}</span>
                  <ChevronRight size={14} className="text-[#fffcf2]/50 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Stay Connected with Left Divider */}
          <div className="flex flex-col items-start w-full border-l border-white/15 pl-6 lg:pl-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#fbf7ef] text-left">
              Stay Connected
            </h3>
            <p className="mt-2.5 text-xs sm:text-sm text-[#fffcf2]/80 leading-relaxed">
              Follow us on Instagram for latest updates and more.
            </p>
            <div className="mt-4 flex flex-col items-start gap-2.5 w-full">
              <Link
                className="inline-flex min-h-10 items-center justify-between gap-3 rounded-full border border-white/25 bg-white/10 px-4 text-xs sm:text-sm font-semibold transition-all hover:bg-white/20 active:scale-95 text-[#fffcf2] w-full max-w-[180px]"
                href={siteConfig.instagramUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Visit Namma Ada on Instagram"
              >
                <span className="inline-flex items-center gap-2">
                  <InstagramIcon className="size-4 shrink-0" />
                  <span>Instagram</span>
                </span>
                <ArrowUpRight aria-hidden="true" size={15} className="text-white/70" />
              </Link>
            </div>
          </div>
        </div>
      </Container>

      {/* Copyright & Floral Credit - Centered stack matching Image 2 */}
      <div className="relative z-10 border-t border-[#fffcf2]/15 pt-3.5 pb-3 sm:pt-4 sm:pb-3.5">
        <Container className="relative sm:max-w-3xl lg:max-w-[860px] mx-auto">
          <div className="flex flex-col items-center justify-center text-center gap-1">
            {/* Line 1: Copyright */}
            <p className="text-[11px] sm:text-xs text-[#fffcf2]/90">
              © <CopyrightYear /> {siteConfig.name}. All rights reserved.
            </p>

            {/* Line 2: CRAFTED BY EKODRIX */}
            <p className="text-[10px] sm:text-[11px] font-semibold tracking-widest text-[#fffcf2]/95 uppercase">
              CRAFTED BY EKODRIX
            </p>

            {/* Line 4: Tradition text */}
            <p className="text-[11px] sm:text-xs text-[#fffcf2]/90">
              Made with tradition. Shared with love.
            </p>
          </div>
        </Container>
      </div>
    </footer>
  );
}
