import { css } from '@decantr/css';
import { ArrowRight } from 'lucide-react';
import { RESOURCES } from '../data/mock';

export function ResourcesPage() {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <p className="d-label" style={{ color: 'var(--d-accent)', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>RESOURCES</p>
        <h1 className={css('_fontsemi')} style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Learn, Build, Grow
        </h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', maxWidth: 500 }}>
          Everything you need to get the most out of the platform.
        </p>
      </div>

      <div className={css('_grid _gap6')} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {RESOURCES.map(r => (
          <a
            key={r.title}
            href={r.href}
            className="lum-card-outlined"
            style={{
              padding: '1.5rem',
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 200ms ease, border-color 200ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
          >
            <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '1rem' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '0.5rem',
                  background: 'color-mix(in srgb, var(--d-accent) 10%, transparent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <r.icon size={22} style={{ color: 'var(--d-accent)' }} />
              </div>
              <span className="d-annotation">{r.category}</span>
            </div>
            <h3 className={css('_fontsemi')} style={{ marginBottom: '0.5rem' }}>{r.title}</h3>
            <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6, flex: 1, marginBottom: '1rem' }}>
              {r.description}
            </p>
            <span className={css('_flex _aic _gap1 _textsm')} style={{ color: 'var(--d-primary)' }}>
              Explore <ArrowRight size={14} />
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
