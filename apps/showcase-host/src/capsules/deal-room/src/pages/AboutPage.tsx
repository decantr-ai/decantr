import { NavLink } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';

export function AboutPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '4rem 2rem' }}>
      <h1 className="serif-display" style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
        About Meridian
      </h1>
      <div className="dr-gold-divider" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '1rem', color: 'var(--d-text-muted)', lineHeight: 1.75 }}>
        <p>
          Meridian Capital Partners was founded on the principle that deal execution should be as rigorous as deal sourcing. Our platform provides institutional-grade infrastructure for the most sensitive phase of every transaction.
        </p>
        <p>
          With over $180 billion in deals closed through our platform, we serve the world's leading private equity firms, infrastructure funds, and sovereign wealth funds. Every document watermarked. Every access logged. Every question tracked.
        </p>
        <div className="dr-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1rem' }}>
          <Shield size={40} style={{ color: 'var(--d-primary)', flexShrink: 0 }} />
          <div>
            <h3 className="serif-display" style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--d-text)' }}>
              SOC 2 Type II Certified
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)' }}>
              Our security posture is independently audited annually. AES-256 encryption, TLS 1.3, and zero-knowledge architecture.
            </p>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <NavLink to="/register" className="dr-button-primary" style={{ textDecoration: 'none', padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}>
          Get Started <ArrowRight size={14} />
        </NavLink>
      </div>
    </div>
  );
}
