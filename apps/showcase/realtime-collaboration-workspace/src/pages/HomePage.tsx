import { Link } from 'react-router-dom';
import { Users, MessageSquare, Clock, Zap, Check } from 'lucide-react';
import { collaborators } from '../data/mock';

export function HomePage() {
  return (
    <div className="entrance-fade">
      {/* Hero */}
      <section style={{ padding: '5rem 1.5rem 4rem', textAlign: 'center', maxWidth: '56rem', margin: '0 auto' }}>
        <div className="chip chip-primary" style={{ marginBottom: '1.25rem' }}>New · Real-time presence</div>
        <h1 style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', fontWeight: 600, lineHeight: 1.15, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          Where your team thinks together.
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--d-text-muted)', lineHeight: 1.6, maxWidth: '36rem', margin: '0 auto 2rem' }}>
          Lumen is a distraction-free workspace for writing, planning, and deciding — together, in real time.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="d-interactive" style={{ padding: '0.625rem 1.25rem', fontSize: '0.9375rem', textDecoration: 'none', background: 'var(--d-primary)', color: '#fff', borderColor: 'var(--d-primary)' }}>
            Create a workspace
          </Link>
          <Link to="/pricing" className="d-interactive" style={{ padding: '0.625rem 1.25rem', fontSize: '0.9375rem', textDecoration: 'none' }}>
            See pricing
          </Link>
        </div>
        <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          <div className="presence-stack">
            {collaborators.slice(0, 5).map(c => (
              <span key={c.id} className="presence-avatar" style={{ background: c.color }}>{c.initials}</span>
            ))}
          </div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
            Joined by 4,200+ collaborative teams
          </span>
        </div>
      </section>

      {/* Feature grid */}
      <section style={{ padding: '3rem 1.5rem', maxWidth: '64rem', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {[
            { icon: Users, title: 'Live presence', body: 'See who\'s reading, writing, and thinking alongside you — every cursor has a name.' },
            { icon: MessageSquare, title: 'Inline comments', body: 'Talk in the margins. Resolve threads together. Never lose context.' },
            { icon: Clock, title: 'Version history', body: 'Every change is captured. Restore any moment. Never lose work silently.' },
            { icon: Zap, title: 'Slash commands', body: 'Type / anywhere. Insert headings, lists, quotes, and more without leaving the keyboard.' },
          ].map(f => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="paper-card" style={{ padding: '1.25rem' }}>
                <Icon size={22} style={{ color: 'var(--d-primary)', marginBottom: '0.75rem' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.375rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', lineHeight: 1.55 }}>{f.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Collaboration showcase */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: '56rem', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.75rem' }}>Built for real-time teamwork</h2>
          <p style={{ color: 'var(--d-text-muted)' }}>Watch changes as they happen, not after the meeting.</p>
        </div>
        <div className="paper-card-raised" style={{ padding: '1.25rem', background: 'var(--d-surface-raised)' }}>
          <div style={{ background: 'var(--d-surface)', padding: '1.5rem', borderRadius: '6px', border: '1px solid var(--d-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div className="presence-stack">
                {collaborators.slice(0, 3).map(c => (
                  <span key={c.id} className="presence-avatar presence-avatar-sm" style={{ background: c.color }}>
                    {c.initials}<span className="presence-dot active" />
                  </span>
                ))}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>3 editing now</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Q2 Planning</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', lineHeight: 1.6, marginBottom: '0.5rem' }}>
              We're aligning on <span className="comment-annotation">three priorities</span> for the quarter. Mira is writing the goals section while Jordan outlines the timeline.
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
              Comments roll in the margin. Decisions stay with the document.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: '56rem', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.75rem' }}>Simple, team-friendly pricing</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {[
            { name: 'Free', price: '$0', desc: 'For small teams getting started', features: ['Up to 5 members', '10 docs', 'Basic comments'] },
            { name: 'Team', price: '$12', desc: 'For growing teams', features: ['Unlimited members', 'Unlimited docs', 'Version history', 'Integrations'], featured: true },
            { name: 'Enterprise', price: 'Custom', desc: 'For large organizations', features: ['SSO & SCIM', 'Audit logs', 'Dedicated support'] },
          ].map(t => (
            <div key={t.name} className="paper-card" style={{ padding: '1.5rem', borderColor: t.featured ? 'var(--d-primary)' : undefined, borderWidth: t.featured ? 2 : 1 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t.name}</h3>
              <div style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t.price}<span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--d-text-muted)' }}>{t.price !== 'Custom' ? ' /user/mo' : ''}</span></div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginBottom: '1rem' }}>{t.desc}</p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {t.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                    <Check size={14} style={{ color: 'var(--d-primary)' }} /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '4rem 1.5rem 6rem', textAlign: 'center', maxWidth: '48rem', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.75rem' }}>Start writing together today.</h2>
        <p style={{ color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>Create a workspace in under a minute — no credit card needed.</p>
        <Link to="/register" className="d-interactive" style={{ padding: '0.625rem 1.25rem', fontSize: '0.9375rem', textDecoration: 'none', background: 'var(--d-primary)', color: '#fff', borderColor: 'var(--d-primary)' }}>
          Create your workspace
        </Link>
      </section>
    </div>
  );
}
