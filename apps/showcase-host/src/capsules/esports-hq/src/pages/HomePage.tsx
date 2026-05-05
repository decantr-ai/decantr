import { useNavigate } from 'react-router-dom';
import { Hero } from '@/components/Hero';
import { Users, Calendar, Video, BarChart3, Handshake, Shield } from 'lucide-react';
import { testimonials, marketingFeatures } from '@/data/mock';

const iconMap: Record<string, typeof Users> = {
  users: Users,
  calendar: Calendar,
  video: Video,
  'bar-chart': BarChart3,
  handshake: Handshake,
  shield: Shield,
};

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero */}
      <Hero
        badge="Esports Operations Platform"
        headline="Run Your Team Like a Pro Org"
        description="Player form tracking, scrim scheduling, VOD review with annotations, and sponsor dashboards. Everything your coaching staff needs in one place."
      >
        <button className="d-interactive" data-variant="primary" onClick={() => navigate('/register')} style={{ fontSize: '0.9rem' }}>
          Get Started Free
        </button>
        <button className="d-interactive" onClick={() => navigate('/login')} style={{ fontSize: '0.9rem' }}>
          Sign In
        </button>
      </Hero>

      {/* Features grid */}
      <section className="d-section" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>Everything Your Team Needs</h2>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '1rem', maxWidth: 480, margin: '0 auto' }}>
            Built by coaches, for coaches. Every tool designed for competitive esports.
          </p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--d-gap-6)',
        }}>
          {marketingFeatures.map((feature, i) => {
            const Icon = iconMap[feature.icon] || Shield;
            return (
              <div
                key={feature.title}
                className="d-surface neon-glow-hover"
                data-interactive
                style={{
                  padding: '1.5rem',
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--d-radius)',
                  background: 'color-mix(in srgb, var(--d-primary) 12%, transparent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}>
                  <Icon size={22} style={{ color: 'var(--d-primary)' }} />
                </div>
                <h3 style={{ fontWeight: 600, marginBottom: '0.375rem' }}>{feature.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="d-section" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Trusted by Teams</h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--d-gap-4)',
        }}>
          {testimonials.map(t => (
            <div key={t.id} className="d-surface" style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1rem', fontStyle: 'italic', color: 'var(--d-text-muted)' }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--d-radius-full)',
                  background: 'linear-gradient(135deg, var(--d-primary), var(--d-accent))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                }}>
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{t.author}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="d-section" style={{ textAlign: 'center', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.75rem' }}>Ready to Level Up?</h2>
        <p style={{ color: 'var(--d-text-muted)', marginBottom: '1.5rem', maxWidth: 420, margin: '0 auto 1.5rem' }}>
          Join teams already using Esports HQ to dominate their competition.
        </p>
        <button className="d-interactive neon-glow" data-variant="primary" onClick={() => navigate('/register')} style={{ fontSize: '1rem', padding: '0.625rem 2rem' }}>
          Start Free Trial
        </button>
      </section>
    </div>
  );
}
