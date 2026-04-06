import type { ReactNode } from 'react';

interface HeroProps {
  badge?: string;
  headline: string;
  description: string;
  children?: ReactNode;
}

export function Hero({ badge, headline, description, children }: HeroProps) {
  return (
    <section className="d-section gg-hero gg-neon-glow" role="banner" style={{ textAlign: 'center', position: 'relative' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {badge && (
          <span
            className="d-annotation"
            style={{
              background: 'color-mix(in srgb, var(--d-accent) 15%, transparent)',
              color: 'var(--d-accent)',
              border: '1px solid color-mix(in srgb, var(--d-accent) 30%, transparent)',
              marginBottom: '1rem',
              display: 'inline-flex',
            }}
          >
            {badge}
          </span>
        )}
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 600,
          lineHeight: 1.1,
          marginTop: badge ? '0.75rem' : 0,
          marginBottom: '1rem',
        }}>
          {headline}
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: 'var(--d-text-muted)',
          lineHeight: 1.7,
          maxWidth: 560,
          margin: '0 auto 2rem',
        }}>
          {description}
        </p>
        {children && (
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
