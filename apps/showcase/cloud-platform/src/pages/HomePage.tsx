import { useNavigate } from 'react-router-dom';
import {
  Rocket, Globe, Shield, Database, Zap, BarChart2,
  GitBranch, Layers, Terminal, Users, ArrowRight, ChevronRight,
} from 'lucide-react';
import { platformFeatures, platformCapabilities, platformStats, techLogos } from '@/data/mock';
import { useAuth } from '@/hooks/useAuth';

const iconMap: Record<string, React.ElementType> = {
  rocket: Rocket, globe: Globe, shield: Shield, database: Database,
  zap: Zap, 'bar-chart-2': BarChart2, 'git-branch': GitBranch,
  layers: Layers, terminal: Terminal, users: Users,
};

export function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleCta = () => navigate(isAuthenticated ? '/apps' : '/login');

  return (
    <div>
      {/* Nav */}
      <nav className="lp-nav">
        <span style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--d-text)' }}>
          <Rocket size={20} style={{ color: 'var(--d-primary)' }} />
          CloudDeck
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a href="#/login" style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>Sign In</a>
          <button className="lp-button-primary" onClick={handleCta} style={{ padding: '0.375rem 1rem', fontSize: '0.875rem' }}>
            Deploy Now <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="lp-header" role="banner">
        <div className="lp-orb lp-orb-1" />
        <div className="lp-orb lp-orb-2" />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
          <div className="d-annotation" data-status="info" style={{ marginBottom: '1.25rem', display: 'inline-flex' }}>
            New: Multi-region deploys now available <ChevronRight size={12} />
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '1.25rem' }}>
            Deploy at the speed of <span style={{ color: 'var(--d-primary)' }}>thought</span>
          </h1>
          <p style={{ fontSize: '1.125rem', lineHeight: 1.7, color: 'var(--d-text-muted)', maxWidth: 600, margin: '0 auto 2rem' }}>
            The cloud platform built for modern engineering teams. Push to deploy, scale globally, and monitor everything — all from one console.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="lp-button-primary" onClick={handleCta} style={{ padding: '0.625rem 1.5rem' }}>
              Deploy Now <ArrowRight size={16} />
            </button>
            <button className="d-interactive" data-variant="ghost" onClick={() => navigate(isAuthenticated ? '/apps' : '/register')} style={{ padding: '0.625rem 1.5rem' }}>
              View Demo
            </button>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="d-section" style={{ padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, textAlign: 'center', marginBottom: '0.5rem' }}>
            Everything you need to ship
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--d-text-muted)', marginBottom: '3rem', maxWidth: 500, margin: '0 auto 3rem' }}>
            A complete platform for deploying, scaling, and monitoring your applications.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {platformFeatures.map(f => {
              const Icon = iconMap[f.icon] || Zap;
              return (
                <div key={f.title} className="lp-card-elevated" style={{ padding: 'var(--d-surface-p)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--d-radius)', background: 'color-mix(in srgb, var(--d-primary) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                    <Icon size={20} style={{ color: 'var(--d-primary)' }} />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.375rem' }}>{f.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech Logos */}
      <section style={{ padding: '3rem 2rem', borderTop: '1px solid var(--d-border)', borderBottom: '1px solid var(--d-border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p className="d-label" style={{ marginBottom: '1.5rem' }}>Works with your stack</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem' }}>
            {techLogos.map(logo => (
              <span key={logo} style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', fontWeight: 500 }}>{logo}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="d-section" style={{ padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, textAlign: 'center', marginBottom: '3rem' }}>
            Built for scale
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
            {platformCapabilities.map(c => {
              const Icon = iconMap[c.icon] || Zap;
              return (
                <div key={c.title} className="lp-card-elevated" style={{ padding: 'var(--d-surface-p)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--d-radius)', background: 'color-mix(in srgb, var(--d-accent) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                    <Icon size={18} style={{ color: 'var(--d-accent)' }} />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.375rem' }}>{c.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>{c.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="lp-gradient-mesh" style={{ padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '3rem' }}>Trusted at scale</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem' }}>
            {platformStats.map(s => (
              <div key={s.label}>
                <div className="mono-data" style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--d-primary)' }}>{s.value}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="d-section" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
            Ready to deploy?
          </h2>
          <p style={{ fontSize: '1.125rem', color: 'var(--d-text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
            Join 340,000+ developers shipping faster with CloudDeck. Start free, scale when you need to.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="lp-button-primary" onClick={handleCta} style={{ padding: '0.625rem 1.5rem' }}>
              Deploy Now <ArrowRight size={16} />
            </button>
            <button className="d-interactive" data-variant="ghost" style={{ padding: '0.625rem 1.5rem' }}>
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--d-border)', padding: '3rem 2rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            {[
              { heading: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Docs'] },
              { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { heading: 'Resources', links: ['Documentation', 'Guides', 'API Reference', 'Status'] },
              { heading: 'Legal', links: ['Privacy', 'Terms', 'DPA', 'SLA'] },
            ].map(col => (
              <div key={col.heading}>
                <div className="d-label" style={{ marginBottom: '0.75rem' }}>{col.heading}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  {col.links.map(link => (
                    <a key={link} href="#" style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--d-border)', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>2026 CloudDeck. All rights reserved.</span>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {['GitHub', 'Twitter', 'Discord'].map(s => (
                <a key={s} href="#" style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
