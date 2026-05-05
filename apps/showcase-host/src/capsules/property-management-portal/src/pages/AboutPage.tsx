import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { team, values } from '@/data/mock';

export function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="pm-hero-bg" style={{ padding: '5rem 1.5rem 4rem' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
          <div className="d-label" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>Our story</div>
          <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 2.75rem)', fontWeight: 700, color: 'var(--d-primary)', marginBottom: '1rem' }}>
            Built by operators, for operators
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--d-text-muted)', lineHeight: 1.65 }}>
            Cornerstone started as a spreadsheet. Then a rent tracker. Then a full operations platform. We build for the property managers, residents, and owners who wake up at 2 AM worrying about pipes.
          </p>
        </div>
      </section>

      {/* Story */}
      <section style={{ padding: '4rem 1.5rem', background: 'var(--d-surface)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--d-primary)', marginBottom: '1rem' }}>Why we exist</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem', color: 'var(--d-text)', lineHeight: 1.7 }}>
            <p>In 2019, our founder Elena was managing a 24-unit building with a binder, two spreadsheets, and a lot of late-night emails. She tried every software on the market. None of them fit.</p>
            <p>So she built her own. It started with rent tracking. Then maintenance. Then owner statements. Within a year, three other small operators asked to use it. Within two, Cornerstone was born.</p>
            <p>Today we serve 240+ operators managing 18,000+ units. Our principle hasn't changed: build the tool the operator actually wants, not the tool the investor thinks they should buy.</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="d-label" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>Values</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--d-primary)' }}>What we stand for</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {values.map(v => (
              <div key={v.title} className="pm-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--d-primary)', marginBottom: '0.5rem' }}>{v.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: '4rem 1.5rem', background: 'var(--d-surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="d-label" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>Team</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--d-primary)' }}>The people behind Cornerstone</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {team.map(m => (
              <div key={m.name} className="pm-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <div className="pm-avatar" style={{ width: 72, height: 72, fontSize: '1.5rem', margin: '0 auto 0.875rem' }}>
                  {m.avatar}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--d-primary)' }}>{m.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--d-accent)', marginBottom: '0.5rem', fontWeight: 500 }}>{m.role}</div>
                <p style={{ fontSize: '0.825rem', color: 'var(--d-text-muted)', lineHeight: 1.55 }}>{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--d-primary)', marginBottom: '0.75rem' }}>Let's run your properties together</h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>
            Join hundreds of operators who trust Cornerstone with their portfolios.
          </p>
          <Link to="/register" className="pm-button-primary" style={{ padding: '0.75rem 1.5rem' }}>
            Start free trial <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
