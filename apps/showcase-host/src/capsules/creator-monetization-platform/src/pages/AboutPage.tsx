import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Heart, Shield, Users } from 'lucide-react';

const team = [
  { name: 'Ava Morales', role: 'Co-founder, CEO', avatar: 'https://i.pravatar.cc/120?img=44' },
  { name: 'Rei Tanaka', role: 'Co-founder, CTO', avatar: 'https://i.pravatar.cc/120?img=52' },
  { name: 'Sam Ibarra', role: 'Head of Creator Success', avatar: 'https://i.pravatar.cc/120?img=25' },
  { name: 'Priya Khanna', role: 'Design Director', avatar: 'https://i.pravatar.cc/120?img=37' },
];

const values = [
  { icon: Heart, title: 'Creator-first', body: 'Every product decision starts with "what does this mean for the creator?"' },
  { icon: Shield, title: 'Transparent', body: 'Our fees, our policies, our roadmap — all public.' },
  { icon: Users, title: 'Community', body: 'We build for people making things together, not platforms extracting value.' },
];

export function AboutPage() {
  return (
    <div className="entrance-fade" style={{ fontFamily: 'system-ui, sans-serif' }}>
      <section className="studio-hero-gradient" style={{ padding: '5rem 1.5rem 4rem' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <h1 className="serif-display" style={{ fontSize: '2.75rem', marginBottom: '1rem' }}>We're building the platform we wished existed</h1>
          <p style={{ fontSize: '1.0625rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
            Canvas started as a frustration: we watched friends do extraordinary creative work and never get paid fairly for it. In 2023 we set out to build something warmer.
          </p>
        </div>
      </section>

      <section style={{ padding: '4rem 1.5rem', background: 'var(--d-surface)' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <h2 className="serif-display" style={{ fontSize: '1.875rem', marginBottom: '2rem', textAlign: 'center' }}>What we believe</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {values.map((v) => (
              <div key={v.title} className="studio-card" style={{ padding: '1.5rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #DDD6FE, #C4B5FD)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.875rem' }}>
                  <v.icon size={20} style={{ color: '#5B21B6' }} />
                </div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.375rem' }}>{v.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', lineHeight: 1.55 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <h2 className="serif-display" style={{ fontSize: '1.875rem', marginBottom: '2rem', textAlign: 'center' }}>The people building Canvas</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            {team.map((m) => (
              <div key={m.name} className="studio-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                <img src={m.avatar} alt={m.name} width={72} height={72} style={{ borderRadius: '50%', margin: '0 auto 0.75rem' }} />
                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{m.name}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>{m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="studio-hero-gradient" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 className="serif-display" style={{ fontSize: '1.875rem', marginBottom: '0.75rem' }}>Ready to start?</h2>
        <p style={{ color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>Your first post is on us.</p>
        <Link to="/register" className="d-interactive studio-glow" data-variant="primary"
          style={{ padding: '0.75rem 1.5rem', textDecoration: 'none', fontSize: '0.9375rem' }}>Create your Canvas</Link>
      </section>
    </div>
  );
}
