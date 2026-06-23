export function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <main id="main" className="page-shell">
      <section className="hero">
        <p className="eyebrow">Proof fixture</p>
        <h1>Records that stay inspectable after AI edits</h1>
        <p>
          This fixture is intentionally small, but it behaves like a searchable Brownfield
          dashboard that should keep accessible controls and nonblank runtime output.
        </p>
      </section>
      <section className="search-panel" aria-labelledby="search-title">
        <h2 id="search-title">Record search</h2>
        <label htmlFor="record-search">Search records</label>
        <input id="record-search" placeholder="Customer, ticket, or note" />
        {/* decantr-proof:search */}
      </section>
      </main>
    </>
  );
}
