import Link from "next/link";
import { Container } from "@/components/ui/container";

type PhasePlaceholderProps = { title: string; area: string };

export function PhasePlaceholder({ title, area }: PhasePlaceholderProps) {
  return (
    <section className="py-12 sm:py-20 bg-transparent min-h-[60vh] flex items-center">
      <Container className="max-w-xl mx-auto text-center">
        <div className="rounded-3xl border border-white/50 bg-gradient-to-br from-white/60 via-[#fcf7ee]/35 to-[#f5e8d5]/25 p-7 sm:p-10 backdrop-blur-xl shadow-[0_16px_36px_-10px_rgba(43,23,25,0.08),inset_0_1px_1.5px_0_rgba(255,255,255,0.75)] space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[#711e2c]">{area}</p>
          <h1 className="font-display text-2xl sm:text-4xl font-semibold text-[#2b1719]">{title}</h1>
          <p className="text-xs sm:text-sm text-[#6e5b55] leading-relaxed">
            This section is being crafted with tradition and care. Check back soon or explore our available delicacies.
          </p>
          <div className="pt-4">
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#711e2c] px-6 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#5a1723]"
            >
              Explore Products
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

