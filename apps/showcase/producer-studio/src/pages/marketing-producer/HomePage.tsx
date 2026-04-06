import { Link } from 'react-router-dom';
import { TopNavFooterShell } from '@/components/TopNavFooterShell';

const FEATURES = [
  { icon: '&#9835;', title: 'Multi-Track DAW', desc: 'Waveform editing with unlimited stems, automation lanes, and beat-synced grid. Record, edit, arrange.' },
  { icon: '&#9834;', title: 'Stem-Stack Mixer', desc: 'Channel-strip mixing console with faders, pan knobs, VU meters, and per-stem plugin chains.' },
  { icon: '&#127911;', title: 'Live Session Rooms', desc: 'Real-time co-production with voice chat, collaborative scrubbing, and shared transport controls.' },
  { icon: '&#128176;', title: 'Split Calculator', desc: 'Royalty split management with real-time percentage validation. Never argue about points again.' },
  { icon: '&#128194;', title: 'Version History', desc: 'Every bounce, every mix, every take. Full version timeline with instant A/B comparison.' },
  { icon: '&#9889;', title: 'Cloud Bounce', desc: 'Master and export to every platform. WAV, MP3, FLAC, stems bundle. One click distribution.' },
];

const TESTIMONIALS = [
  { quote: 'Producer Studio changed how our crew collaborates. Split calculator alone saved us hours.', name: 'DJ Kael', role: 'Producer / Mixer' },
  { quote: 'The waveform editor is buttery smooth. Finally a browser DAW that feels native.', name: 'Luna', role: 'Vocalist / Songwriter' },
  { quote: 'Live session rooms are insane. We tracked vocals in real-time across three cities.', name: 'MC Drift', role: 'Performer' },
];

const TIERS = [
  { name: 'FREE', price: '$0', tagline: 'for solo beatmakers', features: ['3 sessions', '2 GB storage', '2 stems per track', 'community support'], cta: 'Start Free', variant: 'ghost' as const },
  { name: 'PRO', price: '$19', tagline: 'per seat / month', features: ['unlimited sessions', '100 GB storage', 'unlimited stems', 'live rooms', 'split calculator', 'priority support'], cta: 'Drop a Beat', variant: 'primary' as const, featured: true },
  { name: 'LABEL', price: 'custom', tagline: 'for studios & labels', features: ['unlimited everything', 'SSO + team roles', 'API access', 'white-label bounce', 'dedicated support'], cta: 'Contact Sales', variant: 'ghost' as const },
];

