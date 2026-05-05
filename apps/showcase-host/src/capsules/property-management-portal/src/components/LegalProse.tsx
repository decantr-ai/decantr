interface Section {
  id: string;
  title: string;
  body: string[];
}

interface LegalProseProps {
  title: string;
  lastUpdated: string;
  sections: Section[];
}

export function LegalProse({ title, lastUpdated, sections }: LegalProseProps) {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--d-primary)', marginBottom: '0.5rem' }}>{title}</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>Last updated: {lastUpdated}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2.5rem', alignItems: 'start' }}>
        <aside className="pm-toc">
          <div className="d-label" style={{ marginBottom: '0.5rem' }}>On this page</div>
          {sections.map(s => (
            <a key={s.id} href={`#${s.id}`}>{s.title}</a>
          ))}
        </aside>
        <article style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {sections.map(s => (
            <section key={s.id} id={s.id}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--d-primary)', marginBottom: '0.75rem' }}>{s.title}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {s.body.map((p, i) => (
                  <p key={i} style={{ fontSize: '0.9rem', color: 'var(--d-text)', lineHeight: 1.7 }}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
