import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { SettingsNav } from '@/components/SettingsNav';

export function SettingsPreferencesPage() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [tradeNotifs, setTradeNotifs] = useState(true);
  const [govNotifs, setGovNotifs] = useState(true);
  const [divNotifs, setDivNotifs] = useState(true);

  function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          width: 36,
          height: 20,
          borderRadius: 'var(--d-radius-full)',
          background: checked ? 'var(--d-primary)' : 'var(--d-surface-raised)',
          border: '1px solid var(--d-border)',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 150ms ease',
          flexShrink: 0,
        }}
      >
        <div style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: '#fff',
          position: 'absolute',
          top: 2,
          left: checked ? 19 : 2,
          transition: 'left 150ms ease',
        }} />
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '42rem' }}>
      <PageHeader title="Settings" description="Manage your profile, security, and investment preferences." />
      <SettingsNav />

      <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Notifications</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)', marginBottom: '1rem' }}>Configure how you receive updates.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { label: 'Email notifications', desc: 'Receive all notifications via email', checked: emailNotifs, set: setEmailNotifs },
            { label: 'Trade confirmations', desc: 'Get notified when orders fill', checked: tradeNotifs, set: setTradeNotifs },
            { label: 'Governance alerts', desc: 'New ballots and voting deadlines', checked: govNotifs, set: setGovNotifs },
            { label: 'Dividend distributions', desc: 'Upcoming and paid distributions', checked: divNotifs, set: setDivNotifs },
          ].map(n => (
            <div key={n.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{n.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{n.desc}</div>
              </div>
              <Toggle checked={n.checked} onChange={n.set} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
