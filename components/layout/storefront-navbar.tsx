"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { siteConfig, storefrontRoutes } from "@/lib/constants/site";
import { Container } from "@/components/ui/container";
import { useCart } from "@/components/cart/cart-provider";
import { ProductSearchModal } from "@/components/storefront/product-search-modal";

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

export function StorefrontNavbar({ isVideoHero = false }: { isVideoHero?: boolean }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isCreamNavbar = isHome && isVideoHero;
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  function closeMenu() {
    setMenuOpen(false);
  }

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.overscrollBehavior = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
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
          <div
            className={`flex min-h-14 sm:min-h-16 items-center justify-between gap-3 sm:gap-4 rounded-full px-3.5 sm:px-6 transition-[background-color,border-color,box-shadow] duration-300 ${
              isCreamNavbar
                ? "border border-[#e5d8c6] bg-[#fbf7ef] shadow-[0_10px_30px_-8px_rgba(43,23,25,0.14),0_2px_8px_rgba(0,0,0,0.06)]"
                : "border border-white/50 bg-gradient-to-br from-white/55 via-[#fcf7ee]/32 to-[#f5e8d5]/22 backdrop-blur-xl [transform:translateZ(0)] [backface-visibility:hidden] [isolation:isolate] shadow-[0_10px_30px_-8px_rgba(43,23,25,0.06),inset_0_1px_1.5px_0_rgba(255,255,255,0.75)]"
            }`}
          >
            {/* LOGO */}
            <Link
              className="shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              href="/"
              prefetch={true}
              onClick={closeMenu}
              aria-label={`${siteConfig.name} home`}
            >
              <Image
                src="/namma-ada-logo.png"
                alt="Namma Ada"
                width={144}
                height={96}
                priority
                decoding="async"
                sizes="(min-width: 640px) 144px, 120px"
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
                    prefetch={true}
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

            {/* ACTIONS: SEARCH + CART + ORDER NOW (Desktop) / MENU TOGGLE (Mobile) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Button (Desktop & Mobile) */}
              <button
                aria-label="Search delicacies"
                className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-[#711e2c] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-95 cursor-pointer ${
                  isCreamNavbar
                    ? "border border-[#e5d8c6] bg-white/80 shadow-xs hover:bg-white"
                    : "border border-white/60 bg-white/40 shadow-xs hover:bg-white/65 hover:border-white/80"
                }`}
                onClick={() => setSearchOpen(true)}
                type="button"
              >
                <Search aria-hidden="true" size={18} />
              </button>

              {/* Cart Link (Always visible, touch friendly) */}
              <Link
                aria-label={
                  itemCount > 0
                    ? `Cart with ${itemCount} ${itemCount === 1 ? "item" : "items"}`
                    : "Cart, empty"
                }
                className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3.5 sm:px-4 text-xs sm:text-sm font-semibold text-[#711e2c] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-95 ${
                  isCreamNavbar
                    ? "border border-[#e5d8c6] bg-white/80 shadow-xs hover:bg-white"
                    : "border border-white/60 bg-white/40 shadow-xs hover:bg-white/65 hover:border-white/80"
                }`}
                href="/cart"
                prefetch={true}
                onClick={closeMenu}
              >
                <div className="relative inline-flex items-center justify-center">
                  <ShoppingBag aria-hidden="true" size={18} />
                  {itemCount > 0 ? (
                    <span
                      aria-live="polite"
                      className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#711e2c] px-1 text-[10px] font-bold text-white shadow-xs leading-none"
                    >
                      {itemCount}
                    </span>
                  ) : null}
                </div>
                <span className="hidden sm:inline">Cart</span>
              </Link>

              {/* Order Now CTA (Desktop only) */}
              <Link
                className="hidden min-h-11 items-center justify-center rounded-full bg-[#711e2c] px-5 sm:px-6 text-xs sm:text-sm font-semibold text-white shadow-xs transition-all duration-200 hover:bg-[#5a1723] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-95 lg:inline-flex"
                href="/products"
                prefetch={true}
              >
                Order Now
              </Link>

              {/* Mobile Menu Toggle Button [Logo] [Search] [Cart] [Menu] */}
              <button
                ref={menuButtonRef}
                aria-controls="mobile-storefront-drawer"
                aria-expanded={menuOpen}
                aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-[#711e2c] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden active:scale-95 ${
                  isCreamNavbar
                    ? "border border-[#e5d8c6] bg-white/80 hover:bg-white shadow-xs"
                    : "border border-white/60 bg-white/40 hover:bg-white/70 shadow-xs"
                }`}
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
          className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-50 flex flex-col bg-[#fbf7ef] lg:hidden h-[100dvh] w-screen overscroll-contain animate-in fade-in duration-200"
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
              <div className="space-y-4">
                {/* Search Bar in Mobile Menu */}
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    setSearchOpen(true);
                  }}
                  className="flex min-h-12 w-full items-center gap-3 rounded-2xl border border-[#e5d8c6] bg-white px-5 text-sm font-medium text-[#2b1719]/60 shadow-xs active:scale-98 cursor-pointer"
                >
                  <Search size={18} className="text-[#711e2c]" />
                  <span>Search delicacies...</span>
                </button>

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
                        prefetch={true}
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
                    prefetch={true}
                    onClick={closeMenu}
                  >
                    <span className="flex items-center gap-2.5">
                      <ShoppingBag size={19} />
                      Cart
                    </span>
                    {itemCount > 0 && (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          pathname === "/cart"
                            ? "bg-white text-[#711e2c]"
                            : "bg-[#711e2c] text-[#fffcf2]"
                        }`}
                      >
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </span>
                    )}
                  </Link>
                </nav>
              </div>

              {/* Bottom Drawer CTA */}
              <div className="pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom,1.5rem))] border-t border-[#e5d8c6] space-y-3">
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

      {/* PRODUCT SEARCH MODAL */}
      <ProductSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}

