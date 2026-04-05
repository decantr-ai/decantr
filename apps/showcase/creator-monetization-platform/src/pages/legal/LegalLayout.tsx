import { css } from '@decantr/css';
import { Printer } from 'lucide-react';

type Section = { id: string; heading: string; body: string };

export function LegalLayout({ title, updated, sections }: { title: string; updated: string; sections: Section[] }) {
  return (
    <div className="entrance-fade" style={{ padding: '3rem 1.5rem 5rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 200px', gap: '3rem' }}>
        <article style={{ minWidth: 0 }}>
          <div className={css('_flex _aic _jcsb _gap3')} style={{ marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <h1 className="serif-display" style={{ fontSize: '2.25rem' }}>{title}</h1>
            <button className="d-interactive" data-variant="ghost" onClick={() => window.print()}
              style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}>
              <Printer size={14} /> Print
            </button>
          </div>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>Last updated {updated}</p>
          <div className={css('_flex _col _gap5')}>
            {sections.map((s) => (
              <section key={s.id} id={s.id} style={{ scrollMarginTop: 80 }}>
                <h2 className="serif-display" style={{ fontSize: '1.375rem', marginBottom: '0.5rem' }}>{s.heading}</h2>
                <p style={{ color: 'var(--d-text)', lineHeight: 1.7, fontSize: '0.9375rem' }}>{s.body}</p>
              </section>
            ))}
          </div>
        </article>
        <aside className="toc-nav" style={{ position: 'sticky', top: 80, alignSelf: 'start' }}>
          <p className="d-label" style={{ marginBottom: '0.75rem' }}>Contents</p>
          <nav className={css('_flex _col _gap2')}>
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', textDecoration: 'none', scrollBehavior: 'smooth' }}>{s.heading}</a>
            ))}
          </nav>
        </aside>
      </div>
      <style>{`
        @media (max-width: 767px) { .toc-nav { display: none; } article { grid-column: 1 / -1; } }
        html { scroll-behavior: smooth; }
        @media print { .toc-nav, button { display: none !important; } }
      `}</style>
    </div>
  );
}
