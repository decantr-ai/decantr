import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, Heart, Video, Pill, FolderLock, Shield,
  ArrowRight, Check,
} from 'lucide-react';
import { marketingFeatures, marketingStats, testimonials } from '@/data/mock';
import { useAuth } from '@/hooks/useAuth';

const iconMap: Record<string, React.ElementType> = {
  calendar: Calendar,
  heart: Heart,
  video: Video,
  pill: Pill,
  folder: FolderLock,
  shield: Shield,
};

export function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const cta = () => navigate(isAuthenticated ? '/dashboard' : '/register');

  return (
    <div>
      {/* Top nav */}
      <nav className="hw-nav">
        <Link
          to="/"
          style={{
            fontWeight: 700, fontSize: '1.0625rem', display: 'flex', alignItems: 'center',
            gap: '0.625rem', color: 'var(--d-text)', textDecoration: 'none',
          }}
        >
          <div style={{
            width: 32, height: 32,
            borderRadius: 'var(--d-radius)',
            background: 'linear-gradient(135deg, var(--d-primary), var(--d-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Heart size={17} color="#fff" fill="#fff" />
          </div>
          Evergreen
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          <a href="#features" style={{ fontSize: '0.9375rem', color: 'var(--d-text)', textDecoration: 'none', fontWeight: 500 }}>Features</a>
          <a href="#patients" style={{ fontSize: '0.9375rem', color: 'var(--d-text)', textDecoration: 'none', fontWeight: 500 }}>For Patients</a>
          <a href="#privacy" style={{ fontSize: '0.9375rem', color: 'var(--d-text)', textDecoration: 'none', fontWeight: 500 }}>Privacy</a>
          <Link to="/login" style={{ fontSize: '0.9375rem', color: 'var(--d-text)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
          <button className="hw-button-primary" onClick={cta} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            Get started <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero — split */}
      <section className="hw-hero">
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div className="d-annotation" data-status="info" style={{ marginBottom: '1.25rem', fontSize: '0.8125rem', padding: '0.375rem 0.875rem' }}>
              HIPAA-compliant · End-to-end encrypted
            </div>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 700, lineHeight: 1.1,
              marginBottom: '1.25rem', letterSpacing: '-0.02em', color: 'var(--d-text)',
            }}>
              Your health,<br />
              <span style={{ color: 'var(--d-primary)' }}>clearly organized</span>.
            </h1>
            <p style={{ fontSize: '1.1875rem', lineHeight: 1.6, color: 'var(--d-text-muted)', marginBottom: '2rem', maxWidth: 520 }}>
              Book appointments, track vitals, message your care team, and access every record — all in one calm, trustworthy place designed for real patients.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="hw-button-primary" onClick={cta} style={{ padding: '0.875rem 1.75rem', fontSize: '1rem' }}>
                Create your account <ArrowRight size={18} />
              </button>
              <a href="#features" className="d-interactive" style={{ padding: '0.875rem 1.75rem', fontSize: '1rem', fontWeight: 600 }}>
                See how it works
              </a>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem', fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                <Check size={16} style={{ color: 'var(--d-success)' }} aria-hidden /> Free for patients
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                <Check size={16} style={{ color: 'var(--d-success)' }} aria-hidden /> No credit card
              </span>
            </div>
          </div>

          {/* Illustration block */}
          <div className="hw-hero-illus" aria-hidden style={{
            padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%', maxWidth: 420,
            }}>
              <div className="hw-card" style={{ padding: '1rem' }}>
                <div className="d-label" style={{ marginBottom: '0.375rem' }}>Heart Rate</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1 }}>68 <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--d-text-muted)' }}>bpm</span></div>
                <div className="hw-vital-status" data-status="normal" style={{ marginTop: '0.625rem', fontSize: '0.75rem' }}>Normal</div>
              </div>
              <div className="hw-card" style={{ padding: '1rem' }}>
                <div className="d-label" style={{ marginBottom: '0.375rem' }}>Blood Pressure</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1 }}>118/76</div>
                <div className="hw-vital-status" data-status="normal" style={{ marginTop: '0.625rem', fontSize: '0.75rem' }}>Normal</div>
              </div>
              <div className="hw-card" style={{ gridColumn: '1 / -1', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="hw-avatar" style={{ width: 40, height: 40, fontSize: '0.875rem' }}>MP</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Dr. Mira Patel</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>Tomorrow · 10:30 AM · Video visit</div>
                  </div>
                  <Video size={20} style={{ color: 'var(--d-primary)' }} aria-hidden />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section style={{ padding: '3rem 2rem', borderTop: '1px solid var(--d-border)', borderBottom: '1px solid var(--d-border)', background: 'var(--d-surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            {marketingStats.map(s => (
              <div key={s.label}>
                <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--d-primary)', letterSpacing: '-0.01em' }}>
                  {s.value}
                </div>
                <div className="d-label" style={{ marginTop: '0.375rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" style={{ padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 600, marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>
              Everything your care deserves
            </h2>
            <p style={{ fontSize: '1.0625rem', color: 'var(--d-text-muted)', maxWidth: 580, margin: '0 auto', lineHeight: 1.6 }}>
              Built for patients, reviewed by clinicians, and designed to make your health feel manageable.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {marketingFeatures.map(f => {
              const Icon = iconMap[f.icon] || Heart;
              return (
                <div key={f.title} className="hw-card" style={{ padding: '1.5rem' }}>
                  <div style={{
                    width: 48, height: 48,
                    borderRadius: 'var(--d-radius-lg)',
                    background: 'color-mix(in srgb, var(--d-primary) 12%, transparent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1rem',
                  }}>
                    <Icon size={24} style={{ color: 'var(--d-primary)' }} aria-hidden />
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>{f.title}</h3>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="patients" style={{ padding: '5rem 2rem', background: 'var(--d-surface)', borderTop: '1px solid var(--d-border)', borderBottom: '1px solid var(--d-border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
              Patients who trust Evergreen
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--d-text-muted)' }}>Real stories from the people we serve.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {testimonials.map(t => (
              <div key={t.author} className="hw-card" style={{ padding: '1.5rem' }}>
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: '1.25rem', color: 'var(--d-text)' }}>
                  "{t.quote}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="hw-avatar" style={{ width: 40, height: 40, fontSize: '0.875rem' }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{t.author}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section id="privacy" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <Shield size={40} style={{ color: 'var(--d-primary)', margin: '0 auto 1.25rem' }} aria-hidden />
          <h2 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.01em' }}>
            Your data. Your control.
          </h2>
          <p style={{ fontSize: '1.0625rem', color: 'var(--d-text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
            HIPAA-compliant, end-to-end encrypted, and audited annually. You decide who sees your records and for how long.
          </p>
          <button className="hw-button-primary" onClick={cta} style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
            Join Evergreen today <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--d-border)', padding: '3rem 2rem 2rem', background: 'var(--d-surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2.5rem', marginBottom: '2rem' }}>
            {[
              { heading: 'Product', links: ['Features', 'For patients', 'Providers', 'Mobile app'] },
              { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { heading: 'Resources', links: ['Help center', 'Accessibility', 'Security', 'Contact'] },
              { heading: 'Legal', links: ['Privacy', 'Terms', 'HIPAA notice', 'Patient rights'] },
            ].map(col => (
              <div key={col.heading}>
                <div className="d-label" style={{ marginBottom: '0.875rem' }}>{col.heading}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {col.links.map(link => (
                    <a key={link} href="#" style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--d-border)', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
              © 2026 Evergreen Health. All rights reserved. Not a medical device.
            </span>
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              {['Twitter', 'LinkedIn', 'YouTube'].map(s => (
                <a key={s} href="#" style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
