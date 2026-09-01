type PhasePlaceholderProps = { title: string; area: string };

export function PhasePlaceholder({ title, area }: PhasePlaceholderProps) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-5 py-12 sm:px-8">
      <section className="w-full max-w-xl rounded-3xl border border-border bg-card p-7 text-center shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{area}</p>
        <h1 className="mt-3 font-display text-4xl text-foreground">{title}</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          This route is reserved for a future Namma Ada implementation phase.
        </p>
      </section>
    </main>
  );
}
