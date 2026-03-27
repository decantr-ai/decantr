export default function ContentDetailLoading() {
  return (
    <section className="mx-auto max-w-[var(--max-w)] px-6 py-12">
      <div className="mb-8 space-y-4">
        <div className="flex gap-2">
          <div className="h-6 w-16 animate-pulse rounded-full bg-[var(--bg-surface)]" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-[var(--bg-surface)]" />
        </div>
        <div className="h-10 w-80 animate-pulse rounded-lg bg-[var(--bg-surface)]" />
        <div className="h-5 w-full max-w-lg animate-pulse rounded bg-[var(--bg-surface)]" />
      </div>
      <div className="h-64 animate-pulse rounded-[var(--radius-md)] bg-[var(--bg-surface)]" />
    </section>
  );
}
