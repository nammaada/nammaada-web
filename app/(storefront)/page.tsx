import { ArrowRight } from "lucide-react";

export default function StorefrontFoundation() {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-16 sm:px-8">
      <section className="w-full max-w-2xl rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-10">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Namma Ada
        </p>
        <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
          Soul of Kerala, served with heart.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
          The mobile-first application foundation is ready. Storefront content and
          dynamic commerce features will be added in later phases.
        </p>
        <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          Built for the next phase <ArrowRight aria-hidden="true" size={16} />
        </div>
      </section>
    </main>
  );
}
