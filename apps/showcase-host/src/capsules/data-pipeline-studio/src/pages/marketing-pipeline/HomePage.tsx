import { Link } from 'react-router-dom';
import { TopNavFooterShell } from '@/components/TopNavFooterShell';

const FEATURES = [
  { glyph: '[IN]', title: 'Universal Connectors', desc: 'Postgres, MySQL, Kafka, S3, BigQuery, Snowflake, MongoDB, HTTP — 60+ sources supported out of the box.' },
  { glyph: '[FX]', title: 'SQL & Python Transforms', desc: 'Write transforms in SQL or Python, preview results inline, version-control everything.' },
  { glyph: '[DAG]', title: 'Visual DAG Builder', desc: 'Drag-drop canvas for pipeline composition. Real-time data flow preview with animated particles.' },
  { glyph: '[RUN]', title: 'Orchestration', desc: 'Cron, event, or webhook triggered. Retry policies, backfills, and dependency graphs baked in.' },
  { glyph: '[OBS]', title: 'Observability', desc: 'Structured logs, metrics, traces. Every run is observable down to the row-level lineage.' },
  { glyph: '[LIN]', title: 'Lineage & Contracts', desc: 'Automatic column-level lineage. Schema contracts prevent silent breakages.' },
];

const HOW = [
  { step: '01', title: 'Connect', desc: 'Add your databases, warehouses, streams, and APIs.' },
  { step: '02', title: 'Compose', desc: 'Build DAGs visually or in code. SQL or Python, your call.' },
  { step: '03', title: 'Ship', desc: 'Deploy with Git. Monitor runs. Debug with logs + lineage.' },
];

const TIERS = [
  { name: 'DEV', price: '$0', tagline: 'for solo tinkerers', features: ['3 pipelines', '1 worker', 'community support', '1 GB/day ingest'], cta: 'Start Free', variant: 'ghost' as const },
  { name: 'TEAM', price: '$49', tagline: 'per operator / month', features: ['unlimited pipelines', '5 workers', 'SLA support', '50 GB/day ingest', 'lineage UI'], cta: 'Start Team Trial', variant: 'primary' as const, featured: true },
  { name: 'SCALE', price: 'custom', tagline: 'for data platforms', features: ['unlimited workers', 'SSO + RBAC', 'on-prem deploy', 'dedicated infra', 'custom connectors'], cta: 'Contact Sales', variant: 'ghost' as const },
];

