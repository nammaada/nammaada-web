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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!menuOpen) return;

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
    <>
      <header className={isHome ? "absolute inset-x-0 top-0 z-50 bg-transparent" : "sticky top-0 z-40 bg-transparent transition-colors"}>
        <Container className="py-3 sm:py-3.5">
          <div className="flex min-h-14 sm:min-h-16 items-center justify-between gap-3 sm:gap-4 rounded-full border border-white/50 bg-gradient-to-br from-white/55 via-[#fcf7ee]/32 to-[#f5e8d5]/22 backdrop-blur-xl px-3.5 sm:px-6 shadow-[0_10px_30px_-8px_rgba(43,23,25,0.06),inset_0_1px_1.5px_0_rgba(255,255,255,0.75)] transition-all">
            {/* LOGO */}
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
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </Link>

            {/* DESKTOP NAV LINKS */}
            <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
              {storefrontRoutes.map((route) => {
                const active = isActivePath(pathname, route.href);
                return (
                  <Link
                    className={`relative py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring ${
                      active
                        ? "text-[#711e2c]"
                        : "text-[#2b1719]/75 hover:text-[#711e2c]"
                    }`}
                    href={route.href}
                    key={route.href}
                    aria-current={active ? "page" : undefined}
                  >
                    {route.label}
                    {active && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-[2.5px] w-5 rounded-full bg-[#711e2c]" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* ACTIONS: CART + ORDER NOW (Desktop) / MENU TOGGLE (Mobile) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Cart Link (Always visible, touch friendly) */}
              <Link
                aria-label={
                  itemCount > 0
                    ? `Cart with ${itemCount} ${itemCount === 1 ? "item" : "items"}`
                    : "Cart, empty"
                }
                className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3.5 text-xs sm:text-sm font-semibold text-[#711e2c] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-95 border border-white/60 bg-white/40 backdrop-blur-xs shadow-xs hover:bg-white/65 hover:border-white/80"
                href="/cart"
                onClick={closeMenu}
              >
                <ShoppingBag aria-hidden="true" size={18} />
                <span className="hidden sm:inline">Cart</span>
                {itemCount > 0 ? (
                  <span
                    aria-live="polite"
                    className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#d4af37] px-1.5 py-0.5 text-xs text-[#2b1719] font-bold"
                  >
                    {itemCount}
                  </span>
                ) : null}
              </Link>

              {/* Order Now CTA (Desktop only) */}
              <Link
                className="hidden min-h-11 items-center justify-center rounded-full bg-[#711e2c] px-5 sm:px-6 text-xs sm:text-sm font-semibold text-white shadow-xs transition-all duration-200 hover:bg-[#5a1723] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-95 lg:inline-flex"
                href="/products"
              >
                Order Now
              </Link>

              {/* Mobile Menu Toggle Button [Logo] [Cart] [Menu] */}
              <button
                ref={menuButtonRef}
                aria-controls="mobile-storefront-drawer"
                aria-expanded={menuOpen}
                aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-[#711e2c] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden active:scale-95 border border-white/60 bg-white/40 hover:bg-white/70 backdrop-blur-xs shadow-xs"
                onClick={() => setMenuOpen((open) => !open)}
                type="button"
              >
                {menuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* MOBILE NAVIGATION DRAWER OVERLAY */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-[#fbf7ef] lg:hidden animate-in fade-in duration-200"
          id="mobile-storefront-drawer"
        >
          {/* Drawer Header */}
          <div className="border-b border-[#e5d8c6] bg-[#fffdf8] py-3.5">
            <Container className="flex items-center justify-between">
              <Link href="/" onClick={closeMenu} aria-label={`${siteConfig.name} home`}>
                <Image
                  src="/namma-ada-logo.png"
                  alt="Namma Ada"
                  width={130}
                  height={80}
                  className="h-10 w-auto object-contain"
                />
              </Link>

              <button
                aria-label="Close navigation menu"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[#e5d8c6] bg-[#f4efeb] text-[#711e2c]"
                onClick={closeMenu}
                type="button"
              >
                <X size={20} />
              </button>
            </Container>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto py-6">
            <Container className="flex flex-col h-full justify-between gap-8">
              <nav className="flex flex-col gap-2" aria-label="Mobile menu navigation">
                {storefrontRoutes.map((route) => {
                  const active = isActivePath(pathname, route.href);
                  return (
                    <Link
                      className={`flex min-h-12 items-center rounded-2xl px-5 text-base font-semibold transition-colors ${
                        active
                          ? "bg-[#711e2c] text-white"
                          : "text-[#2b1719] hover:bg-[#f4efeb] active:bg-[#e5d8c6]/50"
                      }`}
                      href={route.href}
                      key={route.href}
                      onClick={closeMenu}
                      aria-current={active ? "page" : undefined}
                    >
                      {route.label}
                    </Link>
                  );
                })}

                <Link
                  className={`flex min-h-12 items-center justify-between rounded-2xl px-5 text-base font-semibold transition-colors ${
                    pathname === "/cart"
                      ? "bg-[#711e2c] text-white"
                      : "text-[#2b1719] hover:bg-[#f4efeb]"
                  }`}
                  href="/cart"
                  onClick={closeMenu}
                >
                  <span className="flex items-center gap-2.5">
                    <ShoppingBag size={19} />
                    Cart
                  </span>
                  {itemCount > 0 && (
                    <span className="rounded-full bg-[#d4af37] px-2.5 py-0.5 text-xs text-[#2b1719] font-bold">
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </span>
                  )}
                </Link>
              </nav>

              {/* Bottom Drawer CTA */}
              <div className="pt-4 border-t border-[#e5d8c6] space-y-3">
                <Link
                  className="flex min-h-12 w-full items-center justify-center rounded-full bg-[#711e2c] px-6 text-sm font-semibold text-white shadow-md active:scale-98"
                  href="/products"
                  onClick={closeMenu}
                >
                  Order Now
                </Link>
                <p className="text-center text-xs text-[#6e5b55]">
                  Authentic Kerala delicacies delivered fresh in Bangalore
                </p>
              </div>
            </Container>
          </div>
        </div>
      )}
    </>
  );
}

