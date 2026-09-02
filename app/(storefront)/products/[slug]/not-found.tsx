import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="section-shell flex min-h-[65vh] items-center">
      <div className="site-container">
        <section className="mx-auto max-w-xl rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-soft sm:px-10">
          <p className="eyebrow">Namma Ada</p>
          <h1 className="mt-3 font-display text-3xl leading-tight text-foreground sm:text-4xl">This delicacy is not on the table.</h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">The product may be unavailable or no longer part of our collection.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" href="/products">Browse products</Link>
            <Link className="inline-flex min-h-11 items-center rounded-full border border-primary/30 px-5 text-sm font-semibold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" href="/">Return home</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
