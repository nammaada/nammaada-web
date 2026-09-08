import type { ReactNode } from "react";
import { StorefrontFooter } from "@/components/layout/storefront-footer";
import { StorefrontNavbar } from "@/components/layout/storefront-navbar";
import { CartProvider } from "@/components/cart/cart-provider";
import { getActiveHeroBanners } from "@/lib/storefront/hero";

export default async function StorefrontLayout({ children }: Readonly<{ children: ReactNode }>) {
  const activeBanners = await getActiveHeroBanners();
  const isVideoHero = activeBanners.length > 0 && activeBanners[0].media_type === "video";

  return (
    <CartProvider>
      <div className="relative min-h-screen flex flex-col bg-[#fbf7ef] overflow-x-hidden selection:bg-[#eedec8] selection:text-[#2b1719]">
        {/* AUTHORITATIVE SINGLE PAGE SCROLLING BACKGROUND ARTWORK MATCHING MOCKUP */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/bg-image-aada.png"
            alt=""
            className="h-full w-full object-cover object-top opacity-95 transition-opacity duration-500"
          />
        </div>

        {/* STOREFRONT CONTENT REGION */}
        <div className="relative z-10 flex min-h-screen flex-col">
          <StorefrontNavbar isVideoHero={isVideoHero} />
          <main className="flex-1">{children}</main>
          <StorefrontFooter />
        </div>
      </div>
    </CartProvider>
  );
}



