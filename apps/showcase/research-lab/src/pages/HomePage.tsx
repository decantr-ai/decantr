import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { FlaskConical, TestTubes, Microscope, Database, Calendar, BookOpen, ArrowRight, Beaker } from 'lucide-react';

const features = [
  { icon: BookOpen, title: 'Electronic Lab Notebook', description: 'Rich entries with LaTeX formulas, protocol checklists, and embedded images. Every observation timestamped and auditable.' },
  { icon: TestTubes, title: 'Experiment Tracking', description: 'Kanban boards and timeline views for planned, in-progress, and completed experiments with full protocol history.' },
  { icon: Microscope, title: 'Sample Inventory', description: 'Barcode-tracked sample management with chain-of-custody logging, expiry countdowns, and location mapping.' },
  { icon: Calendar, title: 'Instrument Booking', description: 'Shared equipment scheduling grids. See availability at a glance and reserve time slots for lab instruments.' },
  { icon: Database, title: 'Data Repository', description: 'Structured dataset catalog with schema trees, quality indicators, and direct links to originating experiments.' },
  { icon: Beaker, title: 'Protocol Library', description: 'Numbered step protocols with reagent lists, equipment chips, safety badges, and estimated durations.' },
];

const stats = [
  { value: '2,400+', label: 'Notebook Entries' },
  { value: '186', label: 'Active Experiments' },
  { value: '12,000+', label: 'Tracked Samples' },
  { value: '99.7%', label: 'Uptime' },
];

export function HomePage() {
  return (
    <div className="entrance-fade">
      {/* Hero */}
      <section
        className="d-section"
        style={{
          textAlign: 'center',
          padding: '5rem 1.5rem',
          background: 'linear-gradient(180deg, #fff 0%, var(--d-surface) 100%)',
        }}
      >
        <div style={{ maxWidth: '44rem', margin: '0 auto' }}>
          <div className="d-annotation" data-status="info" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
            <FlaskConical size={12} />
            Scientific Workspace Platform
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 500, lineHeight: 1.15, marginBottom: '1.25rem', color: 'var(--d-text)', letterSpacing: '-0.02em' }}>
            Your lab, <span style={{ color: 'var(--d-primary)' }}>precisely</span> organized
          </h1>
          <p style={{ fontSize: '1.0625rem', lineHeight: 1.7, color: 'var(--d-text-muted)', maxWidth: '36rem', margin: '0 auto 2rem' }}>
            An electronic lab notebook, experiment tracker, sample inventory, and instrument scheduler — unified in one pristine workspace. Think Benchling meets Jupyter.
          </p>
          <div className={css('_flex _center _gap3')} style={{ flexWrap: 'wrap' }}>
            <Link
              to="/login"
              className="d-interactive"
              data-variant="primary"
              style={{ padding: '0.5rem 1.25rem', textDecoration: 'none', borderRadius: 2, fontSize: '0.875rem' }}
            >
              Start Recording
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/register"
              className="d-interactive"
              data-variant="ghost"
              style={{ padding: '0.5rem 1.25rem', textDecoration: 'none', borderRadius: 2, fontSize: '0.875rem' }}
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '0 1.5rem' }}>
        <div style={{ maxWidth: '56rem', margin: '-2rem auto 0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--d-border)', border: '1px solid var(--d-border)', borderRadius: 2 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ padding: '1.25rem', textAlign: 'center', background: '#fff' }}>
              <p className="lab-reading" style={{ fontSize: '1.5rem', fontWeight: 500, color: 'var(--d-primary)' }}>{s.value}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section
        className="d-section"
        role="region"
        aria-label="Features"
        style={{ padding: 'var(--d-section-py) 1.5rem' }}
      >
        <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p className="d-label" style={{ color: 'var(--d-primary)', marginBottom: '0.5rem' }}>CAPABILITIES</p>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
              Every tool a researcher needs
            </h2>
            <p style={{ color: 'var(--d-text-muted)', maxWidth: '32rem', margin: '0 auto', fontSize: '0.9375rem' }}>
              Purpose-built for the scientific method, from hypothesis to publication.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>
            {features.map((f) => (
              <div
                key={f.title}
                className="lab-panel"
                style={{
                  padding: 'var(--d-surface-p)',
                  transition: 'border-color 100ms linear',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--d-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--d-border)'; }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    background: 'color-mix(in srgb, var(--d-primary) 8%, transparent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem',
                  }}
                >
                  <f.icon size={20} style={{ color: 'var(--d-primary)' }} />
                </div>
                <h3 style={{ fontWeight: 500, marginBottom: '0.375rem', fontSize: '0.9375rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--d-text-muted)', fontSize: '0.8125rem', lineHeight: 1.6 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="d-section"
        style={{
          padding: 'var(--d-section-py) 1.5rem',
          textAlign: 'center',
          background: 'var(--d-surface)',
        }}
      >
        <div style={{ maxWidth: '40rem', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
            Ready to digitize your lab?
          </h2>
          <p style={{ color: 'var(--d-text-muted)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
            Start with the electronic lab notebook. Add experiment tracking and sample management when you need them.
          </p>
          <Link
            to="/login"
            className="d-interactive"
            data-variant="primary"
            style={{ padding: '0.5rem 1.5rem', textDecoration: 'none', borderRadius: 2, fontSize: '0.875rem' }}
          >
            Get Started
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
