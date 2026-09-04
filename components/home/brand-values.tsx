import { Gift, Heart, Leaf, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";

const values = [
  {
    title: "Authentic Kerala flavours",
    text: "Inspired by recipes passed down through generations.",
    icon: Leaf,
  },
  {
    title: "Freshly prepared",
    text: "Every order is prepared fresh, never rushed.",
    icon: Sparkles,
  },
  {
    title: "Made with care",
    text: "Premium ingredients with no shortcuts.",
    icon: Heart,
  },
  {
    title: "Celebrations welcome",
    text: "Perfect for festivals, family gatherings, and gifting.",
    icon: Gift,
  },
] as const;

export function BrandValues() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#ebd7be] to-[#e2cdb3] pb-16 pt-2 sm:pb-24 sm:pt-4">
      {/* Ambient background glow & silk flow */}
      <div
        className="pointer-events-none absolute -bottom-20 left-1/2 h-[380px] w-[800px] -translate-x-1/2 rounded-full bg-[#fceddc]/50 blur-3xl"
        aria-hidden="true"
      />
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-35 select-none"
        preserveAspectRatio="none"
        viewBox="0 0 1440 400"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M-50 100C300 220 750 40 1150 180C1320 240 1420 190 1500 150L1500 400L-50 400Z"
          fill="url(#silk-flow-values)"
        />
        <defs>
          <linearGradient id="silk-flow-values" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff8ef" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#cfa579" stopOpacity="0.25" />
          </linearGradient>
        </defs>
      </svg>

      <Container className="relative z-10">
        {/* Single large rounded glass container matching product cards & hero glass style */}
        <div className="rounded-3xl sm:rounded-[2.5rem] border border-white/70 bg-gradient-to-br from-white/75 via-white/55 to-white/40 p-7 sm:p-9 md:p-10 backdrop-blur-xl shadow-xl shadow-amber-950/8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            {values.map(({ icon: Icon, title, text }, index) => (
              <div
                key={title}
                className={`flex flex-col items-center text-center px-4 sm:px-6 ${
                  index > 0 ? "lg:border-l lg:border-primary/15" : ""
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center text-primary transition-transform duration-300 hover:scale-110">
                  <Icon aria-hidden="true" size={30} strokeWidth={1.5} />
                </div>
                <h2 className="mt-3 font-display text-base sm:text-lg font-semibold text-foreground">
                  {title}
                </h2>
                <p className="mt-1.5 max-w-[220px] text-xs sm:text-sm leading-relaxed text-muted-foreground">
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

