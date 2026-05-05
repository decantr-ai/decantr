import { Link } from 'react-router-dom';
import { Hero } from '@/components/Hero';
import { CardGrid } from '@/components/CardGrid';
import { guildPerks, testimonials } from '@/data/mock';
import { Trophy, Users, TrendingUp, Shield, Zap, Gem, ArrowRight, Quote } from 'lucide-react';

const perkIcons: Record<string, typeof Trophy> = {
  trophy: Trophy,
  users: Users,
  'trending-up': TrendingUp,
  shield: Shield,
  zap: Zap,
  gem: Gem,
};

export function JoinGuildPage() {
  return (
    <div className="gg-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-8)' }}>
      {/* Join Hero */}
      <Hero
        badge="Open Recruitment"
        headline="Join the Elite"
        description="Become part of the fastest-growing gaming guild. Compete in tournaments, climb the ranks, and unlock exclusive rewards."
      >
        <Link to="/register" className="d-interactive" data-variant="primary" style={{ textDecoration: 'none' }}>
          Claim Your Spot <ArrowRight size={16} />
        </Link>
        <Link to="/community" className="d-interactive" data-variant="ghost" style={{ textDecoration: 'none' }}>
          Explore Community
        </Link>
      </Hero>

      {/* Perks Grid (icon preset card-grid) */}
      <div className="d-section" data-density="compact">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Guild Perks</h2>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>Everything you get as a member.</p>
        </div>
        <CardGrid columns="repeat(auto-fill, minmax(280px, 1fr))">
          {guildPerks.map(perk => {
            const Icon = perkIcons[perk.icon] || Zap;
            return (
              <div key={perk.title} className="d-surface" style={{ padding: 'var(--d-surface-p)', textAlign: 'center' }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--d-radius)',
                  background: 'color-mix(in srgb, var(--d-primary) 12%, transparent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                }}>
                  <Icon size={22} style={{ color: 'var(--d-primary)' }} />
                </div>
                <h3 style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: '0.375rem' }}>{perk.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>{perk.description}</p>
              </div>
            );
          })}
        </CardGrid>
      </div>

      {/* Testimonials */}
      <div className="d-section" data-density="compact" style={{
        background: 'linear-gradient(180deg, var(--d-bg), color-mix(in srgb, var(--d-surface) 30%, var(--d-bg)))',
        borderRadius: 'var(--d-radius-lg)',
        padding: '2rem',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>What Warriors Say</h2>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem' }}>Hear from our guild members.</p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--d-gap-4)',
        }}>
          {testimonials.map((t, i) => {
            const borderColors = ['var(--d-primary)', 'var(--d-accent)', 'var(--d-secondary, #06d6a0)'];
            return (
              <div
                key={t.id}
                className="d-surface"
                style={{
                  padding: '1.5rem',
                  borderLeft: `3px solid ${borderColors[i % borderColors.length]}`,
                }}
              >
                <Quote size={24} style={{ color: 'color-mix(in srgb, var(--d-primary) 30%, transparent)', marginBottom: '0.75rem' }} />
                <p style={{ fontStyle: 'italic', lineHeight: 1.7, fontSize: '0.875rem', marginBottom: '1rem' }}>
                  "{t.quote}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--d-radius-full)',
                    background: 'var(--d-surface-raised)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    outline: '2px solid var(--d-primary)',
                    outlineOffset: 2,
                    color: 'var(--d-text-muted)',
                  }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{t.author}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="d-section" style={{ textAlign: 'center', padding: '3rem 0' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>Ready to compete?</h2>
        <p style={{ color: 'var(--d-text-muted)', maxWidth: 480, margin: '0 auto 1.5rem', lineHeight: 1.6, fontSize: '0.875rem' }}>
          Join thousands of players already climbing the ranks. Your legend starts now.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="d-interactive neon-glow-hover" data-variant="primary" style={{ textDecoration: 'none' }}>
            Claim Your Spot <ArrowRight size={16} />
          </Link>
          <Link to="/games" className="d-interactive" data-variant="ghost" style={{ textDecoration: 'none' }}>
            Explore Games
          </Link>
        </div>
      </div>
    </div>
  );
}
