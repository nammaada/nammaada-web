"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { siteConfig, storefrontRoutes } from "@/lib/constants/site";
import { Container } from "@/components/ui/container";

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

export function StorefrontNavbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-sm">
      <Container className="flex min-h-18 items-center justify-between gap-4">
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
            className="h-14 w-auto object-contain sm:h-16"
          />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          {storefrontRoutes.map((route) => (
            <Link
              className={`relative py-3 text-sm font-medium transition-colors after:absolute after:inset-x-0 after:bottom-1 after:h-px after:origin-left after:bg-primary after:transition-transform focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring ${
                isActivePath(pathname, route.href)
                  ? "text-primary after:scale-x-100"
                  : "text-foreground/75 after:scale-x-0 hover:text-primary hover:after:scale-x-100"
              }`}
              href={route.href}
              key={route.href}
              aria-current={isActivePath(pathname, route.href) ? "page" : undefined}
            >
              {route.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-[background-color,box-shadow,transform] duration-200 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px" href="/products">
            Order Now
          </Link>
        </div>

        <button
          aria-controls="mobile-storefront-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-border text-primary transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
        </button>
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
              <Link className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-[background-color,box-shadow,transform] duration-200 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px" href="/products" onClick={closeMenu}>
                Order Now
              </Link>
            </nav>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
