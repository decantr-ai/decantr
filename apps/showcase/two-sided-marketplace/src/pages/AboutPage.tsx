import { Link } from 'react-router-dom';
import { ArrowRight, HeartHandshake, Users, Globe } from 'lucide-react';

export function AboutPage() {
  return (
    <div>
      <section className="nm-hero">
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="nm-badge" style={{ marginBottom: '1rem' }}>Our story</div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, lineHeight: 1.15, marginBottom: '1rem' }}>
            Built on trust, <span className="nm-gradient-text">balanced by design</span>.
          </h1>
          <p style={{ color: 'var(--d-text-muted)', fontSize: '1.1rem', maxWidth: 620, margin: '0 auto' }}>
            Nestable is a marketplace for unique places to stay — one that serves hosts and guests equally. We started in 2019 with a simple belief: better stays happen when both sides thrive.
          </p>
        </div>
      </section>

      <section style={{ padding: '4rem 2rem', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
          <Principle icon={<HeartHandshake size={22} />} title="Fair fees" body="Hosts keep 97% of every dollar. No surprise deductions, no payout games." />
          <Principle icon={<Users size={22} />} title="Real people" body="Every host and guest is verified. We read every review. We talk to real humans." />
          <Principle icon={<Globe size={22} />} title="Local-first" body="We prioritize independent hosts and unique spaces over corporate inventory." />
        </div>
      </section>

      <section style={{ padding: '3rem 2rem 5rem', textAlign: 'center' }}>
        <Link to="/browse" className="nm-button-primary" style={{ padding: '0.875rem 1.75rem', fontSize: '0.95rem' }}>
          Start exploring <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}

function Principle({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="nm-card">
      <div style={{ width: 44, height: 44, borderRadius: 'var(--d-radius)', background: 'color-mix(in srgb, var(--d-primary) 10%, transparent)', color: 'var(--d-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.875rem' }}>
        {icon}
      </div>
      <div style={{ fontWeight: 600, marginBottom: '0.35rem' }}>{title}</div>
      <div style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>{body}</div>
    </div>
  );
}
