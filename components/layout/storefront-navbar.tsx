"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { siteConfig, storefrontRoutes } from "@/lib/constants/site";
import { Container } from "@/components/ui/container";
import { useCart } from "@/components/cart/cart-provider";

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

export function StorefrontNavbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  function closeMenu() {
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  return (
    <header className={isHome ? "absolute inset-x-0 top-0 z-50 bg-transparent" : "sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-sm"}>
      <Container className={isHome ? "py-4 sm:py-5" : "py-2 sm:py-3"}>
        <div className={`flex min-h-16 items-center justify-between gap-4 rounded-full border px-4 backdrop-blur-xl sm:px-6 ${
          isHome
            ? "border-white/65 bg-white/50 shadow-lg shadow-amber-950/5 transition-all"
            : "border-border/70 bg-card/80 shadow-soft"
        }`}>
          <Link
            className="shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            href="/"
            onClick={closeMenu}
            aria-label={`${siteConfig.name} home`}
          >
            <Image
              src="/namma-ada-logo.png"
              alt="Namma Ada"
              width={144}
              height={96}
              priority
              className="h-12 w-auto object-contain sm:h-14"
            />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary navigation">
            {storefrontRoutes.map((route) => {
              const active = isActivePath(pathname, route.href);
              return (
                <Link
                  className={`relative py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring ${
                    active
                      ? "text-[#4a0e17] font-semibold"
                      : "text-[#3d1a20]/80 hover:text-[#4a0e17]"
                  }`}
                  href={route.href}
                  key={route.href}
                  aria-current={active ? "page" : undefined}
                >
                  {route.label}
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-[3px] w-6 rounded-full bg-[#4a0e17]" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              aria-label={itemCount > 0 ? `Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}` : "Cart, empty"}
              className="inline-flex min-h-10 min-w-10 items-center justify-center gap-2 rounded-full border border-white/60 bg-white/35 px-3.5 text-xs sm:text-sm font-semibold text-[#4a0e17] transition-all hover:bg-white/65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring backdrop-blur-md"
              href="/cart"
            >
              <ShoppingBag aria-hidden="true" size={17} />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 ? <span aria-live="polite" className="inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-xs text-accent-foreground font-bold">{itemCount}</span> : null}
            </Link>
            <Link className="hidden min-h-10 items-center justify-center rounded-full bg-[#5c111a] px-6 text-xs sm:text-sm font-semibold !text-white shadow-md transition-all duration-200 hover:bg-[#480d14] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-95 lg:inline-flex" href="/products">
              Order Now
            </Link>
          </div>
          <button
            ref={menuButtonRef}
            aria-controls="mobile-storefront-navigation"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-white/60 bg-white/40 text-[#4a0e17] transition-colors hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            {menuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
          </button>
        </div>
      </Container>

      {menuOpen ? (
        <div className="border-t border-border/70 bg-card lg:hidden" id="mobile-storefront-navigation">
          <Container className="py-4">
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
              {storefrontRoutes.map((route) => {
                const active = isActivePath(pathname, route.href);
                return (
                  <Link
                    className={`rounded-lg px-3 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${active ? "bg-secondary text-primary" : "text-foreground hover:bg-secondary/70"}`}
                    href={route.href}
                    key={route.href}
                    onClick={closeMenu}
                    aria-current={active ? "page" : undefined}
                  >
                    {route.label}
                  </Link>
                );
              })}
              <Link className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 !text-primary-foreground shadow-sm transition-[background-color,box-shadow,transform] duration-200 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px" href="/products" onClick={closeMenu}>
                Order Now
              </Link>
            </nav>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
