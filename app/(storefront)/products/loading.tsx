export default function ProductsLoading() {
  return (
    <main className="section-shell pt-24 sm:pt-32" aria-busy="true" aria-label="Loading products">
      <div className="site-container space-y-8">
        <div className="space-y-4">
          <div className="h-3 w-28 animate-pulse rounded-full bg-muted" />
          <div className="h-16 max-w-lg animate-pulse rounded-lg bg-muted" />
          <div className="h-5 max-w-xl animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => <div className="overflow-hidden rounded-2xl border border-border bg-card" key={item}><div className="aspect-[4/3] animate-pulse bg-muted" /><div className="space-y-4 p-6"><div className="h-7 w-2/3 animate-pulse rounded bg-muted" /><div className="h-4 w-full animate-pulse rounded bg-muted" /><div className="h-10 w-32 animate-pulse rounded-full bg-muted" /></div></div>)}
        </div>
      </div>
    </main>
  );
}
