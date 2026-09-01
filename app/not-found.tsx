import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">404</p>
        <h1 className="mt-3 font-display text-3xl text-foreground">Page not found</h1>
        <Link className="mt-6 inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground" href="/">
          Return home
        </Link>
      </section>
    </main>
  );
}
