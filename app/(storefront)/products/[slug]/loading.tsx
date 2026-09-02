export default function ProductLoading() {
  return (
    <main className="section-shell pt-24 sm:pt-32" aria-busy="true" aria-label="Loading product">
      <div className="site-container grid gap-10 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-2xl bg-muted" />
        <div className="space-y-5 pt-4"><div className="h-3 w-24 animate-pulse rounded bg-muted" /><div className="h-14 w-3/4 animate-pulse rounded bg-muted" /><div className="h-24 w-full animate-pulse rounded bg-muted" /><div className="h-10 w-32 animate-pulse rounded bg-muted" /><div className="h-24 w-full animate-pulse rounded bg-muted" /></div>
      </div>
    </main>
  );
}
