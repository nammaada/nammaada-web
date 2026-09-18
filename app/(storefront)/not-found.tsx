import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <div className="py-16 sm:py-24 text-center">
      <Container className="max-w-md mx-auto">
        <div className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-sm backdrop-blur-md space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#711e2c]">404</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2b1719]">Page Not Found</h1>
          <p className="text-xs sm:text-sm text-[#6e5b55] leading-relaxed">
            The page or category you are looking for does not exist or has been moved.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#711e2c] px-6 text-xs font-semibold text-white shadow-sm hover:bg-[#5a1723] transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
