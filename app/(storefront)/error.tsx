"use client";

import { Button } from "@/components/ui/button";

export default function StorefrontError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="section-shell">
      <section className="site-container">
        <div className="max-w-xl rounded-3xl border border-border bg-card p-7 shadow-soft sm:p-10">
          <p className="eyebrow">Namma Ada</p>
          <h1 className="mt-3 font-display text-3xl text-foreground sm:text-4xl">Something needs another moment.</h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">We could not load this page right now. Please try again.</p>
          <Button className="mt-7" onClick={reset} type="button">Try again</Button>
        </div>
      </section>
    </main>
  );
}
