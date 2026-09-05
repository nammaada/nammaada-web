import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart, Leaf, UtensilsCrossed } from "lucide-react";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "About Us | Namma Ada",
  description:
    "A little taste of home, made with a whole lot of love. Learn about Namma Ada's authentic Kerala delicacies, mission, vision, and team in Bangalore.",
};

export default function AboutPage() {
  return (
    <div className="py-8 sm:py-14 lg:py-16">
      <Container className="max-w-3xl mx-auto">
        {/* Main Editorial Glass Card */}
        <div className="rounded-3xl border border-white/50 bg-gradient-to-br from-white/60 via-[#fcf7ee]/35 to-[#f5e8d5]/25 p-6 sm:p-10 lg:p-12 backdrop-blur-xl shadow-[0_16px_36px_-10px_rgba(43,23,25,0.08),inset_0_1px_1.5px_0_rgba(255,255,255,0.75)] text-center space-y-8">
          
          {/* WHO WE ARE */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#711e2c]">
              WHO WE ARE
            </p>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-[#2b1719] max-w-2xl mx-auto">
              A little taste of home, made with a whole lot of love.
            </h1>
            <div className="space-y-2.5 text-xs sm:text-sm lg:text-base leading-relaxed text-[#5a4843] max-w-2xl mx-auto text-center">
              <p>
                Namma Ada is a Bangalore-based Kerala delicacy brand inspired by recipes passed down through generations.
              </p>
              <p>
                Rooted in authenticity and made fresh for every order, we believe the simplest ingredients create the most unforgettable flavours. From festive feasts to everyday cravings, we bring Kerala&apos;s timeless taste to your table.
              </p>
            </div>
          </div>

          {/* OUR MISSION & OUR VISION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[#711e2c]/15 text-left">
            <div className="rounded-2xl border border-white/60 bg-white/40 p-5 sm:p-6 backdrop-blur-xs shadow-xs space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-[#711e2c]">
                <Leaf size={18} strokeWidth={2} />
                <h2 className="text-xs font-bold uppercase tracking-wider">OUR MISSION</h2>
              </div>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                To preserve and share the authentic flavours of Kerala through fresh, handcrafted food that makes every meal feel like home.
              </p>
            </div>

            <div className="rounded-2xl border border-white/60 bg-white/40 p-5 sm:p-6 backdrop-blur-xs shadow-xs space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-[#711e2c]">
                <Heart size={18} strokeWidth={2} />
                <h2 className="text-xs font-bold uppercase tracking-wider">OUR VISION</h2>
              </div>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                To become Bangalore&apos;s most loved destination for traditional Kerala delicacies where every celebration is made a little sweeter with Namma Ada.
              </p>
            </div>
          </div>

          {/* WHAT WE OFFER */}
          <div className="pt-6 border-t border-[#711e2c]/15 text-left">
            <div className="rounded-2xl border border-white/60 bg-white/40 p-5 sm:p-7 backdrop-blur-xs shadow-xs space-y-3">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-[#711e2c]">
                <UtensilsCrossed size={18} strokeWidth={2} />
                <h2 className="text-xs font-bold uppercase tracking-[0.2em]">WHAT WE OFFER</h2>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-xs sm:text-sm text-[#5a4843]">
                <li className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#711e2c] shrink-0" />
                  Signature Palada Payasam
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#711e2c] shrink-0" />
                  Soft, handmade Unniyappam
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#711e2c] shrink-0" />
                  Coconut Oil
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#711e2c] shrink-0" />
                  Crispy Banana &amp; Jackfruit Chips
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#711e2c] shrink-0" />
                  Traditional Homemade Kerala Pickles
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#711e2c] shrink-0" />
                  Festive and bulk catering for special occasions
                </li>
              </ul>
            </div>
          </div>

          {/* OUR TEAM & EXPERIENCE */}
          <div className="pt-6 border-t border-[#711e2c]/15 space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#711e2c]">
              OUR TEAM &amp; EXPERIENCE
            </p>
            <div className="space-y-2 text-xs sm:text-sm lg:text-base text-[#5a4843] leading-relaxed max-w-2xl mx-auto text-center">
              <p>
                Behind Namma Ada is a husband and wife with a big heart for Kerala food and warm hospitality.
              </p>
              <p>
                For over a year, we have been making celebrations sweeter with authentic homemade Kerala delicacies. Every order is prepared with the same love, care, and attention as if it were for our own family.
              </p>
              <p>
                From our kitchen to your table, our promise is simple — authentic taste, fresh preparation, and heartfelt service.
              </p>
            </div>

            <p className="pt-3 font-semibold text-sm sm:text-base text-[#711e2c]">
              Namma Ada - Made with a whole lot of love.
            </p>
          </div>

          {/* Action CTA */}
          <div className="pt-6 border-t border-[#711e2c]/15 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#711e2c] px-6 sm:px-7 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-[#5a1723] transition-colors"
            >
              Explore Products <ArrowRight size={15} />
            </Link>

            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#711e2c]/20 bg-white/40 px-6 sm:px-7 text-xs sm:text-sm font-semibold text-[#711e2c] hover:bg-white/60 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