export function HomePage() {
  return (
    <TopNavFooterShell>
      {/* Hero */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '1rem' }}>
          // DATA PIPELINE STUDIO v1.0
        </div>
        <h1
          className="term-glow"
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            fontWeight: 700,
            color: 'var(--d-primary)',
            margin: '0 0 1.25rem',
            letterSpacing: '-0.01em',
            lineHeight: 1.15,
          }}
        >
          Build pipelines<br />like you write code
        </h1>
        <p
          style={{
            fontSize: '1rem',
            color: 'var(--d-text-muted)',
            maxWidth: 620,
            margin: '0 auto 2rem',
            lineHeight: 1.7,
          }}
        >
          $ A visual DAG builder with SQL/Python transforms, 60+ source connectors, and full lineage.<br />
          dbt Cloud meets Prefect — in your terminal.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/register" className="d-interactive" data-variant="primary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem', borderRadius: 0 }}>
            &gt; Start Free Trial
          </Link>
          <Link to="/login" className="d-interactive" style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem', borderRadius: 0 }}>
            View Demo
          </Link>
        </div>

        {/* ASCII demo box */}
        <div className="term-panel" style={{ marginTop: '3rem', padding: '1rem', textAlign: 'left', maxWidth: 720, marginInline: 'auto' }}>
          <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }}>DEMO // events_clickstream_hourly</div>
          <pre style={{ fontSize: '0.8rem', lineHeight: 1.6, color: 'var(--d-text)', margin: 0, whiteSpace: 'pre', overflow: 'auto' }}>
{`  ┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
  │ KAFKA   │───▶│ FILTER   │───▶│ ENRICH   │───▶│ SNOWFLAKE│
  │ .clicks │    │ bots     │    │ geo+ua   │    │ .events  │
  └─────────┘    └──────────┘    └──────────┘    └──────────┘
       8.4M rows    8.2M rows     8.2M rows     loaded ✓
       ~ 102s       retry: 0       latency 58ms`}
          </pre>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '3rem 1.5rem', maxWidth: 1100, margin: '0 auto', borderTop: '1px solid var(--d-border)' }}>
        <h2 className="d-label" style={{ color: 'var(--d-accent)', fontSize: '0.85rem', marginBottom: '2rem' }}>
          // FEATURES
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="term-panel" style={{ padding: '1rem' }}>
              <div style={{ color: 'var(--d-primary)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {f.glyph}
              </div>
              <h3 style={{ fontSize: '0.9375rem', color: 'var(--d-text)', margin: '0 0 0.375rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={{ padding: '3rem 1.5rem', maxWidth: 1100, margin: '0 auto', borderTop: '1px solid var(--d-border)' }}>
        <h2 className="d-label" style={{ color: 'var(--d-accent)', fontSize: '0.85rem', marginBottom: '2rem' }}>
          // HOW IT WORKS
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {HOW.map((h) => (
            <div key={h.step} style={{ borderLeft: '2px solid var(--d-primary)', paddingLeft: '1rem' }}>
              <div className="term-glow" style={{ color: 'var(--d-primary)', fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.375rem' }}>
                {h.step}
              </div>
              <h3 style={{ fontSize: '0.9375rem', color: 'var(--d-text)', margin: '0 0 0.375rem' }}>{h.title}</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', lineHeight: 1.6, margin: 0 }}>{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '3rem 1.5rem', maxWidth: 1100, margin: '0 auto', borderTop: '1px solid var(--d-border)' }}>
        <h2 className="d-label" style={{ color: 'var(--d-accent)', fontSize: '0.85rem', marginBottom: '2rem' }}>
          // PRICING
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {TIERS.map((t) => (
            <div
              key={t.name}
              className="term-panel"
              style={{
                padding: '1.25rem',
                border: t.featured ? '1px solid var(--d-primary)' : '1px solid var(--d-border)',
                boxShadow: t.featured ? '0 0 12px rgba(0,255,0,0.2)' : 'none',
              }}
            >
              <div className="d-label" style={{ color: t.featured ? 'var(--d-primary)' : 'var(--d-text-muted)', marginBottom: '0.5rem' }}>
                {t.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', marginBottom: '0.25rem' }}>
                <span className="term-glow" style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--d-primary)' }}>{t.price}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginBottom: '1rem' }}>{t.tagline}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {t.features.map((f) => (
                  <li key={f} style={{ fontSize: '0.8125rem', color: 'var(--d-text)' }}>
                    <span style={{ color: 'var(--d-primary)' }}>+ </span>{f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="d-interactive"
                data-variant={t.variant}
                style={{ width: '100%', justifyContent: 'center', padding: '0.5rem', fontSize: '0.8125rem', borderRadius: 0 }}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '3rem 1.5rem', maxWidth: 900, margin: '0 auto', textAlign: 'center', borderTop: '1px solid var(--d-border)' }}>
        <h2 className="term-glow" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--d-primary)', margin: '0 0 0.75rem' }}>
          $ ready to ship data?
        </h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--d-text-muted)', margin: '0 0 1.5rem' }}>
          Deploy your first pipeline in under 10 minutes. No credit card required.
        </p>
        <Link to="/register" className="d-interactive" data-variant="primary" style={{ padding: '0.75rem 1.5rem', borderRadius: 0, fontSize: '0.9375rem' }}>
          &gt; Start Building — It's Free
        </Link>
      </section>
    </TopNavFooterShell>
  );
}
