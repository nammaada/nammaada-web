import { Gift, Heart, Leaf, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";

const values = [
  {
    title: "Authentic Kerala Flavours",
    text: "Traditional flavours inspired by Kerala kitchens.",
    icon: Leaf,
  },
  {
    title: "Excellent Taste",
    text: "Rich flavours made to be remembered and enjoyed.",
    icon: Sparkles,
  },
  {
    title: "Made With Care",
    text: "Quality ingredients and attention in every batch.",
    icon: Heart,
  },
  {
    title: "Bulk Orders Welcome",
    text: "Perfect for celebrations, events, gatherings and special occasions.",
    icon: Gift,
  },
] as const;

export function BrandValues() {
  return (
    <section className="relative overflow-hidden bg-transparent py-10 sm:py-14">
      <Container className="relative z-10">
        <div className="rounded-2xl sm:rounded-3xl border border-white/70 bg-gradient-to-br from-white/80 via-white/60 to-white/40 p-6 sm:p-8 md:p-10 backdrop-blur-xl shadow-xl shadow-amber-950/8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            {values.map(({ icon: Icon, title, text }, index) => (
              <div
                key={title}
                className={`flex flex-col items-center text-center px-3 sm:px-5 ${
                  index > 0 ? "lg:border-l lg:border-[#e5d8c6]" : ""
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f4efeb] text-[#4a0e17]">
                  <Icon aria-hidden="true" size={24} strokeWidth={1.8} />
                </div>
                <h3 className="mt-3 font-display text-base sm:text-lg font-semibold text-[#2b1719]">
                  {title}
                </h3>
                <p className="mt-1 max-w-[220px] text-xs sm:text-sm leading-relaxed text-[#6e5b55]">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}


