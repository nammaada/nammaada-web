import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { StorefrontProduct } from "@/lib/storefront/products";

function formatPrice(pricePaise: number) {
  return new Intl.NumberFormat("en-IN", { currency: "INR", style: "currency" }).format(pricePaise / 100);
}

export function FeaturedProducts({ products }: { products: StorefrontProduct[] }) {
  return (
    <section className="section-shell" id="featured-products">
      <Container>
        <SectionHeading
          eyebrow="Our products"
          title={<>Traditional flavours,<br className="hidden sm:block" /> timeless classics</>}
          description="Freshly prepared Kerala delicacies, made for everyday cravings and special gatherings."
          action={{ label: "View all products", href: "/products" }}
        />
        {products.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-primary/25 bg-card/60 px-6 py-12 text-center sm:px-10">
            <p className="eyebrow">Coming to the table</p>
            <h3 className="mt-3 font-display text-2xl text-foreground sm:text-3xl">Our featured collection is being prepared.</h3>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">Featured products will appear here when they are available.</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {products.map((product, index) => (
              <Card className="group overflow-hidden rounded-3xl sm:grid sm:grid-cols-[0.9fr_1.1fr]" key={product.id} variant="bordered">
                <div className="relative min-h-56 bg-secondary sm:min-h-full">
                  {product.primary_image ? (
                    <Image src={product.primary_image.url} alt={product.primary_image.alt} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(min-width: 768px) 30vw, 100vw" />
                  ) : <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-xs uppercase tracking-[0.16em] text-muted-foreground">Approved product imagery will appear here</div>}
                </div>
                <div className="flex flex-col items-start p-6 sm:p-7">
                  <span className="text-xs font-semibold text-primary/55">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-2 font-display text-2xl leading-tight text-foreground">{product.name}</h3>
                  {product.short_description ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{product.short_description}</p> : null}
                  <div className="mt-auto flex w-full items-center justify-between gap-4 pt-7">
                    <span className="text-sm font-semibold text-primary">{formatPrice(product.price_paise)}</span>
                    <Link className="inline-flex min-h-10 items-center gap-1 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" href={`/products/${product.slug}`}>View product <ArrowUpRight aria-hidden="true" size={14} /></Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
