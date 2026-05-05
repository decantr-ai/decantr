interface Section { id: string; title: string; body: string; }
interface Props { title: string; lastUpdated: string; sections: Section[]; }

export function LegalPage({ title, lastUpdated, sections }: Props) {
  return (
    <div className="entrance-fade" style={{ padding: '3rem 1.5rem', maxWidth: '64rem', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.375rem' }}>{title}</h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>Last updated {lastUpdated}</p>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '3rem', alignItems: 'start' }}>
        <nav style={{ position: 'sticky', top: '5rem' }}>
          <p style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--d-text-muted)', fontWeight: 600, marginBottom: '0.625rem' }}>On this page</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {sections.map(s => (
              <a key={s.id} href={`#${s.id}`} style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', textDecoration: 'none', padding: '0.125rem 0' }}>
                {s.title}
              </a>
            ))}
          </div>
        </nav>
        <article className="paper-prose">
          {sections.map(s => (
            <section key={s.id} id={s.id} style={{ marginBottom: '1.75rem', scrollMarginTop: '5rem' }}>
              <h2>{s.title}</h2>
              <p>{s.body}</p>
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
