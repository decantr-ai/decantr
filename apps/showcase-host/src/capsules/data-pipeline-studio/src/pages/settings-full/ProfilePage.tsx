import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TerminalSplitShell } from '@/components/TerminalSplitShell';

const SETTINGS_NAV = [
  { label: 'Profile', to: '/settings/profile' },
  { label: 'Security', to: '/settings/security' },
  { label: 'Preferences', to: '/settings/preferences' },
  { label: 'Danger Zone', to: '/settings/danger' },
];

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.4rem 0.625rem',
  background: 'var(--d-bg)',
  border: '1px solid var(--d-border)',
  color: 'var(--d-text)',
  fontFamily: 'inherit',
  fontSize: '0.8125rem',
  outline: 'none',
  borderRadius: 0,
};

export function SettingsNav() {
  const location = useLocation();
  return (
    <aside className="term-panel" style={{ width: 180, padding: '0.5rem', flexShrink: 0, height: 'fit-content' }}>
      <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '0.5rem' }}>// SETTINGS</div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
        {SETTINGS_NAV.map((n) => {
          const active = location.pathname === n.to;
          return (
            <Link
              key={n.to}
              to={n.to}
              style={{
                padding: '0.375rem 0.5rem',
                fontSize: '0.75rem',
                color: active ? 'var(--d-bg)' : 'var(--d-text-muted)',
                background: active ? 'var(--d-primary)' : 'transparent',
              }}
            >
              {active ? '> ' : '  '}
              {n.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function ProfilePage() {
  const [name, setName] = useState('Jane Doe');
  const [email, setEmail] = useState('jane@acme.io');
  const [title, setTitle] = useState('Senior Data Engineer');

  return (
    <TerminalSplitShell title="SETTINGS // profile">
      <div style={{ flex: 1, display: 'flex', gap: '0.5rem', overflow: 'auto' }}>
        <SettingsNav />
        <div style={{ flex: 1, maxWidth: 680 }}>
          <h1 className="term-glow" style={{ fontSize: '1rem', color: 'var(--d-primary)', margin: '0 0 1rem' }}>
            $ profile
          </h1>

          <section className="term-panel" style={{ padding: '0.875rem 1rem', marginBottom: '0.75rem' }}>
            <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '0.625rem' }}>// IDENTITY</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <div><label className="d-label">NAME</label><input value={name} onChange={(e) => setName(e.target.value)} style={{ ...inputStyle, marginTop: '0.25rem' }} /></div>
              <div><label className="d-label">EMAIL</label><input value={email} onChange={(e) => setEmail(e.target.value)} style={{ ...inputStyle, marginTop: '0.25rem' }} /></div>
              <div><label className="d-label">TITLE</label><input value={title} onChange={(e) => setTitle(e.target.value)} style={{ ...inputStyle, marginTop: '0.25rem' }} /></div>
            </div>
          </section>

          <section className="term-panel" style={{ padding: '0.875rem 1rem', marginBottom: '0.75rem' }}>
            <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '0.625rem' }}>// AVATAR</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                className="term-glow"
                style={{
                  width: 60, height: 60,
                  border: '1px solid var(--d-primary)',
                  color: 'var(--d-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: 700,
                }}
              >
                JD
              </div>
              <button className="d-interactive" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem', borderRadius: 0 }}>Upload</button>
            </div>
          </section>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button className="d-interactive" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem', borderRadius: 0 }}>Cancel</button>
            <button className="d-interactive" data-variant="primary" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem', borderRadius: 0 }}>&gt; Save</button>
          </div>
        </div>
      </div>
    </TerminalSplitShell>
  );
}
