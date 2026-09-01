import type { ReactNode } from "react";
import { StorefrontFooter } from "@/components/layout/storefront-footer";
import { StorefrontNavbar } from "@/components/layout/storefront-navbar";

export default function StorefrontLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <StorefrontNavbar />
      <main className="flex-1">{children}</main>
      <StorefrontFooter />
    </div>
  );
}