export function HomePage() {
  return (
    <TopNavFooterShell>
      {/* Hero */}
      <section
        style={{
          padding: '5rem 1.5rem 4rem',
          maxWidth: 1100,
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            height: 400,
            background: 'radial-gradient(ellipse, rgba(34,211,238,0.08) 0%, rgba(217,70,239,0.05) 40%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="d-annotation" data-status="info" style={{ marginBottom: '1.25rem', display: 'inline-flex' }}>
            v2.0 — Now with Live Session Rooms
          </div>
          <h1
            className="studio-glow-cyan"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              color: 'var(--d-primary)',
              margin: '0 0 1.25rem',
              letterSpacing: '-0.01em',
              lineHeight: 1.15,
            }}
          >
            Make beats together.<br />Ship music faster.
          </h1>
          <p
            style={{
              fontSize: '1.0625rem',
              color: 'var(--d-text-muted)',
              maxWidth: 620,
              margin: '0 auto 2rem',
              lineHeight: 1.7,
            }}
          >
            A browser-native DAW for producers and engineers. Multi-track waveform editing,
            stem-stack mixing, real-time collaboration, and royalty split management.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="d-interactive neon-glow-hover" data-variant="primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9375rem' }}>
              Start Producing — It's Free
            </Link>
            <Link to="/login" className="d-interactive" data-variant="ghost" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9375rem' }}>
              View Demo
            </Link>
          </div>

          {/* Waveform visualization */}
          <div className="studio-wave" style={{ marginTop: '3rem', padding: '1.5rem', maxWidth: 720, marginInline: 'auto' }}>
            <svg width="100%" height="80" viewBox="0 0 200 80" preserveAspectRatio="none">
              {Array.from({ length: 200 }, (_, i) => {
                const v = Math.sin(i * 0.15) * 0.3 + Math.random() * 0.4 + 0.15;
                const h = v * 35;
                return (
                  <rect key={i} x={i} y={40 - h} width={0.6} height={h * 2} fill="#22D3EE" opacity={0.6} />
                );
              })}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--d-text-muted)', marginTop: '0.5rem' }}>
              <span>0:00</span>
              <span className="d-label" style={{ color: 'var(--d-accent)' }}>&#9835; MIDNIGHT PULSE — 128 BPM / Am</span>
              <span>3:42</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="d-section" style={{ padding: 'var(--d-section-py) 1.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="d-label" style={{ color: 'var(--d-accent)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>CAPABILITIES</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--d-text)' }}>Everything you need to produce</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="d-surface"
              data-interactive
              style={{
                transition: 'transform 200ms ease, border-color 200ms ease',
                cursor: 'default',
              }}
            >
              <div
                style={{
                  width: 48, height: 48, borderRadius: 'var(--d-radius-lg)',
                  background: 'color-mix(in srgb, var(--d-accent) 10%, transparent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.25rem', marginBottom: '0.75rem',
                }}
                dangerouslySetInnerHTML={{ __html: f.icon }}
              />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--d-text)', margin: '0 0 0.375rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="d-section" style={{ padding: 'var(--d-section-py) 1.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="d-label" style={{ color: 'var(--d-accent)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>PRICING</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--d-text)' }}>Plans that scale with your studio</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', alignItems: 'start' }}>
          {TIERS.map((t) => (
            <div
              key={t.name}
              className="d-surface"
              style={{
                border: t.featured ? '1px solid var(--d-primary)' : undefined,
                boxShadow: t.featured ? '0 0 30px rgba(34,211,238,0.15)' : undefined,
                transform: t.featured ? 'scale(1.02)' : undefined,
              }}
            >
              {t.featured && <div className="d-annotation" data-status="info" style={{ marginBottom: '0.75rem' }}>Popular</div>}
              <div className="d-label" style={{ color: t.featured ? 'var(--d-primary)' : 'var(--d-text-muted)', marginBottom: '0.5rem' }}>{t.name}</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--d-primary)', fontFamily: 'ui-monospace, monospace' }} className="neon-text-glow">{t.price}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginBottom: '1rem' }}>{t.tagline}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {t.features.map((f) => (
                  <li key={f} style={{ fontSize: '0.8125rem', color: 'var(--d-text)' }}>
                    <span style={{ color: 'var(--d-primary)' }}>&#10003; </span>{f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="d-interactive"
                data-variant={t.variant}
                style={{ width: '100%', justifyContent: 'center', padding: '0.5rem', fontSize: '0.8125rem' }}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="d-section" style={{ padding: 'var(--d-section-py) 1.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="d-label" style={{ color: 'var(--d-accent)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>TESTIMONIALS</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--d-text)' }}>Loved by producers</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="d-surface"
              style={{
                borderLeft: `3px solid ${i % 2 === 0 ? 'var(--d-primary)' : 'var(--d-accent)'}`,
              }}
            >
              <div style={{ fontSize: '2rem', color: 'var(--d-accent)', opacity: 0.3, marginBottom: '0.5rem' }}>&ldquo;</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--d-text)', fontStyle: 'italic', lineHeight: 1.7, margin: '0 0 1rem' }}>
                {t.quote}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'var(--d-surface-raised)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 600, color: 'var(--d-primary)',
                    border: '2px solid var(--d-primary)',
                  }}
                >
                  {t.name.split(' ').map((w) => w[0]).join('')}
                </div>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--d-text)' }}>{t.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="d-section"
        style={{
          padding: 'var(--d-section-py) 1.5rem',
          maxWidth: 900,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <h2 className="studio-glow-cyan" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--d-primary)', margin: '0 0 0.75rem' }}>
          Ready to drop your next track?
        </h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--d-text-muted)', margin: '0 0 1.5rem' }}>
          Start producing in under a minute. No download required.
        </p>
        <Link to="/register" className="d-interactive neon-glow-hover" data-variant="primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9375rem' }}>
          Start Producing — It's Free
        </Link>
      </section>
    </TopNavFooterShell>
  );
}
