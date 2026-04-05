import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Users, Shield, Lightbulb } from 'lucide-react';

const team = [
  { name: 'Elena Vasquez', role: 'CEO & Co-founder', initials: 'EV' },
  { name: 'James Chen', role: 'CTO & Co-founder', initials: 'JC' },
  { name: 'Priya Kapoor', role: 'Head of Design', initials: 'PK' },
  { name: 'Tom Richter', role: 'Head of Engineering', initials: 'TR' },
  { name: 'Ada Okonkwo', role: 'Head of Research', initials: 'AO' },
  { name: 'Daniel Park', role: 'Head of Growth', initials: 'DP' },
];

const values = [
  { icon: Compass, title: 'Craft over speed', desc: 'We ship when it is right, not when it is soon.' },
  { icon: Users, title: 'Users first', desc: 'Every decision traces back to making users more capable.' },
  { icon: Shield, title: 'Trust as foundation', desc: 'Privacy and honesty are not features, they are table stakes.' },
  { icon: Lightbulb, title: 'Curious and calm', desc: 'We ask hard questions without raising our voices.' },
];

export function AboutPage() {
  return (
    <>
      <section style={{ padding: '5rem 1.5rem 3rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p className="d-label" style={{ marginBottom: '0.75rem' }}>About Carbon</p>
          <h1 style={{ fontSize: 'clamp(1.875rem, 4vw, 2.75rem)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: '1rem' }}>
            Building the chatbot we wanted to use.
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
            We were frustrated with AI assistants that felt performative, bloated, or untrustworthy.
            So we started Carbon — a focused tool that respects your time and your thinking.
          </p>
        </div>
      </section>

      <section style={{ padding: '3rem 1.5rem', borderTop: '1px solid var(--d-border)' }}>
        <div
          style={{
            maxWidth: 820,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(100px, 160px) 1fr',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          <p className="d-label">Our story</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9375rem', color: 'var(--d-text-muted)', lineHeight: 1.7 }}>
            <p>
              Carbon began in 2023 when our founders — two engineers and a designer who had worked
              together for a decade — realized the tools they relied on every day were becoming
              noisier, not better.
            </p>
            <p>
              We believe AI should feel like a thoughtful colleague: measured, candid, and deeply
              curious. Not a salesperson. Not a parrot. A partner.
            </p>
            <p>
              Today, Carbon is used by engineers, researchers, and builders who want an assistant
              that matches their standard of care.
            </p>
          </div>
        </div>
      </section>

      <section style={{ padding: '5rem 1.5rem', borderTop: '1px solid var(--d-border)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p className="d-label" style={{ marginBottom: '0.625rem' }}>Team</p>
            <h2 style={{ fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.02em' }}>The people behind Carbon.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {team.map((m) => (
              <div
                key={m.name}
                className="carbon-card"
                style={{
                  padding: '1.25rem',
                  background: 'var(--d-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.5rem',
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'color-mix(in srgb, var(--d-primary) 22%, var(--d-surface-raised))',
                    border: '1px solid var(--d-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    color: 'var(--d-text)',
                  }}
                >
                  {m.initials}
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: '0.25rem' }}>{m.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '5rem 1.5rem', borderTop: '1px solid var(--d-border)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p className="d-label" style={{ marginBottom: '0.625rem' }}>Values</p>
            <h2 style={{ fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.02em' }}>What we believe.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {values.map((v) => (
              <div
                key={v.title}
                style={{
                  padding: '1.25rem 0',
                  borderTop: '1px solid var(--d-border)',
                }}
              >
                <v.icon size={18} style={{ color: 'var(--d-accent)', marginBottom: '0.75rem' }} />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.375rem' }}>{v.title}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', lineHeight: 1.55 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '5rem 1.5rem', borderTop: '1px solid var(--d-border)' }}>
        <div
          className="carbon-card"
          style={{
            maxWidth: 720,
            margin: '0 auto',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            background: 'var(--d-surface)',
          }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Join us
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>
            We are always looking for thoughtful people. Get in touch.
          </p>
          <Link to="/contact" className="d-interactive" data-variant="primary" style={{ fontSize: '0.9375rem', padding: '0.625rem 1.25rem' }}>
            Contact us <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </>
  );
}
