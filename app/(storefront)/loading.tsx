export default function StorefrontLoading() {
  return (
    <main className="section-shell" aria-busy="true" aria-label="Loading page">
      <div className="site-container space-y-5">
        <div className="h-3 w-28 animate-pulse rounded-full bg-muted" />
        <div className="h-12 max-w-md animate-pulse rounded-lg bg-muted" />
        <div className="h-24 max-w-xl animate-pulse rounded-lg bg-muted" />
      </div>
    </main>
  );
}
