import Link from "next/link";
import { Container } from "@/components/ui/container";

type PhasePlaceholderProps = { title: string; area: string };

export function PhasePlaceholder({ title, area }: PhasePlaceholderProps) {
  return (
    <section className="py-12 sm:py-20 bg-[#fbf7ef] min-h-[60vh] flex items-center">
      <Container className="max-w-xl mx-auto text-center">
        <div className="rounded-2xl border border-[#e5d8c6] bg-[#fffdf8] p-7 sm:p-10 shadow-soft space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[#4a0e17]">{area}</p>
          <h1 className="font-display text-2xl sm:text-4xl font-semibold text-[#2b1719]">{title}</h1>
          <p className="text-xs sm:text-sm text-[#6e5b55] leading-relaxed">
            This section is being crafted with tradition and care. Check back soon or explore our available delicacies.
          </p>
          <div className="pt-4">
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#4a0e17] px-6 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#380a11]"
            >
              Explore Products
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

