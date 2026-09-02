import { Gift, Heart, Leaf, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";

const values = [
  { title: "Authentic Kerala flavours", text: "Inspired by recipes passed down through generations.", icon: Leaf },
  { title: "Freshly prepared", text: "Every order is prepared fresh, never rushed.", icon: Sparkles },
  { title: "Made with care", text: "Premium ingredients with no shortcuts.", icon: Heart },
  { title: "Celebrations welcome", text: "Perfect for festivals, family gatherings, and gifting.", icon: Gift },
] as const;

export function BrandValues() {
  return (
    <section className="border-y border-border/70 bg-secondary/55 py-8 sm:py-10">
      <Container className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
        {values.map(({ icon: Icon, ...value }, index) => (
          <div className={`flex gap-4 lg:px-7 ${index > 0 ? "lg:border-l lg:border-border" : ""}`} key={value.title}>
            <Icon aria-hidden="true" className="mt-0.5 shrink-0 text-primary" size={24} strokeWidth={1.5} />
            <div><h2 className="text-sm font-semibold text-foreground">{value.title}</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">{value.text}</p></div>
          </div>
        ))}
      </Container>
    </section>
  );
}
