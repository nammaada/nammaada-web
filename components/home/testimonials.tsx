import { Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { StorefrontTestimonial } from "@/lib/storefront/testimonials";

export function Testimonials({ testimonials }: { testimonials: StorefrontTestimonial[] }) {
  return (
    <section className="section-shell py-14 sm:py-20">
      <Container>
        <SectionHeading eyebrow="Testimonials" title="Loved at every gathering" align="center" />
        {testimonials.length === 0 ? (
          <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-dashed border-primary/20 bg-card/45 px-6 py-7 text-center"><p className="text-sm leading-6 text-muted-foreground">Stories from Namma Ada gatherings will appear here when they are available.</p></div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial) => <Card className="rounded-2xl p-6" key={testimonial.id}><Quote aria-hidden="true" className="text-primary" size={24} /><blockquote className="mt-5 text-sm leading-6 text-muted-foreground">{testimonial.content}</blockquote><p className="mt-5 text-sm font-semibold text-foreground">{testimonial.display_name}</p>{testimonial.location ? <p className="mt-1 text-xs text-muted-foreground">{testimonial.location}</p> : null}</Card>)}
          </div>
        )}
      </Container>
    </section>
  );
}
