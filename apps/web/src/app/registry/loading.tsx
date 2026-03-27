export default function RegistryLoading() {
  return (
    <section className="mx-auto max-w-[var(--max-w)] px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold">Registry</h1>
      <div className="space-y-4">
        <div className="h-10 animate-pulse rounded-full bg-[var(--bg-surface)]" />
        <div className="h-8 w-64 animate-pulse rounded-full bg-[var(--bg-surface)]" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-[var(--radius-md)] bg-[var(--bg-surface)]" />
          ))}
        </div>
      </div>
    </section>
  );
}
