import { Link } from 'react-router-dom';
import { Heart, Eye, Users as UsersIcon, Sparkles } from 'lucide-react';

const team = [
  { name: 'Mira Chen', role: 'Co-founder & CEO', initials: 'MC', color: '#2E8B8B', bio: 'Previously led collaboration at Figma.' },
  { name: 'Jordan Reese', role: 'Co-founder & CTO', initials: 'JR', color: '#E07B4C', bio: 'Real-time systems engineer, ex-Linear.' },
  { name: 'Priya Shah', role: 'Head of Design', initials: 'PS', color: '#B8860B', bio: 'Crafts quiet interfaces that feel like paper.' },
  { name: 'Sam Okafor', role: 'Head of Engineering', initials: 'SO', color: '#8B4789', bio: 'Distributed systems and strong opinions on cursors.' },
];

const values = [
  { icon: Heart, title: 'Trust the team', body: 'We believe teams do their best work when tools stay out of the way.' },
  { icon: Eye, title: 'Clarity over cleverness', body: 'The simplest solution that works is usually the right one.' },
  { icon: UsersIcon, title: 'Together by default', body: 'Collaboration should feel natural, not performative.' },
  { icon: Sparkles, title: 'Small delights', body: 'Care shows up in the quiet details people notice.' },
];

export function AboutPage() {
  return (
    <div className="entrance-fade">
      <section style={{ padding: '5rem 1.5rem 3rem', textAlign: 'center', maxWidth: '48rem', margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 600, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          We build tools for teams that think together.
        </h1>
        <p style={{ fontSize: '1.0625rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
          Lumen started as a shared notebook between four friends. It grew into a workspace thousands of teams reach for every day.
        </p>
      </section>

      <section style={{ padding: '2rem 1.5rem 3rem', maxWidth: '48rem', margin: '0 auto' }}>
        <div className="paper-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 600, marginBottom: '0.75rem' }}>Our story</h2>
          <p style={{ color: 'var(--d-text)', lineHeight: 1.7, marginBottom: '1rem' }}>
            In 2023, we were tired of bouncing between six tools to plan a single project. Docs here, tasks there, comments somewhere else. Nobody knew where the decision lived.
          </p>
          <p style={{ color: 'var(--d-text)', lineHeight: 1.7 }}>
            So we built Lumen — one quiet place for writing, planning, and deciding, with real-time collaboration built in from the first line. No modes, no tabs, just a shared page tree and presence that feels alive.
          </p>
        </div>
      </section>

      <section style={{ padding: '3rem 1.5rem', maxWidth: '56rem', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>What we value</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {values.map(v => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="paper-card" style={{ padding: '1.25rem' }}>
                <Icon size={20} style={{ color: 'var(--d-primary)', marginBottom: '0.625rem' }} />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.25rem' }}>{v.title}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', lineHeight: 1.5 }}>{v.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ padding: '3rem 1.5rem', maxWidth: '56rem', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>The team</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {team.map(m => (
            <div key={m.name} className="paper-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <span className="presence-avatar presence-avatar-lg" style={{ background: m.color, margin: '0 auto 0.75rem', display: 'inline-flex' }}>{m.initials}</span>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{m.name}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--d-primary)', marginBottom: '0.5rem' }}>{m.role}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', lineHeight: 1.5 }}>{m.bio}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '3rem 1.5rem 6rem', textAlign: 'center', maxWidth: '48rem', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>Join us on the journey.</h2>
        <p style={{ color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>We\'re hiring kind, curious people who love craft.</p>
        <Link to="/contact" className="d-interactive" style={{ padding: '0.5rem 1rem', textDecoration: 'none' }}>Get in touch</Link>
      </section>
    </div>
  );
}
