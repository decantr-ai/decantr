import { css } from '@decantr/css';
import { Shield, Eye, Users, Scale } from 'lucide-react';

const values = [
  { icon: Shield, title: 'Transparency', description: 'Every budget line, every vote, every decision — visible to all citizens.' },
  { icon: Eye, title: 'Accessibility', description: 'WCAG AAA compliant. Built so every resident can participate regardless of ability.' },
  { icon: Users, title: 'Community', description: 'Connecting neighbors, enabling collective action, and amplifying citizen voices.' },
  { icon: Scale, title: 'Accountability', description: 'Track promises, monitor spending, and hold elected officials responsible.' },
];

export function AboutPage() {
  return (
    <section className="d-section" style={{ padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="d-label" style={{ textAlign: 'center', letterSpacing: '0.1em', marginBottom: '0.75rem', color: 'var(--d-primary)' }}>
          ABOUT
        </div>
        <h1 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
          Building Trust Through Transparency
        </h1>
        <p style={{ textAlign: 'center', fontSize: '1.0625rem', color: 'var(--d-text-muted)', marginBottom: '3rem', lineHeight: 1.7, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
          CivicPlatform was created to bridge the gap between local government and the communities it serves.
          We believe informed citizens build stronger cities.
        </p>

        <div className={css('_grid')} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {values.map((val, i) => (
            <div
              key={val.title}
              className="d-surface gov-card"
              style={{
                padding: '1.5rem',
                opacity: 0,
                animation: `decantr-entrance 0.4s ease forwards`,
                animationDelay: `${i * 100}ms`,
              }}
            >
              <val.icon size={24} style={{ color: 'var(--d-primary)', marginBottom: '0.75rem' }} aria-hidden />
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.375rem' }}>{val.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>{val.description}</p>
            </div>
          ))}
        </div>

        <div className="d-surface gov-card" style={{ marginTop: '2rem', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Our Mission</h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--d-text-muted)', lineHeight: 1.8 }}>
            We are committed to making local government accessible, transparent, and responsive.
            CivicPlatform provides the digital infrastructure for meaningful civic engagement,
            enabling residents to participate in decisions that shape their neighborhoods, schools, and public services.
            Every feature is designed with clarity and inclusivity in mind.
          </p>
        </div>
      </div>
    </section>
  );
}
