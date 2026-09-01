"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // The error object is intentionally not rendered to avoid exposing internals.
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center">
        <h1 className="font-display text-3xl text-foreground">Something went wrong</h1>
        <p className="mt-3 text-sm text-muted-foreground">Please try again.</p>
        <button
          className="mt-6 min-h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          onClick={reset}
        >
          Try again
        </button>
      </section>
    </main>
  );
}
