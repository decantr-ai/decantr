export function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <main id="main" className="mx-auto grid max-w-5xl gap-6 p-8">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Style bridge
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Token authority review</h1>
          <button className="mt-4 rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white">
            Review mappings
          </button>
        </section>
      </main>
    </>
  );
}
