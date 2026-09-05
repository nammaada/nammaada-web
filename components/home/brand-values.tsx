import { Gift, Heart, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";

const values = [
  {
    text: "Freshly prepared for every order.",
    icon: Sparkles,
  },
  {
    text: "Authentic Kerala recipes and flavours.",
    icon: Leaf,
  },
  {
    text: "Premium ingredients with no shortcuts.",
    icon: Heart,
  },
  {
    text: "Hygienic, homemade style preparation.",
    icon: ShieldCheck,
  },
  {
    text: "Perfect for festivals, family gatherings, and gifting.",
    icon: Gift,
  },
] as const;

export function BrandValues() {
  return (
    <section className="relative overflow-hidden bg-transparent py-10 sm:py-2">
      <Container className="relative z-10">
        <div className="rounded-2xl sm:rounded-3xl border border-white/45 bg-gradient-to-br from-white/50 via-[#fcf7ee]/28 to-[#f5e8d5]/18 p-5 sm:p-8 md:p-10 backdrop-blur-xl shadow-[0_16px_36px_-10px_rgba(43,23,25,0.08),inset_0_1px_1.5px_0_rgba(255,255,255,0.75)]">
          {/* Header matching client instructions */}
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#711e2c]">
              WHY CHOOSE US
            </p>
            <h2 className="mt-1.5 font-display text-xl sm:text-2xl lg:text-3xl font-semibold text-[#2b1719]">
              Because tradition deserves to taste authentic.
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-0">
            {values.map(({ icon: Icon, text }, index) => (
              <div
                key={text}
                className={`flex flex-col items-center text-center px-2 sm:px-3 ${
                  index > 0 ? "lg:border-l lg:border-[#711e2c]/10" : ""
                } ${index === 4 ? "col-span-2 sm:col-span-1" : ""}`}
              >
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/50 border border-white/70 text-[#711e2c] shrink-0 shadow-xs backdrop-blur-xs">
                  <Icon aria-hidden="true" className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.8} />
                </div>
                <p className="mt-2.5 max-w-[170px] sm:max-w-[190px] text-xs sm:text-sm font-semibold leading-snug text-[#2b1719]">
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


